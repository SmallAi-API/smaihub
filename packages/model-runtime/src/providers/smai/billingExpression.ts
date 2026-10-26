export type SMAITokenVariable =
  'p' | 'c' | 'cr' | 'cc' | 'cc1h' | 'cc12h' | 'img' | 'img_cr' | 'img_o' | 'ai' | 'ao';

type TokenRates = Partial<Record<SMAITokenVariable, number>>;

export interface SMAITokenTier {
  rates: TokenRates;
  upTo: number | 'infinity';
}

type Expression =
  | { kind: 'number'; value: number }
  | { kind: 'variable'; name: SMAITokenVariable }
  | { kind: 'binary'; left: Expression; operator: string; right: Expression }
  | { above: Expression; below: Expression; kind: 'condition'; upTo: number };

interface LinearValue {
  constant: number;
  rates: TokenRates;
}

const TOKEN_VARIABLES = new Set<string>([
  'p',
  'c',
  'cr',
  'cc',
  'cc1h',
  'cc12h',
  'img',
  'img_cr',
  'img_o',
  'ai',
  'ao',
]);

const unsupported = (): never => {
  throw new Error('Unsupported SMAI billing expression');
};

const scale = (value: LinearValue, factor: number): LinearValue => ({
  constant: value.constant * factor,
  rates: Object.fromEntries(
    Object.entries(value.rates).map(([name, rate]) => [name, rate * factor]),
  ),
});

const evaluate = (node: Expression, contextLength: number, depth = 0): LinearValue => {
  if (depth > 64) return unsupported();
  if (node.kind === 'number') return { constant: node.value, rates: {} };
  if (node.kind === 'variable') return { constant: 0, rates: { [node.name]: 1 } };
  if (node.kind === 'condition') {
    return evaluate(contextLength <= node.upTo ? node.below : node.above, contextLength, depth + 1);
  }

  const left = evaluate(node.left, contextLength, depth + 1);
  const right = evaluate(node.right, contextLength, depth + 1);
  if (node.operator === '+' || node.operator === '-') {
    const sign = node.operator === '+' ? 1 : -1;
    const rates = { ...left.rates };
    for (const name of Object.keys(right.rates) as SMAITokenVariable[]) {
      rates[name] = (rates[name] ?? 0) + sign * right.rates[name]!;
    }
    return { constant: left.constant + sign * right.constant, rates };
  }
  if (node.operator === '/') {
    if (Object.keys(right.rates).length > 0 || right.constant === 0) return unsupported();
    return scale(left, 1 / right.constant);
  }
  // Only scalar multiplication is representable as per-token rates.
  if (Object.keys(left.rates).length === 0) return scale(right, left.constant);
  if (Object.keys(right.rates).length === 0) return scale(left, right.constant);
  return unsupported();
};

/**
 * Read the displayable subset of new-api's expression language. Coefficients
 * already use USD / million tokens; legacy ratios must never be applied here.
 * This parser accepts linear token arithmetic, tier labels and integer `len`
 * thresholds only. Request/time rules, fixed fees and unknown syntax fail closed.
 * No upstream expression is executed as JavaScript.
 */
export const parseSMAIBillingExpression = (source: string): SMAITokenTier[] | undefined => {
  try {
    if (!source || source.length > 20_000) return undefined;
    const expression = source.trim().replace(/^v1:\s*/, '');
    const pattern =
      /\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-z_]\w*|<=|>=|[+\-*/()?:,<>])/giy;
    const tokens: string[] = [];
    let offset = 0;
    while (offset < expression.length) {
      const match = pattern.exec(expression);
      if (!match || tokens.length >= 1024) return undefined;
      tokens.push(match[1]);
      offset = pattern.lastIndex;
    }

    let position = 0;
    let hasTier = false;
    const thresholds = new Set<number>();
    const variables = new Set<SMAITokenVariable>();
    const take = (expected: string) => {
      if (tokens[position++] !== expected) unsupported();
    };

    function parsePrimary(depth: number): Expression {
      if (depth > 32) return unsupported();
      const token = tokens[position++];
      if (token === '(') {
        const value = parseExpression(depth + 1);
        take(')');
        return value;
      }
      if (token === '+' || token === '-') {
        return {
          kind: 'binary',
          left: { kind: 'number', value: token === '+' ? 1 : -1 },
          operator: '*',
          right: parsePrimary(depth + 1),
        };
      }
      if (token === 'tier') {
        hasTier = true;
        take('(');
        if (!/^["']/.test(tokens[position++] ?? '')) return unsupported();
        take(',');
        const value = parseExpression(depth + 1);
        take(')');
        return value;
      }
      if (TOKEN_VARIABLES.has(token)) {
        const name = token as SMAITokenVariable;
        variables.add(name);
        return { kind: 'variable', name };
      }
      if (token && /^(?:\d|\.)/.test(token) && Number.isFinite(Number(token))) {
        return { kind: 'number', value: Number(token) };
      }
      return unsupported();
    }

    function parseProduct(depth: number): Expression {
      let left = parsePrimary(depth);
      while (tokens[position] === '*' || tokens[position] === '/') {
        const operator = tokens[position++];
        left = { kind: 'binary', left, operator, right: parsePrimary(depth) };
      }
      return left;
    }

    function parseSum(depth: number): Expression {
      let left = parseProduct(depth);
      while (tokens[position] === '+' || tokens[position] === '-') {
        const operator = tokens[position++];
        left = { kind: 'binary', left, operator, right: parseProduct(depth) };
      }
      return left;
    }

    function parseExpression(depth: number): Expression {
      if (depth > 32) return unsupported();
      if (tokens[position] !== 'len') return parseSum(depth);
      position += 1;
      const operator = tokens[position++];
      const limit = Number(tokens[position++]);
      if (!['<', '<=', '>', '>='].includes(operator) || !Number.isSafeInteger(limit) || limit < 0) {
        return unsupported();
      }
      const upTo = operator === '<' || operator === '>=' ? limit - 1 : limit;
      if (upTo >= 0) thresholds.add(upTo);
      take('?');
      const whenTrue = parseExpression(depth + 1);
      take(':');
      const whenFalse = parseExpression(depth + 1);
      const ascending = operator === '<' || operator === '<=';
      return {
        above: ascending ? whenFalse : whenTrue,
        below: ascending ? whenTrue : whenFalse,
        kind: 'condition',
        upTo,
      };
    }

    const tree = parseExpression(0);
    if (position !== tokens.length || !hasTier || variables.size === 0) return undefined;
    const bounds: (number | 'infinity')[] = [...thresholds].sort((a, b) => a - b);
    bounds.push('infinity');
    let start = 0;
    return bounds.map((upTo) => {
      const value = evaluate(tree, start);
      if (value.constant !== 0) return unsupported();
      const rates: TokenRates = {};
      // Variables are opt-in across the entire AST in new-api, including branches
      // where a referenced category is free. Keep those explicit zero rates.
      for (const name of variables) {
        const rate = value.rates[name] ?? 0;
        if (!Number.isFinite(rate) || rate < 0) return unsupported();
        rates[name] = rate;
      }
      if (upTo !== 'infinity') start = upTo + 1;
      return { rates, upTo };
    });
  } catch {
    return undefined;
  }
};
