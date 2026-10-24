import { describe, expect, it } from 'vitest';

import { formatQuota, remainingPercent } from './formatQuota';

describe('formatQuota', () => {
  it('uses the actual site conversion instead of a fixed default', () => {
    expect(
      formatQuota(4_000_000, { displayType: 'USD', quotaPerUnit: 250_000 }, 'en-US').text,
    ).toBe('$16.00');
    expect(
      formatQuota(
        4_000_000,
        { displayType: 'CNY', quotaPerUnit: 500_000, usdExchangeRate: 7.2 },
        'zh-CN',
      ).exact,
    ).toBe('57.6');
  });
  it('shows the dollar symbol without a country prefix in Chinese', () => {
    expect(
      formatQuota(4_000_000, { displayType: 'USD', quotaPerUnit: 250_000 }, 'zh-CN').text,
    ).toBe('$16.00');
  });
  it('formats used dollar quota with exactly two decimal places', () => {
    expect(
      formatQuota(617_280, { displayType: 'USD', quotaPerUnit: 500_000 }, 'zh-CN', 2).text,
    ).toBe('$1.23');
    expect(formatQuota(0, { displayType: 'USD', quotaPerUnit: 500_000 }, 'zh-CN', 2).text).toBe(
      '$0.00',
    );
  });
  it.each([
    [1, '<$0.01', '0.000002'],
    [-1, '>-$0.01', '-0.000002'],
  ])('keeps a truthful bound at two-decimal precision for %s', (quota, text, exact) => {
    expect(
      formatQuota(Number(quota), { displayType: 'USD', quotaPerUnit: 500_000 }, 'zh-CN', 2),
    ).toMatchObject({ exact, text });
  });
  it.each([
    {},
    { displayType: 'USD', quotaPerUnit: 0 },
    { displayType: 'CNY', quotaPerUnit: 500_000 },
  ])('falls back to billing credits without valid conversion: %s', (config) => {
    expect(formatQuota(4_000_000, config, 'en-US')).toMatchObject({
      currency: undefined,
      text: '4,000,000',
    });
  });
  it('does not round small positive balances to zero', () => {
    expect(formatQuota(1, { displayType: 'USD', quotaPerUnit: 500_000 }, 'en-US').text).toBe(
      '<$0.0001',
    );
  });
  it('preserves the bound and exact value for a small overdraft', () => {
    expect(formatQuota(-1, { displayType: 'USD', quotaPerUnit: 500_000 }, 'en-US')).toMatchObject({
      exact: '-0.000002',
      text: '>-$0.0001',
    });
  });
  it('clamps progress without altering the actual displayed quota', () => {
    expect(remainingPercent(-10, 100)).toBe(0);
    expect(remainingPercent(200, 100)).toBe(100);
    expect(remainingPercent(5, 0)).toBe(0);
    expect(remainingPercent(4, 5)).toBe(80);
  });
});
