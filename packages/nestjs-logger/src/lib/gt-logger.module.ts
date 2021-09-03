import { DynamicModule, Global, Module } from "@nestjs/common";
import { AsyncModule, AsyncOptions } from "@jbiskur/nestjs-async-module";
import { LogModuleOptions } from "./interfaces";
import { LOG_MODULE_OPTIONS } from "./constants";
import { createOptionsModule } from "@jbiskur/nestjs-options-module-factory";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { LoggerTransportFactory } from "./logger-transport.factory";
import { GTLoggerService } from "./gt-logger.service";
import { createLoggerProviders } from "./gt-logger.providers";

@Global()
@Module({})
export class GTLoggerModule extends AsyncModule {
  public static forRootAsync(
    options: AsyncOptions<LogModuleOptions>
  ): DynamicModule {
    const moduleOptions = createOptionsModule(LOG_MODULE_OPTIONS, options);
    const loggerProviders = createLoggerProviders();

    return {
      ...this.doRegisterAsync<LogModuleOptions>(GTLoggerModule, null, null, {
        imports: [
          moduleOptions,
          WinstonModule.forRootAsync({
            useFactory: (logOptions: LogModuleOptions) => {
              const options: winston.LoggerOptions = {
                level: logOptions.level ?? "info",
                transports: [],
              };

              if (logOptions.pretty) {
                options.transports = [LoggerTransportFactory.prettyFormat()];
              } else {
                options.transports = [LoggerTransportFactory.jsonFormat()];
              }

              return options;
            },
            inject: [LOG_MODULE_OPTIONS],
            imports: [moduleOptions],
          }),
        ],
        providers: [GTLoggerService, ...loggerProviders],
        exports: [GTLoggerService, ...loggerProviders],
      }),
    };
  }
}
