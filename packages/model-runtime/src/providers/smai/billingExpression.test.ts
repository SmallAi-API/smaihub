import { describe, expect, it } from 'vitest';

import { parseSMAIBillingExpression } from './billingExpression';

describe('parseSMAIBillingExpression', () => {
  it('reads the upstream USD/million coefficients without applying ratio conversions', () => {
    expect(
      parseSMAIBillingExpression('tier("默认", p * 2 + cr * 0.1 + cc * 2.5 + c * 10)'),
    ).toEqual([{ rates: { c: 10, cc: 2.5, cr: 0.1, p: 2 }, upTo: 'infinity' }]);
  });

  it('accepts v1, quoted tier names, scientific notation and linear arithmetic', () => {
    expect(
      parseSMAIBillingExpression(
        " v1: (tier('John\\'s tier', (2 * p + c / .5) * (1 + .5) - p * 0)) ",
      ),
    ).toEqual([{ rates: { c: 3, p: 3 }, upTo: 'infinity' }]);
    expect(parseSMAIBillingExpression('tier("free", +p * 0 + c * 1E-2)')).toEqual([
      { rates: { c: 0.01, p: 0 }, upTo: 'infinity' },
    ]);
    expect(parseSMAIBillingExpression('tier("discount", p * 3 + -p)')).toEqual([
      { rates: { p: 2 }, upTo: 'infinity' },
    ]);
  });

  it('preserves context thresholds and free categories referenced only in another branch', () => {
    expect(
      parseSMAIBillingExpression(
        'len <= 272000 ? tier("默认", p * 2 + c * 10) : tier("长上下文", p * 4 + cr * 0.4 + c * 15)',
      ),
    ).toEqual([
      { rates: { c: 10, cr: 0, p: 2 }, upTo: 272000 },
      { rates: { c: 15, cr: 0.4, p: 4 }, upTo: 'infinity' },
    ]);
  });

  it.each([
    ['len < 100', 99, 1, 2],
    ['len >= 100', 99, 2, 1],
    ['len > 100', 100, 2, 1],
    ['len <= 100', 100, 1, 2],
  ])('normalizes integer boundaries for %s', (condition, upTo, low, high) => {
    expect(parseSMAIBillingExpression(`${condition} ? tier("a", p) : tier("b", p * 2)`)).toEqual([
      { rates: { p: low }, upTo },
      { rates: { p: high }, upTo: 'infinity' },
    ]);
  });

  it('handles multiple nested thresholds, including branches wrapped in parentheses', () => {
    expect(
      parseSMAIBillingExpression(
        'len > 200 ? tier("long", p * 3) : (len <= 100 ? tier("short", p) : tier("medium", p * 2))',
      ),
    ).toEqual([
      { rates: { p: 1 }, upTo: 100 },
      { rates: { p: 2 }, upTo: 200 },
      { rates: { p: 3 }, upTo: 'infinity' },
    ]);
    expect(
      parseSMAIBillingExpression('len < 0 ? tier("unreachable", p) : tier("base", p * 2)'),
    ).toEqual([{ rates: { p: 2 }, upTo: 'infinity' }]);
  });

  it('keeps all optional multimodal and cache variables', () => {
    const rates = {
      ai: 7,
      ao: 8,
      c: 2,
      cc: 4,
      cc12h: 6,
      cc1h: 5,
      cr: 3,
      img: 9,
      img_cr: 10,
      img_o: 11,
      p: 1,
    };
    const terms = Object.entries(rates)
      .map(([name, rate]) => `${name} * ${rate}`)
      .join(' + ');
    expect(parseSMAIBillingExpression(`tier("all", ${terms})`)).toEqual([
      { rates, upTo: 'infinity' },
    ]);
  });

  it.each([
    '',
    'v2: tier("x", p * 2)',
    'p * 2',
    'tier("x", p * -2)',
    'tier("x", p * 1e999)',
    'tier("x", p / 0)',
    'tier("x", p * c)',
    'tier("x", p / c)',
    'tier("x", p * 2 + 1)',
    'tier("x", fixed(0.1))',
    'tier("x", p * 2) * image_count',
    'tier("x", min(p, 100) * 2)',
    'tier("x", p * 2) * (hour("Asia/Shanghai") < 12 ? 2 : 1)',
    'param("service_tier") == "fast" ? tier("x", p) : tier("y", p * 2)',
    'len == 100 ? tier("x", p) : tier("y", p * 2)',
    'p < 100 ? tier("x", p + cr * 0.1) : tier("y", p * 2 + cr * 0.2)',
    'len <= 1.5 ? tier("x", p) : tier("y", p * 2)',
    'len <= 1e99 ? tier("x", p) : tier("y", p * 2)',
    'tier(123, p * 2)',
    'tier("x", p * 2',
    'tier("x", p * 2); globalThis.hacked = true',
    'tier("x", p * 2) garbage',
  ])('returns unknown for unsupported or unsafe input: %s', (expression) => {
    expect(parseSMAIBillingExpression(expression)).toBeUndefined();
  });

  it('bounds the amount of remote expression parsing work', () => {
    expect(parseSMAIBillingExpression(' '.repeat(20_001))).toBeUndefined();
    expect(
      parseSMAIBillingExpression(`tier("x", ${'('.repeat(40)}p${')'.repeat(40)})`),
    ).toBeUndefined();
    expect(
      parseSMAIBillingExpression(`tier("x", ${Array.from({ length: 600 }).fill('p').join('+')})`),
    ).toBeUndefined();
    expect(
      parseSMAIBillingExpression(`tier("x", ${Array.from({ length: 80 }).fill('p').join('+')})`),
    ).toBeUndefined();
  });
});
