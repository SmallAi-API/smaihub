const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'resources/locales/en',
  entryLocale: 'en',
  output: 'resources/locales',
  outputLocales: ['zh-TW', 'zh-CN'],
  saveImmediately: true,
  temperature: 0,
  modelName: 'gpt-4.1-mini',
  experimental: {
    jsonMode: true,
  },
});
