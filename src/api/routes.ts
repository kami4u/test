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
    if (!req.body.name || !req.body.callbackUrl) {
      throw new Error("Parameters Required(name, callbackUrl)");
    }

    try {
      const { data } = await axios.get(`http://127.0.0.1:3000/providers/${req.body.name}`);
      await axios.post(req.body.callbackUrl, { data });
      res.send(data);
    } catch (error) {
      console.log(error.response.status);
      throw new Error(error);
    }
  }),
);

router.post(
  "/data",
  jsonParser,
  asyncRoute(async (req: Request, res: Response) => {
    res.send(req.body.data);
  }),
);

export default router;
