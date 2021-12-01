import { DynamicModule, Module } from "@nestjs/common";
import { AsyncOptions, createAsyncModule } from "@jbiskur/nestjs-async-module";
import { KubernetesClientOptions } from "./interfaces";
import { KubernetesClientService } from "./kubernetes-client.service";

@Module({
  providers: [KubernetesClientService],
  exports: [KubernetesClientService],
})
export class KubernetesClientModule extends createAsyncModule<KubernetesClientOptions>() {
  public static registerAsync(
    options: AsyncOptions<KubernetesClientOptions>
  ): DynamicModule {
    return super.registerAsync(options, KubernetesClientModule);
  }
}
