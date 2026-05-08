import { type ModelProviderCard } from '@/types/llm';

const SMAI: ModelProviderCard = {
  apiKeyUrl: 'https://api.smai.ai',
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  description:
    'smai.ai 提供多种 AI 模型服务，支持 GPT、Claude、Gemini、DeepSeek 等主流大模型，新版本API，推荐使用。',
  disableBrowserRequest: false,
  enabled: true,
  id: 'smai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://api.smai.ai',
  name: 'smai.ai',
  settings: {
    defaultShowBrowserRequest: false,
    disableBrowserRequest: false,
    sdkType: 'router',
    showModelFetcher: true,
  },
  url: 'https://api.smai.ai',
};

export default SMAI;
