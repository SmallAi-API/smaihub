// Re-export the real package so new upstream constants reach the desktop build
// automatically — a hand-maintained copy kept drifting and breaking the main
// build with MISSING_EXPORT. Only list desktop-specific overrides below; a local
// export takes precedence over the `export *` binding of the same name.
export * from '../../../../../packages/business/const/src';

export const DEFAULT_MINI_MODEL = 'gpt-5.4-mini';
