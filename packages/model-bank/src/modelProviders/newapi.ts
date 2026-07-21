import type { ModelProviderCard } from '../types';

const NewAPI: ModelProviderCard = {
  apiKeyUrl: 'https://api.smai.ai',
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  defaultShowBrowserRequest: false,
  description: 'SmallAi 全系列模型，支持 GPT、Claude、Gemini、DeepSeek 等主流大模型',
  disableBrowserRequest: false,
  enabled: true,
  id: 'newapi',
  modelList: { showModelFetcher: false },
  modelsUrl: 'https://smallai-pro.feishu.cn/base/PpzVb1Zega9HPJsMHVtczS7Nnah',
  name: 'SmallAi',
  settings: {
    defaultShowBrowserRequest: false,
    disableBrowserRequest: false,
    sdkType: 'router',
    showModelFetcher: false,
    supportResponsesApi: true,
  },

  url: 'https://www.smallai.asia',
};

export default NewAPI;
