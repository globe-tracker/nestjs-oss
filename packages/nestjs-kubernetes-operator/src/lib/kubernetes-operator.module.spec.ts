import { INestApplication, Injectable, Module } from "@nestjs/common";
import { NestApplicationBuilder } from "@jbiskur/nestjs-test-utilities";
import { KubernetesOperatorModule } from "./kubernetes-operator.module";
import { ControlLoopService } from "./control-loop/control-loop.service";
import { EventEmitterModule, OnEvent } from "@nestjs/event-emitter";
import { WatchedResource } from "./resources/watched-resource.interface";
import { getEventName } from "./helpers/get-event-name";
import { RECONCILE_EVENT_TYPE } from "./enums/reconcile-event-type.enum";
import waitForExpect from "wait-for-expect";
import { LogModulePlugin } from "@globetracker/logger-nestjs-builder-plugin";

const testingNamespace = "integration-tests";

const watchedResource = new WatchedResource({
  group: "tyk.tyk.io",
  namespace: testingNamespace,
  namespaced: true,
  plural: "apidescriptions",
  version: "v1alpha1",
});

describe("KubernetesOperatorModule", () => {
  let app: INestApplication;
  let controlLoop: ControlLoopService;
  const reconcileControlLoop = jest.fn();

  @Injectable()
  class TestService {
    @OnEvent(getEventName(watchedResource.plural, RECONCILE_EVENT_TYPE.CONTROL))
    reconcile(payload: any) {
      reconcileControlLoop(payload);
    }
  }

  @Module({
    providers: [TestService],
  })
  class TestModule {}

  @Module({
    imports: [
      TestModule,
      KubernetesOperatorModule.registerAsync({
        useFactory: () => ({
          enableControlLoop: false,
          observedResources: [watchedResource],
        }),
      }),
    ],
  })
  class AppModule {}

  beforeAll(async () => {
    app = await new NestApplicationBuilder()
      .withTestModule((builder) => {
        builder.withModule(AppModule);
        builder.withModule(EventEmitterModule.forRoot());
        return builder;
      })
      .with(LogModulePlugin)
      .build();

    controlLoop = await app.resolve(ControlLoopService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should emit event for each resource found", async () => {
    await controlLoop.runControlLoop();

    await waitForExpect(() => {
      expect(reconcileControlLoop).toHaveBeenCalled();
    });
  });
  it.todo("should emit an event when a resource is created");
  it.todo("should emit an event when a resource is updated");
  it.todo("should emit an event when a resource is deleted");
});
