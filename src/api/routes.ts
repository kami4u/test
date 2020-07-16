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
    const result = [];

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
        result.push({ name: ele, data: response.data });
      } catch (error) {
        if (error.code === "ECONNREFUSED") res.status(500).send("Provider server is not responding");
        if (error.response.status === 404) {
          res.status(error.response.status).send(`Provider ${ele} Does not exist`);
          return;
        }
        if (error.response.status === 500) {
          res.status(error.response.status).send(`Provider Api is Failing with message ${error.response.data}`);
          return;
        }
      }
    }
    try {
      await axios.post(callbackUrl, { result });
    } catch (error) {
      res.status(404).send("Callback Url Does not Exist");
      return;
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
