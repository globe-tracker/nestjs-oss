import { KubernetesClientModule } from "../../kubernetes-client.module";

export class KubernetesClientModuleFixture {
  build() {
    return KubernetesClientModule.registerAsync({
      useFactory: () => ({}),
    });
  }
}
