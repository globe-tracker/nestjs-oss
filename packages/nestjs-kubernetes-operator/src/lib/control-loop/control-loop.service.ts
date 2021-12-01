import { Injectable, OnApplicationBootstrap, Optional } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GTLoggerService, InjectGTLogger } from "@globetracker/nestjs-logger";
import { DEFAULT_CONTROL_LOOP_INTERVAL } from "../constants";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { KubernetesOperatorOptions } from "./../interfaces";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { KubernetesClientService } from "@globetracker/nestjs-kubernetes-client";
import { WatchedResource } from "../resources/watched-resource.interface";
import * as http from "http";

@Injectable()
export class ControlLoopService implements OnApplicationBootstrap {
  constructor(
    @InjectGTLogger(ControlLoopService.name)
    private readonly logger: GTLoggerService,
    private readonly options: ModuleOptions<KubernetesOperatorOptions>,
    private readonly kubernetesClient: KubernetesClientService,
    private eventEmitter: EventEmitter2,
    @Optional() private scheduleRegistry: SchedulerRegistry
  ) {}

  async runControlLoop() {
    const resources = this.options.get().observedResources;

    await Promise.all(
      resources.map(async (resource) => {
        this.logger.debug(
          `Running control loop for resource ${resource.plural}`,
          resource
        );
        const items = await this.listResource(resource);
      })
    );
  }

  private async listResource(resource: WatchedResource) {
    let items: {
      response: http.IncomingMessage;
      body: unknown;
    };

    switch (resource.namespaced) {
      case true:
        break;
      case false:
        break;
    }
    try {
      items = await this.kubernetesClient
        .getCustomApi()
        .listNamespacedCustomObject(
          resource.group,
          resource.version,
          resource.namespace,
          resource.plural
        );

      console.log(items);
    } catch (e) {
      this.logger.error(`Failed to list resources`, e);
    }

    return items;
  }

  async onApplicationBootstrap() {
    if (!this.scheduleRegistry) {
      this.logger.warn("Scheduler disabled for this service");
      return;
    }

    this.logger.info(
      `Starting scheduler to run at interval (${
        this.options.get().controlLoopInterval ?? DEFAULT_CONTROL_LOOP_INTERVAL
      })`
    );

    const interval = setInterval(
      this.runControlLoop.bind(this),
      this.options.get().controlLoopInterval ?? DEFAULT_CONTROL_LOOP_INTERVAL
    );
    this.scheduleRegistry.addInterval("runControlLoop", interval);
  }
}
