import { GTLoggerModule } from "./gt-logger.module";
import { INestApplication } from "@nestjs/common";
import { GTLoggerService } from "./gt-logger.service";
import { NestApplicationBuilder } from "@jbiskur/nestjs-test-utilities";

describe("Logging Module (Smoke Test)", () => {
  let app: INestApplication;
  let sut: GTLoggerModule;

  beforeEach(async () => {
    app = await new NestApplicationBuilder()
      .withTestModule((builder) =>
        builder.withModule(
          GTLoggerModule.forRootAsync({
            useFactory: () => ({ level: "debug" }),
          })
        )
      )
      .build();

    sut = await app.resolve(GTLoggerService);
  });

  it("should be defined", async () => {
    expect(sut).toBeDefined();
  });
});
