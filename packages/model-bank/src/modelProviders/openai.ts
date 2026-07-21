import type { ModelProviderCard } from '../types';

// ref: https://platform.openai.com/docs/deprecations
const OpenAI: ModelProviderCard = {
  apiKeyUrl: 'https://api.smai.ai',
  chatModels: [],
  checkModel: 'gpt-5-mini',
  defaultShowBrowserRequest: false,
  description: '仅支持部分SmallAI GPT全系列模型可用，例如 GPT4o mini / GPT 5.1 等',
  disableBrowserRequest: false,
  id: 'openai',
  modelList: { showModelFetcher: false },
  modelsUrl: 'https://smallai-pro.feishu.cn/base/PpzVb1Zega9HPJsMHVtczS7Nnah',
  name: 'SmallAi GPT',
  settings: {
    defaultShowBrowserRequest: false,
    disableBrowserRequest: false,
    proxyUrl: {
      placeholder: 'https://35fast.aigcbest.top/v1',
    },
    responseAnimation: 'smooth',
    showModelFetcher: false,
    supportResponsesApi: true,
  },
  url: 'https://www.smallai.asia',
};

export default OpenAI;
