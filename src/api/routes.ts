import { Request, Response, Router } from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { asyncRoute } from "../utils/async";

const router = Router();
const jsonParser = bodyParser.json();

router.post(
  "/webhook",
  jsonParser,
  asyncRoute(async (req: Request, res: Response) => {
    const result = {
      data: [] as any,
      errors: [] as any,
    };

    if (!req.body.name || !req.body.callbackUrl) {
      res.status(404).end("Payload is not right need to have name and callbackUrl");
      return;
    }

    let { name, callbackUrl } = req.body;

    if (!Array.isArray(name)) {
      name = [name];
    }

    for (const ele of name) {
      try {
        const response = await axios.get(`http://127.0.0.1:3000/providers/${ele}`);
        result.data.push({ name: ele, data: response.data });
      } catch (error) {
        // Catch it if the server is not responding
        if (error.code === "ECONNREFUSED") {
          result.errors.push({
            name: ele,
            statusCode: res.status(500),
            message: "Provider server is not responding",
          });
        } else if (error.response.status === 404) {
          result.errors.push({
            name: ele,
            statusCode: error.response.status,
            message: `Provider ${ele} Does not exist`,
          });
        } else if (error.response.status === 500) {
          result.errors.push({
            name: ele,
            statusCode: error.response.status,
            message: `Provider Api is Failing with message ${error.response.data}`,
          });
        }
      }
    }
    try {
      await axios.post(callbackUrl, { result });
    } catch (error) {
      result.errors.push({
        name: "callbackUrl",
        statusCode: 404,
        message: "Callback Url Does not Exist",
      });
    }
    res.send(result);
  }),
);

router.post(
  "/data",
  jsonParser,
  asyncRoute(async (req: Request, res: Response) => {
    res.end();
  }),
);

export default router;
