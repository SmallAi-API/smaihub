import { LOBE_DEFAULT_MODEL_LIST, ModelProvider } from 'model-bank';
import urlJoin from 'url-join';

import { responsesAPIModels } from '../../const/models';
import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { createRouterRuntime } from '../../core/RouterRuntime';
import { type CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';
import { detectModelProvider, processMultiProviderModelList } from '../../utils/modelParse';
import { resolveProviderRouteModels } from '../utils/resolveProviderRouteModels';
import { createSMAIVideo, pollSMAIVideoStatus } from './createVideo';

// SmaiAI 默认 API 地址
const DEFAULT_BASE_URL = 'https://api.smai.ai';

export interface SMAIModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
  supported_endpoint_types?: string[];
}

export interface SMAIPricing {
  completion_ratio?: number;
  description?: string;
  enable_groups: string[];
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  /** 0: Pay-per-token, 1: Pay-per-call */
  quota_type: number;
  supported_endpoint_types?: string[];
}

/**
 * Fetch pricing information with CORS bypass for client-side requests
 */
const fetchPricing = async (pricingUrl: string, apiKey: string): Promise<SMAIPricing[] | null> => {
  try {
    const res = await fetch(pricingUrl, {
      headers: {
        Accept: 'application/json; charset=utf-8',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return null;

    const body = await res.json();
    return body?.success && body?.data ? (body.data as SMAIPricing[]) : null;
  } catch {
    return null;
  }
};

/**
 * SMAI video runtime using OpenAI-compatible factory with custom video endpoints.
 * Uses /v1/video for creation and /v1/video/{id} for status polling.
 */
const SMAIVideoRuntime = createOpenAICompatibleRuntime({
  baseURL: 'https://api.smai.ai/v1',
  createVideo: createSMAIVideo,
  handlePollVideoStatus: async (inferenceId, options) => {
    return pollSMAIVideoStatus(inferenceId, {
      apiKey: options.apiKey,
      baseURL: options.baseURL || 'https://api.smai.ai/v1',
    });
  },
  provider: ModelProvider.SMAI,
});

// Get video model IDs from the default model list
const smaiVideoModelIds = LOBE_DEFAULT_MODEL_LIST.filter(
  (m) => m.providerId === 'smai' && m.type === 'video',
).map((m) => m.id);

export const params = {
  debug: {
    chatCompletion: () => process.env.DEBUG_SMAI_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Client': 'smai.ai',
  },
  id: ModelProvider.SMAI,
  models: async ({ client: openAIClient }) => {
    // Get base URL (remove trailing API version paths like /v1, /v1beta, etc.)
    const baseURL = openAIClient.baseURL.replace(/\/v\d+[a-z]*\/?$/, '');

    const modelsPage = (await openAIClient.models.list()) as any;
    const modelList: SMAIModelCard[] = modelsPage.data || [];

    // Create a set of existing model IDs for quick lookup
    const existingModelIds = new Set(modelList.map((m) => m.id));

    // Try to get pricing information to enrich model details
    const pricingMap: Map<string, SMAIPricing> = new Map();

    const pricingList = await fetchPricing(`${baseURL}/api/pricing`, openAIClient.apiKey || '');
    if (Array.isArray(pricingList)) {
      pricingList.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });
    }

    const calculatePricing = (pricing: SMAIPricing) => {
      let inputPrice: number | undefined;
      let outputPrice: number | undefined;

      if (pricing.quota_type === 0) {
        // Pay-per-token
        if (pricing.model_price && pricing.model_price > 0) {
          // model_price is a direct price value; need to confirm its unit.
          // Assumption: model_price is the price per 1,000 tokens (i.e., $/1K tokens).
          // To convert to price per 1,000,000 tokens ($/1M tokens), multiply by 1,000,000 / 1,000 = 1,000.
          // Since the base price is $0.002/1K tokens, multiplying by 2 gives $2/1M tokens.
          // Therefore, inputPrice = model_price * 2 converts the price to $/1M tokens for LobeChat.
          inputPrice = pricing.model_price * 2;
        } else if (pricing.model_ratio) {
          // model_ratio × $0.002/1K = model_ratio × $2/1M
          inputPrice = pricing.model_ratio * 2; // Convert to $/1M tokens
        }

        if (inputPrice !== undefined) {
          // Calculate output price
          outputPrice = inputPrice * (pricing.completion_ratio || 1);

          return {
            units: [
              {
                name: 'textInput',
                rate: inputPrice,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textOutput',
                rate: outputPrice,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
            ],
          };
        }
      }
      // quota_type === 1 pay-per-call is not currently supported
      return undefined;
    };

    // Process the model list: determine the provider for each model based on priority rules
    const enrichedModelList = modelList.map((model) => {
      const enhancedModel: any = { ...model };

      // add pricing info
      const pricing = pricingMap.get(model.id);
      if (pricing) {
        const pricingData = calculatePricing(pricing);
        if (pricingData) {
          enhancedModel.pricing = pricingData;
        }
      }

      return enhancedModel;
    });

    // Add models from pricing list that are not in the models list
    const additionalModels: any[] = [];
    pricingMap.forEach((pricing, modelName) => {
      if (!existingModelIds.has(modelName)) {
        const pricingData = calculatePricing(pricing);
        additionalModels.push({
          ...(pricing.description && { description: pricing.description }),
          id: modelName,
          ...(pricingData && { pricing: pricingData }),
        });
      }
    });

    return processMultiProviderModelList([...enrichedModelList, ...additionalModels], 'smai');
  },
  routers: (options, runtimeContext?: { model?: string }) => {
    // 使用用户配置的 baseURL，如果没有则使用默认地址
    const rawBaseURL = options.baseURL?.replace(/\/v\d+[a-z]*\/?$/, '') || undefined;
    const userBaseURL = rawBaseURL || DEFAULT_BASE_URL;
    return [
      {
        apiType: 'openai' as const,
        models: smaiVideoModelIds,
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
        },
        runtime: SMAIVideoRuntime,
      },
      {
        apiType: 'anthropic',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'anthropic',
        ),
        options: {
          ...options,
          baseURL: userBaseURL,
        },
      },
      {
        apiType: 'google',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'google' && !id.endsWith(':image'),
        ),
        options: {
          ...options,
          baseURL: userBaseURL,
        },
      },
      {
        apiType: 'xai',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'xai',
        ),
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
        },
      },
      {
        apiType: 'deepseek',
        models: resolveProviderRouteModels(
          'deepseek',
          LOBE_DEFAULT_MODEL_LIST,
          runtimeContext?.model,
        ),
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
          sdkType: 'openai',
        },
      },
      {
        apiType: 'openai',
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
          chatCompletion: {
            useResponseModels: [...Array.from(responsesAPIModels), /gpt-\d(?!\d)/, /^o\d/],
          },
        },
      },
    ];
  },
} satisfies CreateRouterRuntimeOptions;

export const LobeSMAIAI = createRouterRuntime(params);
