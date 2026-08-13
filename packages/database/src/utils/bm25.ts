import { type SQL, sql, type SQLWrapper } from 'drizzle-orm';

const BM25_BOOLEAN_OPERATORS = new Set(['AND', 'OR', 'NOT']);
const BM25_MAX_TERMS = 48;

// NOTICE:
// This utility is used by multiple lexical search paths. We keep safe defaults
// to prevent parser-hostile queries (for example, huge tool-output payloads
// containing many boolean-like tokens), while exposing options so specific
// call sites can tune behavior if they have stricter/looser requirements.
export interface SanitizeBm25QueryOptions {
  dropBooleanOperators?: boolean;
  maxTerms?: number;
}

export const SAFE_BM25_QUERY_OPTIONS: Required<SanitizeBm25QueryOptions> = {
  dropBooleanOperators: true,
  maxTerms: BM25_MAX_TERMS,
};

const normalizeBm25Terms = (query: string, options: SanitizeBm25QueryOptions = {}) => {
  const { dropBooleanOperators = false, maxTerms } = options;
  const terms = query
    .trim()
    .replaceAll('-', ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => !dropBooleanOperators || !BM25_BOOLEAN_OPERATORS.has(word.toUpperCase()))
    .filter(Boolean);

  return typeof maxTerms === 'number' ? terms.slice(0, Math.max(1, maxTerms)) : terms;
};

/**
 * Escape special tantivy query syntax characters and join terms with AND
 * so all words must match (instead of Tantivy's default OR behavior).
 */
export function sanitizeBm25Query(query: string, options: SanitizeBm25QueryOptions = {}): string {
  const terms = normalizeBm25Terms(query, options)
    // NOTICE:
    // Keep `<` and `>` in this escape set. Angle-bracket wrapped tokens can be
    // interpreted as range-query boundaries by the BM25 parser and may trigger
    // parse failures when the boundary contains multiple terms.
    //
    // NOTICE:
    // No search path uses this function any more — every BM25 call site now goes
    // through `buildBm25MatchAny`, because whitespace splitting silently breaks
    // CJK queries (see that function's doc comment). Kept for its tests and for
    // callers that genuinely need a Tantivy parser string; prefer
    // `buildBm25MatchAny` for anything user-facing.
    .map((word) => word.replaceAll(/[+&|!(){}[\]^"'`~*?:\\/<>]/g, '\\$&'));

  if (terms.length === 0) throw new Error('Query is empty after sanitization');

  return terms.join(' AND ');
}

/**
 * Normalizes raw text before passing it to ParadeDB `paradedb.match`.
 *
 * Before:
 * - "I'm checking curl -H X-API-Key AND OR NOT"
 *
 * After:
 * - "I'm checking curl H X API Key"
 *
 * Use when:
 * - The search path should let ParadeDB tokenize raw text instead of parsing Tantivy query syntax
 * - The caller still needs safe query-size limits for long tool or chat payloads
 *
 * Expects:
 * - Raw user/chat text, not pre-escaped Tantivy query syntax
 * - Options matching the BM25 search path risk profile
 *
 * Returns:
 * - Whitespace-joined terms suitable for `paradedb.match(field, value, conjunction_mode => true)`
 */
export function normalizeBm25MatchQuery(
  query: string,
  options: SanitizeBm25QueryOptions = {},
): string {
  const terms = normalizeBm25Terms(query, options);

  if (terms.length === 0) throw new Error('Query is empty after normalization');

  return terms.join(' ');
}

/**
 * Builds a `key @@@ paradedb.boolean(...)` predicate matching `query` against
 * any of `fields`.
 *
 * Prefer this over hand-writing `field @@@ '<parsed query string>'`. The parser
 * string form splits the query on whitespace (see `normalizeBm25Terms`), so a
 * space-free CJK phrase such as 合同审核意见 reaches tantivy as a *single* term.
 * The ICU tokenizer split that same text into 合同 / 审核 / 意见 at index time, so
 * the whole-phrase term matches nothing and the search silently returns zero
 * rows — measured on production: 0 hits for the phrase vs 470 for the same words
 * routed through `paradedb.match`. `paradedb.match` re-tokenizes the input with
 * the field's own tokenizer, so query-side and index-side tokens finally agree.
 *
 * `conjunction_mode => true` keeps the existing "all words must match" semantics
 * that `sanitizeBm25Query`'s ` AND ` join provided.
 *
 * The result is deliberately shaped as a single `keyColumn @@@ ...` expression:
 * ParadeDB only picks its TopN custom scan when the scan node carries the whole
 * `ORDER BY paradedb.score() LIMIT n`, and that requires the match predicate to
 * stay a bm25 operator on the key column rather than becoming an OR of them. See
 * the scan-shape invariant in `repositories/search/index.ts`.
 */
export function buildBm25MatchAny(
  keyColumn: SQLWrapper,
  fields: string[],
  query: string,
  options: SanitizeBm25QueryOptions = SAFE_BM25_QUERY_OPTIONS,
): SQL<boolean> {
  if (fields.length === 0) throw new Error('buildBm25MatchAny requires at least one field');

  const matchQuery = normalizeBm25MatchQuery(query, options);
  const matchers = fields.map(
    (field) => sql`paradedb.match(${field}, ${matchQuery}, conjunction_mode => true)`,
  );

  return sql<boolean>`${keyColumn} @@@ paradedb.boolean(should => ARRAY[${sql.join(matchers, sql`, `)}])`;
}
