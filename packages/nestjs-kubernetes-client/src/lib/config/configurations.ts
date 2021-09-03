import Joi from "joi";

export const kubernetesClientConfig = () => ({
  config: process.env.KUBE_CONFIG_PATH,
});

export const kubernetesClientValidation = () => ({
  IN_CLUSTER: Joi.boolean().default(false),
});
