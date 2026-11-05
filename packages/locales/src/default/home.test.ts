import { createInstance } from 'i18next';
import { describe, expect, it } from 'vitest';

import enUS from '../../../../locales/en-US/home.json';
import zhCN from '../../../../locales/zh-CN/home.json';
import home from './home';

describe('home usage card translations', () => {
  it.each([
    ['default', home, 'Updated 12:34:56'],
    ['en-US', enUS, 'Updated 12:34:56'],
    ['zh-CN', zhCN, '更新于 12:34:56'],
  ])(
    'resolves quota labels and interpolates the refresh time (%s)',
    async (_, resources, updated) => {
      const i18n = createInstance();
      await i18n.init({
        defaultNS: 'home',
        fallbackLng: false,
        keySeparator: false,
        lng: 'en',
        resources: { en: { home: resources } },
      });

      for (const key of [
        'usage.billingQuota',
        'usage.details',
        'usage.refresh',
        'usage.remainingProgress',
        'usage.topics',
        'usage.unlimited',
        'usage.unlimitedHint',
      ] as const) {
        expect(i18n.t(key, { ns: 'home' })).not.toBe(key);
        expect(i18n.t(key, { ns: 'home' })).not.toBe('');
      }

      expect(i18n.t('usage.updatedAt', { ns: 'home', time: '12:34:56' })).toBe(updated);
    },
  );
});
