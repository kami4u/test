import express, { NextFunction, Request, Response } from "express";
import winston from "winston";
import cors from "cors";
import expressWinston from "express-winston";

import logger from "./utils/logger";
import routes from "./api/routes";

const app = express();
const port = 3100;

// request logging middleware
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: logger.format,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  }),
);

app.use(cors());

logger.initialise();

// main API modules
app.use("/api", routes);

// catch-all error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  winston.error(`${err.message}`);
  res.status(404).end(err.message);
});

app.listen(port, () => winston.info(`listening on port ${port}!`));

module.exports = app;
