export const DEFAULT_EMBEDDING_PROVIDER = 'smai';

export const DEFAULT_MODEL = 'gpt-5.6-terra';
export const DEFAULT_PROVIDER = 'smai';
export const DEFAULT_MINI_MODEL = 'gpt-5.6-terra';
export const DEFAULT_MINI_PROVIDER = 'smai';

export const DEFAULT_ONBOARDING_MODEL = 'gpt-5.6-terra';
export const DEFAULT_ONBOARDING_PROVIDER = 'smai';

/**
 * The model Acceptance review predictions judge evidence screenshots with.
 * MUST be vision-capable — a text-only model silently "accepts on missing
 * evidence" for every check and no proposal ever surfaces (a model-bank
 * test in apps/server guards this).
 */
export const DEFAULT_REVIEW_PREDICT_MODEL = 'gemini-3.7-flash';
export const DEFAULT_REVIEW_PREDICT_PROVIDER = 'smai';

/**
 * The model the Verify LobeHub LLM calls judge a deliverable with when neither
 * a pinned verifier agent nor a usable parent model is available. MUST be
 * vision-capable — agent-type checks attach screenshot evidence, and a
 * text-only verifier cannot read the frames it is judging (it has to detour
 * through a vision sub-agent, and the long tail is exactly where verdict
 * submission breaks down). Kept here next to REVIEW_PREDICT so the cloud
 * build can pin both judge models in one place; a model-bank test in
 * apps/server guards the vision ability.
 */
export const DEFAULT_VERIFY_MODEL = 'gpt-5.6-terra';
export const DEFAULT_VERIFY_PROVIDER = 'smai';
