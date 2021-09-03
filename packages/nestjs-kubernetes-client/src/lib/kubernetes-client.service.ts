import { Inject, Injectable } from '@nestjs/common';
import { CoreV1Api, CustomObjectsApi, KubeConfig, ListPromise, makeInformer, Watch } from '@kubernetes/client-node';
import axios, { AxiosResponse } from 'axios';
import request from 'request';
import { KUBERNETES_CLIENT_OPTIONS } from './constants';
import { KubernetesClientOptions } from './interfaces';
import { GTLoggerService, InjectGTLogger } from '@globetracker/nestjs-logger';

export enum PATCH_TYPE {
  JSON,
  MERGE,
  STRATEGIC_MERGE,
}

export enum WATCH_EVENT_TYPE {
  ADDED = "ADDED",
  MODIFIED = "MODIFIED",
  DELETED = "DELETED",
  BOOKMARK = "BOOKMARK",
}

export enum INFORMER_EVENT_TYPE {
  ADD = "add",
  UPDATE = "update",
  DELETE = "delete",
  ERROR = "error",
}

@Injectable()
export class KubernetesClientService {
  private readonly coreAPI: CoreV1Api;
  private readonly crdAPI: CustomObjectsApi;
  private readonly config: KubeConfig;

  constructor(
    @InjectGTLogger(KubernetesClientService.name)
    private readonly logger: GTLoggerService,
    @Inject(KUBERNETES_CLIENT_OPTIONS)
    private readonly options: KubernetesClientOptions,
  ) {
    this.config = new KubeConfig();
    if (options.inCluster) {
      this.config.loadFromCluster();
    } else {
      this.config.loadFromDefault();
    }

    this.coreAPI = this.config.makeApiClient(CoreV1Api);
    this.crdAPI = this.config.makeApiClient(CustomObjectsApi);
  }

  public getApiClient(): CoreV1Api {
    return this.coreAPI;
  }

  public getCustomApi(): CustomObjectsApi {
    return this.crdAPI;
  }

  public async get<T>(path: string): Promise<AxiosResponse<T>> {
    const requestOptions = await this.applyAuthorizationHeader();

    let result;
    try {
      result = await axios.get(
        `${this.config.getCurrentCluster().server}${path}`,
        {
          headers: requestOptions.headers,
        }
      );
    } catch (e) {
      this.logger.error("failed to fetch raw query", e);
    }

    return result;
  }

  private async applyAuthorizationHeader() {
    const requestOptions: request.Options = {
      url: this.config.getCurrentCluster().server,
    };

    try {
      await this.config.applyToRequest(requestOptions);
    } catch (e) {
      this.logger.error("failed to apply authorization header ", e);
    }
    return requestOptions;
  }

  public async post<T>(
    path: string,
    input: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    const requestOptions = await this.applyAuthorizationHeader();

    let result;
    try {
      result = await axios.post(
        `${this.config.getCurrentCluster().server}${path}`,
        input,
        {
          headers: requestOptions.headers,
        }
      );
      return result;
    } catch (e) {
      this.logger.error("failed to post raw request", e);
      return null;
    }
  }

  public async patch<T>(
    path: string,
    input: Record<string, unknown>,
    patchType: PATCH_TYPE = PATCH_TYPE.JSON
  ): Promise<AxiosResponse<T>> {
    const requestOptions = await this.applyAuthorizationHeader();

    switch (patchType) {
      default:
      case PATCH_TYPE.JSON:
        requestOptions.headers["Content-Type"] = "application/json-patch+json";
        break;
      case PATCH_TYPE.MERGE:
        requestOptions.headers["Content-Type"] = "application/merge-patch+json";
        break;
      case PATCH_TYPE.STRATEGIC_MERGE:
        requestOptions.headers["Content-Type"] =
          "application/strategic-merge-patch+json";
        break;
    }

    let result;
    try {
      result = await axios.patch(
        `${this.config.getCurrentCluster().server}${path}`,
        input,
        {
          headers: requestOptions.headers,
        }
      );
    } catch (e) {
      this.logger.error("failed to apply patch", e);
    }

    return result;
  }

  public async delete<T>(path: string): Promise<AxiosResponse<T>> {
    const requestOptions = await this.applyAuthorizationHeader();

    let result;
    try {
      result = await axios.delete(
        `${this.config.getCurrentCluster().server}${path}`,
        {
          headers: requestOptions.headers,
        }
      );
    } catch (e) {
      this.logger.error("failed to apply patch", e);
    }

    return result;
  }

  public makeInformer<T>(informerFn: ListPromise<T>, restPath: string) {
    return makeInformer<T>(this.config, restPath, informerFn);
  }

  async makeWatcher<T>(
    apiPath: string,
    callback: (
      type,
      object: T,
      watchObj: {
        type: string;
        object: T;
      }
    ) => void
  ) {
    const watcher = new Watch(this.config);
    return await watcher.watch(
      apiPath,
      {
        allowWatchBookmarks: true,
      },
      (type, apiObject, watchObj) => {
        callback(type, apiObject, watchObj);
      },
      (err) => {
        this.logger.error("Watcher failed", err);
        throw new Error("Watcher failed");
      }
    );
  }
}
