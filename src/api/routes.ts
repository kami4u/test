import { Request, Response, Router } from "express";
import axios, { AxiosInstance } from "axios";
import bodyParser from "body-parser";
import { asyncRoute } from "../utils/async";

const axiosInstance: AxiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
  if (config.timeout === 0) {
    config.timeout = 5 * 1000;
  }
  return config;
});

const router = Router();
const jsonParser = bodyParser.json();

router.post(
  "/webhook",
  jsonParser,
  asyncRoute(async (req: Request, res: Response) => {
    if (!req.body.name || !req.body.callbackUrl) {
      res.status(404).end("Payload is not right need to have name and callbackUrl");
      return;
    }

    try {
      const { data } = await axiosInstance.get(`http://127.0.0.1:3000/providers/${req.body.name}`);
      try {
        await axiosInstance.post(req.body.callbackUrl, { data });
      } catch (error) {
        res.status(404).send("Callback Url Does not Exist");
        return;
      }
      res.send(data);
    } catch (error) {
      if (error.response.status === 404) {
        res.status(error.response.status).send(`Provider ${req.body.name} Does not exist`);
        return;
      }
      if (error.response.status === 500) {
        res.status(error.response.status).send(`Provider Api is Failing with message ${error.response.data}`);
        return;
      }
    }
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
