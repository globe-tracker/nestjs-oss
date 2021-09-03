import { GTLoggerService } from "./gt-logger.service";
import { Provider } from "@nestjs/common";
import { GT_LOGGER_SERVICE } from "./constants";
import { loggerContexts } from "./gt-logger.dectorator";

function loggerFactory(logger: GTLoggerService, context: string) {
  if (context) {
    logger.setContext(context);
  }

  return logger;
}

function createLoggerProvider(context: string): Provider<GTLoggerService> {
  return {
    provide: `${GT_LOGGER_SERVICE}${context}`,
    useFactory: (logger) => loggerFactory(logger, context),
    inject: [GTLoggerService],
  };
}

export function createLoggerProviders(): Array<Provider<GTLoggerService>> {
  return loggerContexts.map((context) => createLoggerProvider(context));
}
