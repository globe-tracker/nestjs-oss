import { Inject } from "@nestjs/common";
import { GT_LOGGER_SERVICE } from "./constants";

export const loggerContexts: string[] = new Array<string>();

export function InjectGTLogger(context = "") {
  if (!loggerContexts.includes(context)) {
    loggerContexts.push(context);
  }

  return Inject(`${GT_LOGGER_SERVICE}${context}`);
}
