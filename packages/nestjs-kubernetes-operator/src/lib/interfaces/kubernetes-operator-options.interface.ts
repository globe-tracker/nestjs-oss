import { KubernetesClientOptions } from "@globetracker/nestjs-kubernetes-client";
import { WatchedResource } from "../resources/watched-resource.interface";

export interface KubernetesOperatorOptions extends KubernetesClientOptions {
  enableControlLoop: boolean;
  controlLoopInterval?: number;
  observedResources: WatchedResource[];
}
