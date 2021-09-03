import { INestApplication } from "@nestjs/common";
import { KubernetesClientService } from "./kubernetes-client.service";
import { KubernetesClientModule } from "./kubernetes-client.module";
import { V1Secret } from "@kubernetes/client-node";
import { uniq } from "@nrwl/nx-plugin/testing";
import waitForExpect from "wait-for-expect";
import { NestApplicationBuilder } from '@jbiskur/nestjs-test-utilities';
import { LogModulePlugin } from '@globetracker/logger-nestjs-builder-plugin';

const testingNamespace = "integration-tests";
const secretName = uniq("secret");
const secretNameWatcher = uniq("secret");
describe("Kubernetes Client Module (e2e)", () => {
  let app: INestApplication;
  let sut: KubernetesClientService;

  afterAll(async () => {
    await sut
      .getApiClient()
      .deleteNamespacedSecret(secretName, testingNamespace);
  });

  beforeEach(async () => {
    app = await new NestApplicationBuilder()
      .withTestModule((builder) =>
        builder.withModule(
          KubernetesClientModule.registerAsync({
            useFactory: () => ({}),
          })
        )
      )
      .with(LogModulePlugin)
      .build();

    sut = await app.resolve(KubernetesClientService);
  });

  afterEach(async () => {
    await app.close();
  });

  it("should be defined", async () => {
    expect(sut).toBeDefined();
  });

  it("should access CoreV1Api", () => {
    expect(sut.getApiClient().constructor.name).toBe("CoreV1Api");
  });

  it("should access CustomObjectsApi", () => {
    expect(sut.getCustomApi().constructor.name).toBe("CustomObjectsApi");
  });

  it("should access kubernetes informer", async () => {
    const secretInformer = () =>
      sut.getApiClient().listNamespacedSecret(testingNamespace);
    const informer = sut.makeInformer(
      secretInformer,
      `/api/v1/namespaces/${testingNamespace}/secrets`
    );

    const jstFnAdded = jest.fn();
    informer.on("add", () => jstFnAdded());
    await informer.start();

    const secretBody: V1Secret = {
      metadata: {
        name: secretName,
      },
      data: {
        hello: Buffer.from("world", "ascii").toString("base64"),
      },
      type: "opaque",
    };

    try {
      const result = await sut
        .getApiClient()
        .createNamespacedSecret(testingNamespace, secretBody);
      if (result.response.statusCode === 200) {
        await sut
          .getApiClient()
          .deleteNamespacedSecret(result.body.metadata.name, testingNamespace);
      }
    } catch (e) {
      console.error(e);
    }

    expect(jstFnAdded).toHaveBeenCalled();
  });

  it("should access kubernetes watch", async () => {
    jest.setTimeout(20000);

    let correctSecret: V1Secret = null;
    let correctType = null;

    await sut.makeWatcher(
      `/api/v1/namespaces/${testingNamespace}/secrets`,
      (type, secret: V1Secret) => {
        if (secret.metadata.name === secretName) {
          correctSecret = secret;
          correctType = type;
        }
      }
    );

    const secretBody: V1Secret = {
      metadata: {
        name: secretNameWatcher,
      },
      data: {
        hello: Buffer.from("world", "ascii").toString("base64"),
      },
      type: "opaque",
    };

    try {
      const result = await sut
        .getApiClient()
        .createNamespacedSecret(testingNamespace, secretBody);
      if (result.response.statusCode === 200) {
        await sut
          .getApiClient()
          .deleteNamespacedSecret(result.body.metadata.name, testingNamespace);
      }
    } catch (e) {
      console.error(e);
      return;
    }

    await waitForExpect(() => {
      expect(correctSecret).toBeDefined();
      expect(correctType).toBeDefined();
    }, 19000);
  });
});
