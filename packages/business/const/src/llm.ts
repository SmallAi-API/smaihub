export const DEFAULT_EMBEDDING_PROVIDER = 'smai';

export const DEFAULT_MODEL = 'gpt-5.6-luna';
export const DEFAULT_PROVIDER = 'smai';
export const DEFAULT_MINI_MODEL = 'gpt-5.6-luna';
export const DEFAULT_MINI_PROVIDER = 'smai';

export const DEFAULT_ONBOARDING_MODEL = 'gpt-5.6-luna';
export const DEFAULT_ONBOARDING_PROVIDER = 'smai';

/**
 * The model Acceptance review predictions judge evidence screenshots with.
 * MUST be vision-capable — a text-only model silently "accepts on missing
 * evidence" for every check and no proposal ever surfaces (a model-bank
 * test in apps/server guards this).
 */
export const DEFAULT_REVIEW_PREDICT_MODEL = 'gemini-3.7-flash';
export const DEFAULT_REVIEW_PREDICT_PROVIDER = 'smai';
