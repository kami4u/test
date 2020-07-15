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
      res.status(404).end("Payload is not right need to have name and callbackUrl");
    }

    try {
      const { data } = await axios.get(`http://127.0.0.1:3000/providers/${req.body.name}`);
      try {
        await axios.post(req.body.callbackUrl, { data });
      } catch (error) {
        res.status(500).send("Callback Url Does not Exist");
      }
      res.send(data);
    } catch (error) {
      res.status(500).send("Providers API is Failing");
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
