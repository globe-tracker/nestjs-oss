import {
  INestApplicationBuilderPlugin,
  NestApplicationBuilder,
} from "@jbiskur/nestjs-test-utilities";
import { GTLoggerModule } from "@globetracker/nestjs-logger";

export class LogModulePlugin implements INestApplicationBuilderPlugin {
  run(appBuilder: NestApplicationBuilder): void {
    appBuilder.withTestModule((builder) =>
      builder.withModule(
        GTLoggerModule.forRootAsync({
          useFactory: () => ({
            level: "debug",
            pretty: true,
            useLevelLabels: true,
          }),
        })
      )
    );
  }
}
