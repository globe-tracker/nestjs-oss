import { DynamicModule, Module } from "@nestjs/common";
import { AsyncModule, AsyncOptions } from "@jbiskur/nestjs-async-module";
import { KubernetesClientOptions } from "./interfaces";
import { KUBERNETES_CLIENT_OPTIONS } from "./constants";
import { KubernetesClientService } from "./kubernetes-client.service";

@Module({})
export class KubernetesClientModule extends AsyncModule {
  public static registerAsync(
    options: AsyncOptions<KubernetesClientOptions>
  ): DynamicModule {
    return {
      ...this.doRegisterAsync<KubernetesClientOptions>(
        KubernetesClientModule,
        KUBERNETES_CLIENT_OPTIONS,
        options,
        {
          providers: [
            KubernetesClientService
          ],
          exports: [KubernetesClientService],
        }
      ),
    };
  }
}
