import Joi from "joi";

export const logModuleConfiguration = () => ({
  log: {
    level: process.env.LOG_LEVEL,
    useLabel:
      process.env.LOG_USE_LABEL && JSON.parse(process.env.LOG_USE_LABEL),
    pretty:
      process.env.LOG_PRETTY_PRINT && JSON.parse(process.env.LOG_PRETTY_PRINT),
  },
});

export const logModuleValidation = () => ({
  LOG_LEVEL: Joi.string().default("info"),
  LOG_USE_LABEL: Joi.boolean().default(false),
  LOG_PRETTY_PRINT: Joi.boolean().default(false),
});
