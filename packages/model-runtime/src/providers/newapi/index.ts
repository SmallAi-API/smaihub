import { LOBE_DEFAULT_MODEL_LIST, ModelProvider } from 'model-bank';
import urlJoin from 'url-join';

import { createRouterRuntime } from '../../core/RouterRuntime';
import { type CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';
import { detectModelProvider, processMultiProviderModelList } from '../../utils/modelParse';
import { responsesAPIModels } from '../openai/openaiModelId';
import { resolveProviderRouteModels } from '../utils/resolveProviderRouteModels';

const DEFAULT_BASE_URL = 'https://api.smallai.asia';

export interface NewAPIModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
  supported_endpoint_types?: string[];
}

export interface NewAPIPricing {
  completion_ratio?: number;
  description?: string;
  enable_groups: string[];
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  /** 0: 按 token 计费，1: 按次计费 */
  quota_type: number;
  supported_endpoint_types?: string[];
}

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const fetchPricing = async (
  pricingUrl: string,
  apiKey: string,
  providerId = ModelProvider.NewAPI,
): Promise<NewAPIPricing[] | null> => {
  try {
    let res: Response;
    if (isBrowser()) {
      res = await fetch(`/webapi/models/${encodeURIComponent(providerId)}/pricing`);
    } else {
      const fetchWithAuth = async (useAuth: boolean) => {
        const headers: Record<string, string> = {
          Accept: 'application/json; charset=utf-8',
        };
        if (useAuth && apiKey) {
          headers.Authorization = `Bearer ${apiKey}`;
        }
        return fetch(pricingUrl, { headers });
      };

      let usedAuth = true;
      try {
        res = await fetchWithAuth(true);
      } catch {
        usedAuth = false;
        res = await fetchWithAuth(false);
      }

      if (!res.ok && usedAuth) {
        res = await fetchWithAuth(false);
      }
    }

    if (!res.ok) return null;

    const body = await res.json();
    return body?.success && body?.data ? (body.data as NewAPIPricing[]) : null;
  } catch {
    return null;
  }
};

export const params = {
  debug: {
    chatCompletion: () => process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Client': 'LobeHub',
  },
  id: ModelProvider.NewAPI,
  models: async ({ client: openAIClient, options }) => {
    const providerId =
      typeof options?.providerId === 'string' ? options.providerId : ModelProvider.NewAPI;

    // 获取 base URL（移除结尾的 API 版本路径，如 /v1、/v1beta 等）
    const baseURL = openAIClient.baseURL.replace(/\/v\d+[a-z]*\/?$/, '');

    const modelsPage = (await openAIClient.models.list()) as any;
    const modelList: NewAPIModelCard[] = modelsPage.data || [];

    // 构建已有模型 ID 集合，便于快速查找
    const existingModelIds = new Set(modelList.map((m) => m.id));

    // 尝试获取定价信息以丰富模型详情
    const pricingMap: Map<string, NewAPIPricing> = new Map();

    const pricingList = await fetchPricing(
      `${baseURL}/api/pricing`,
      openAIClient.apiKey || '',
      providerId,
    );
    if (Array.isArray(pricingList)) {
      pricingList.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });
    }

    const calculatePricing = (pricing: NewAPIPricing) => {
      let inputPrice: number | undefined;
      let outputPrice: number | undefined;

      if (pricing.quota_type === 0) {
        // 按 token 计费
        if (pricing.model_price && pricing.model_price > 0) {
          // model_price 是直接的价格值，需确认其单位。
          // 假设：model_price 是每 1,000 token 的价格（即 $/1K tokens）。
          // 要换算为每 1,000,000 token 的价格（$/1M tokens），需乘以 1,000,000 / 1,000 = 1,000。
          // 由于基准价为 $0.002/1K tokens，乘以 2 即得到 $2/1M tokens。
          // 因此 inputPrice = model_price * 2 将价格换算为 LobeChat 使用的 $/1M tokens。
          inputPrice = pricing.model_price * 2;
        } else if (pricing.model_ratio) {
          // model_ratio × $0.002/1K = model_ratio × $2/1M
          inputPrice = pricing.model_ratio * 2; // 换算为 $/1M tokens
        }

        if (inputPrice !== undefined) {
          // 计算输出价格
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
      // quota_type === 1 按次计费，当前暂不支持
      return undefined;
    };

    // 处理模型列表：根据优先级规则确定每个模型所属的 provider
    const enrichedModelList = modelList.map((model) => {
      const enhancedModel: any = { ...model };

      // 添加定价信息
      const pricing = pricingMap.get(model.id);
      if (pricing) {
        // NewAPI 定价计算逻辑：
        // - quota_type：0 表示按 token 计费，1 表示按次计费
        // - model_ratio：相对于基准价的倍率（基准价 = $0.002/1K tokens）
        // - model_price：直接指定的价格（优先级最高）
        // - completion_ratio：输出价格相对于输入价格的倍率
        //
        // LobeChat 所需格式：每百万 token 的美元价格

        const pricingData = calculatePricing(pricing);
        if (pricingData) {
          enhancedModel.pricing = pricingData;
        }
      }

      return enhancedModel;
    });

    // 将仅存在于定价列表、不在模型列表中的模型补充进来
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

    return processMultiProviderModelList([...enrichedModelList, ...additionalModels], 'newapi');
  },
  routers: (options, runtimeContext?: { model?: string }) => {
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

export const LobeNewAPIAI = createRouterRuntime(params);
