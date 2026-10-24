export interface QuotaDisplayConfig {
  displayType?: string;
  quotaPerUnit?: number;
  usdExchangeRate?: number;
}

/** Internal billing quota is neither model tokens nor money until configured. */
export const formatQuota = (
  quota: number,
  config: QuotaDisplayConfig,
  locale: string,
  maximumFractionDigits = 4,
) => {
  const { displayType, quotaPerUnit, usdExchangeRate } = config;
  const converted = !!quotaPerUnit && Number.isFinite(quotaPerUnit) && quotaPerUnit > 0;
  const useCny =
    displayType === 'CNY' &&
    !!usdExchangeRate &&
    Number.isFinite(usdExchangeRate) &&
    usdExchangeRate > 0;
  const currency =
    converted && (displayType === 'USD' || useCny) ? (useCny ? 'CNY' : 'USD') : undefined;
  const value = currency ? (quota / quotaPerUnit!) * (useCny ? usdExchangeRate! : 1) : quota;
  const options: Intl.NumberFormatOptions = currency
    ? {
        currency,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits,
        minimumFractionDigits: 2,
        style: 'currency',
      }
    : { maximumFractionDigits: 0 };
  const formatted = new Intl.NumberFormat(locale, options).format(value);
  const smallestUnit = 10 ** -maximumFractionDigits;
  // A small positive balance must not look exhausted after rounding.
  const text =
    currency && value !== 0 && Math.abs(value) < smallestUnit
      ? `${value < 0 ? '>' : '<'}${new Intl.NumberFormat(locale, options).format(value < 0 ? -smallestUnit : smallestUnit)}`
      : formatted;
  return {
    currency,
    exact: new Intl.NumberFormat(locale, { maximumFractionDigits: 12 }).format(value),
    text,
  };
};

export const remainingPercent = (available: number, granted: number): number =>
  granted > 0 ? Math.max(0, Math.min(100, (available / granted) * 100)) : 0;
