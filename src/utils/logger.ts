import winston from "winston";

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const initialise = () => {
  winston.remove(winston.transports.Console); // remove the default options
  winston.add(
    new winston.transports.Console({
      format: format,
      level: "debug",
    }),
  );

  // add more Winston options if desired
};

export default { initialise, format };
