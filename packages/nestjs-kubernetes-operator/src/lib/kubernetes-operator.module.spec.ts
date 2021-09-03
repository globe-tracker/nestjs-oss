import { INestApplication } from '@nestjs/common';
import { NestApplicationBuilder } from '@jbiskur/nestjs-test-utilities';
import { KubernetesOperatorModule } from './kubernetes-operator.module';

describe("KubernetesOperatorModule", () => {
  let sut: INestApplication;

  beforeAll(async () => {
    sut = await new NestApplicationBuilder()
      .withTestModule(builder => builder.withModule(KubernetesOperatorModule))
      .build();
  });

  afterAll(async () => {
    await sut.close();
  })

  it("should be defined", () => {
    expect(sut).toBeDefined();
  })
})
