import type { AiFullModelCard, AiModelType } from 'model-bank';
import {
  isProviderModelAvailable,
  loadModels as loadModelBankModels,
  ModelProvider,
} from 'model-bank';

interface LobeHubModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

export interface LobeHubModelPricingContext {
  plan: string;
  scope: 'personal';
}

export interface LobeHubModelPricingOptions {
  pricingContext?: LobeHubModelPricingContext;
}

const getDefaultLobeHubModelConfig = (): LobeHubModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadLobeHubModelConfig = async (): Promise<LobeHubModelConfig> =>
  getDefaultLobeHubModelConfig();

export const loadModels = async (_options?: LobeHubModelPricingOptions) =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.LobeHub]: loadLobeHubModels,
    },
  });

const loadLobeHubModels = async (): Promise<AiFullModelCard[]> =>
  (await loadLobeHubModelConfig()).models;

export const loadLobeHubPlanCardModels = async (): Promise<string[]> =>
  (await loadLobeHubModelConfig()).planCardModels;

export const isLobeHubModelAvailable = async (
  id: string,
  expectedType: AiModelType,
  _options?: {
    getUserEmail?: () => Promise<string | null | undefined>;
    userEmail?: string | null;
  },
): Promise<boolean> => {
  const models = await loadModels();
  return isProviderModelAvailable(models, ModelProvider.SMAI, id, expectedType);
};
