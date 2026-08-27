---
name: testing
description: 'Vitest testing guide. Use when writing or updating tests, fixing failing tests, improving coverage, debugging test issues, or setting up mocks.'
user-invocable: false
---

# LobeChat Testing Guide

## Quick Reference

**Commands:**

```bash
# Run specific test file
bunx vitest run --silent='passed-only' '[file-path]'

# Database package (client-db, PGlite — default, skips BM25/pg_search)
cd packages/database && bunx vitest run --silent='passed-only' '[file]'

# Database package (server-db, Postgres — BM25/pgvector parity, what CI measures coverage in)
cd packages/database && TEST_SERVER_DB=1 bunx vitest run --silent='passed-only' '[file]'
```

**Never run** `bun run test` - it runs all 3000+ tests (\~10 minutes).

> **Database models/repositories:** every new file under `packages/database/src/models/**`
> or `src/repositories/**` ships with a sibling `__tests__/<name>.test.ts` in the same PR.
> Use the real DB via `getTestDB()` (integration style), guard BM25/full-text-search blocks
> with `describe.skipIf(!isServerDB)`, and always test user-isolation. See
> `references/db-model-test.md` for setup, schema gotchas, and the client-vs-server-db split.

## Test Categories

| Category | Location                    | Config                          |
| -------- | --------------------------- | ------------------------------- |
| Webapp   | `src/**/*.test.ts(x)`       | `vitest.config.ts`              |
| Packages | `packages/*/**/*.test.ts`   | `packages/*/vitest.config.ts`   |
| Desktop  | `apps/desktop/**/*.test.ts` | `apps/desktop/vitest.config.ts` |

## Core Principles

1. **Prefer `vi.spyOn` over `vi.mock`** - More targeted, easier to maintain
2. **Tests must pass type check** - Run `bun run type-check` after writing tests
3. **After 1-2 failed fix attempts, stop and ask for help**
4. **Test behavior, not implementation details**
5. **Regression tests for bug fixes** - After fixing a bug, add a regression test that fails before the fix and passes after, to prevent recurrence. **Skip** pure style/CSS fixes (selector, hover, mask, spacing, color) when the only practical assertion would be source-string matching on the stylesheet — that is not a regression test worth shipping.
6. **No new component tests** - Only update existing React component tests. Complex logic should be extracted into hooks and tested there instead
7. **All source changes before any test changes** - Complete all source file edits first, then update tests in a separate pass. Interleaving disrupts reasoning about the source changes, especially across many files

## Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle normal case', () => {
      // Arrange → Act → Assert
    });
  });
});
```

## Mock Patterns

```typescript
// ✅ Spy on direct dependencies
vi.spyOn(messageService, 'createMessage').mockResolvedValue('id');

// ✅ Use vi.stubGlobal for browser APIs
vi.stubGlobal('Image', mockImage);
vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');

// ❌ Avoid mocking entire modules globally
vi.mock('@/services/chat'); // Too broad
```

## UI Library Mocks (@lobehub/ui/base-ui)

**Default: do NOT mock `@lobehub/ui/base-ui` — render the real components.**
`vitest.config.mts` redirects the library's internal MotionProvider to a static
stub (`tests/mocks/lobehubUiMotionProvider.tsx`), so base-ui components render in
tests without the app-level ConfigProvider. `Please wrap your app with <ConfigProvider> (or <MotionProvider>)` in a test means that redirect is not in
effect (e.g. a package-local vitest config) — do not fix it by hand-mocking every
component.

When a test genuinely wants simplified DOM, compose the canonical stubs over the
real module instead of writing a closed factory (closed factories break whenever
the library migrates a component's import path):

```typescript
vi.mock('@lobehub/ui/base-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('~base-ui-stubs')).baseUiStubs,
}));
```

`~base-ui-stubs` (`tests/mocks/baseUiStubs.tsx`) covers ActionIcon / Button /
Text / Tag / Avatar / Alert / toast / confirmModal / createModal with standard
aria semantics. A per-file factory is still fine when assertions need bespoke
testid conventions — but keep it composed over `importOriginal` so unknown
exports never go missing.

## Detailed Guides

See `references/` for specific testing scenarios:

- **Database Model testing**: `references/db-model-test.md`
- **Electron IPC testing**: `references/electron-ipc-test.md`
- **Zustand Store Action testing**: `references/zustand-store-action-test.md`
- **Agent Runtime E2E testing**: `references/agent-runtime-e2e.md`
- **Desktop Controller testing**: `references/desktop-controller-test.md`

## Common Issues

1. **Module pollution**: Use `vi.resetModules()` when tests fail mysteriously
2. **Mock not working**: Check setup position and use `vi.clearAllMocks()` in beforeEach
3. **Test data pollution**: Clean database state in beforeEach/afterEach
4. **Async issues**: Wrap state changes in `act()` for React hooks
