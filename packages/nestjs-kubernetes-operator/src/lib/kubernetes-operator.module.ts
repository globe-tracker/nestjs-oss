import { DynamicModule, Module } from "@nestjs/common";
import {
  AsyncModule,
  AsyncOptions,
  createOptionsToken,
} from "@jbiskur/nestjs-async-module";
import { KubernetesOperatorOptions } from "./interfaces";
import { KubernetesClientModule } from "@globetracker/nestjs-kubernetes-client";
import { createOptionsModule } from "@jbiskur/nestjs-options-module-factory";
import { ControlLoopService } from "./control-loop/control-loop.service";

const optionsToken = createOptionsToken();

@Module({
  controllers: [],
  providers: [ControlLoopService],
  exports: [],
})
export class KubernetesOperatorModule extends AsyncModule {
  public static registerAsync(
    options: AsyncOptions<KubernetesOperatorOptions>
  ): DynamicModule {
    const optionsModule = createOptionsModule(optionsToken, options);

    return this.doRegisterAsync(KubernetesOperatorModule, null, null, {
      imports: [
        optionsModule,
        KubernetesClientModule.registerAsync({
          imports: [optionsModule],
          inject: [optionsToken],
          useFactory: (moduleOptions: KubernetesOperatorOptions) => ({
            inCluster: moduleOptions.inCluster,
          }),
        }),
      ],
    });
  }
}
