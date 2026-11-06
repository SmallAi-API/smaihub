import { describe, expect, it } from 'vitest';

import { matchLocale, normalizeLocale } from './resources';

describe('normalizeLocale', () => {
  it('should return "en-US" when locale is undefined', () => {
    expect(normalizeLocale()).toBe('en-US');
  });

  it('should return "zh-CN" when locale is "zh-CN"', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh-CN');
  });

  it('should return "zh-CN" when locale is "zh"', () => {
    expect(normalizeLocale('zh')).toBe('zh-CN');
  });

  it.each(['de', 'ru', 'ar', 'ar-EG', 'fr-FR', 'ja-JP', 'ko-KR', 'pt-BR', 'tr-TR', 'vi-VN'])(
    'falls back to English for unsupported locale %s',
    (locale) => {
      expect(normalizeLocale(locale)).toBe('en-US');
    },
  );

  it('should return "en-US" when locale is "en"', () => {
    expect(normalizeLocale('en')).toBe('en-US');
  });

  it('preserves Traditional Chinese', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-TW');
  });

  it('falls back to English for unknown locales', () => {
    expect(normalizeLocale('unknown')).toBe('en-US');
    expect(normalizeLocale('fr')).toBe('en-US');
  });
});

describe('matchLocale', () => {
  it('should return undefined when nothing is supported', () => {
    expect(matchLocale()).toBeUndefined();
    expect(matchLocale('unknown')).toBeUndefined();
    expect(matchLocale('en-GB')).toBeUndefined();
  });

  it('should return the matched locale', () => {
    expect(matchLocale('en')).toBe('en-US');
    expect(matchLocale('zh-Hant')).toBe('zh-TW');
    expect(matchLocale('zh-Hans-CN')).toBe('zh-CN');
    expect(matchLocale('cn')).toBe('zh-CN');
  });

  it.each(['ar-EG', 'ja-JP', 'pt-BR'])('rejects unsupported locale %s', (locale) => {
    expect(matchLocale(locale)).toBeUndefined();
  });
});

describe('matchLocale case handling', () => {
  it('matches a tag whatever its case', () => {
    expect(matchLocale('zh-cn')).toBe('zh-CN');
    expect(matchLocale('ZH-tw')).toBe('zh-TW');
    expect(matchLocale('EN')).toBe('en-US');
  });
});
