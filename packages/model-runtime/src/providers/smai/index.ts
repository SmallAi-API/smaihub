import { LOBE_DEFAULT_MODEL_LIST, ModelProvider } from 'model-bank';
import urlJoin from 'url-join';

import { responsesAPIModels } from '../../const/models';
import { createRouterRuntime } from '../../core/RouterRuntime';
import { type CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';
import { detectModelProvider, processMultiProviderModelList } from '../../utils/modelParse';

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
  enable_groups: string[];
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  /** 0: Pay-per-token, 1: Pay-per-call */
  quota_type: number;
  supported_endpoint_types?: string[];
}

/**
 * Detect if running in browser environment
 */
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Parse a pricing API HTTP response into a `SMAIPricing[] | null`.
 */
const parsePricingResponse = async (res: Response): Promise<SMAIPricing[] | null> => {
  if (!res.ok) {
    return null;
  }

  try {
    const body = await res.json();
    return body?.success && body?.data ? (body.data as SMAIPricing[]) : null;
  } catch {
    return null;
  }
};

/**
 * Fetch pricing information with CORS bypass for client-side requests
 */
const fetchPricing = async (pricingUrl: string, apiKey: string): Promise<SMAIPricing[] | null> => {
  try {
    if (isBrowser()) {
      const proxyResponse = await fetch('/webapi/proxy', {
        body: pricingUrl,
        method: 'POST',
      });

      return await parsePricingResponse(proxyResponse);
    } else {
      const pricingResponse = await fetch(pricingUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      return await parsePricingResponse(pricingResponse);
    }
  } catch (error) {
    console.debug('Failed to fetch SMAI pricing info:', error);
    return null;
  }
};

export const params = {
  debug: {
    chatCompletion: () => process.env.DEBUG_SMAI_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Client': 'LobeHub',
  },
  id: ModelProvider.SMAI,
  models: async ({ client: openAIClient }) => {
    // Get base URL (remove trailing API version paths like /v1, /v1beta, etc.)
    const baseURL = openAIClient.baseURL.replace(/\/v\d+[a-z]*\/?$/, '');

    const modelsPage = (await openAIClient.models.list()) as any;
    const modelList: SMAIModelCard[] = modelsPage.data || [];

    // Try to get pricing information to enrich model details
    const pricingMap: Map<string, SMAIPricing> = new Map();

    const pricingList = await fetchPricing(`${baseURL}/api/pricing`, openAIClient.apiKey || '');
    if (pricingList) {
      pricingList.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });
    }

    // Process the model list: determine the provider for each model based on priority rules
    const enrichedModelList = modelList.map((model) => {
      const enhancedModel: any = { ...model };

      // add pricing info
      const pricing = pricingMap.get(model.id);
      if (pricing) {
        let inputPrice: number | undefined;
        let outputPrice: number | undefined;

        if (pricing.quota_type === 0) {
          // Pay-per-token
          if (pricing.model_price && pricing.model_price > 0) {
            inputPrice = pricing.model_price * 2;
          } else if (pricing.model_ratio) {
            inputPrice = pricing.model_ratio * 2;
          }

          if (inputPrice !== undefined) {
            outputPrice = inputPrice * (pricing.completion_ratio || 1);

            enhancedModel.pricing = {
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
      }

      return enhancedModel;
    });

    return processMultiProviderModelList(enrichedModelList, 'smai');
  },
  routers: (options) => {
    // 使用用户配置的 baseURL，如果没有则使用默认地址
    const rawBaseURL = options.baseURL?.replace(/\/v\d+[a-z]*\/?$/, '') || undefined;
    const userBaseURL = rawBaseURL || DEFAULT_BASE_URL;
    return [
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
          (id) => detectModelProvider(id) === 'google',
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
