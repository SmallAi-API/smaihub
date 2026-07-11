# SmallAI App Page Route Migration Design

## Goal

Move the existing SmallAI download page from `/download` to `/app` without changing the newer downloads hub at `/downloads`.

## Current State

- `/download` renders the legacy SmallAI download page from `src/routes/(download)/download`.
- `/downloads` renders the newer downloads hub from `src/features/Downloads`.
- The legacy page is registered independently in both desktop router configurations.
- The homepage desktop-app promotion still links internally to `/download`.

## Route Behavior

- `/app` becomes the canonical route for the legacy SmallAI download page.
- `/download` remains registered as a compatibility route and redirects to `/app` with history replacement.
- `/downloads` remains unchanged and continues to render the newer downloads hub.
- The route remains personal-only and is not added beneath `/:workspaceSlug`.

## Implementation Scope

Update both desktop route trees so their paths and redirect behavior remain synchronized:

- `src/spa/router/desktopRouter.config.tsx`
- `src/spa/router/desktopRouter.config.desktop.tsx`

Update the homepage promotion's internal action URL from `/download` to `/app`:

- `src/routes/(main)/home/_layout/Footer/index.tsx`

Keep `src/routes/(download)/download` in place. Its directory name is an implementation detail and does not determine the public URL, so moving it would add churn without changing behavior.

## Explicit Non-Goals

- Do not change `/downloads` or `src/features/Downloads`.
- Do not change `/api/download/version`; it is an API endpoint used by the legacy page.
- Do not change external URLs such as `https://www.smallai.asia/download`.
- Do not add `/app` to the mobile router independently; the existing legacy page is registered through the desktop/web route tree only.
- Do not redesign or refactor the legacy page UI.

## Testing

Use a test-first route migration:

1. Add assertions that both desktop router sources register the canonical `/app` route and preserve `/download` as a redirect to `/app`.
2. Update the homepage footer test coverage to require the relevant internal promotion URL to resolve to `/app` where that behavior is exposed by the existing test harness.
3. Run the new assertions before implementation and confirm they fail for the missing `/app` behavior.
4. Apply the minimal router and link changes.
5. Run the focused route/footer tests, then run the repository check command against all changed TypeScript files.

## Acceptance Criteria

- Opening `/app` renders the existing SmallAI download page.
- Opening `/download` redirects to `/app` without leaving an extra history entry.
- Opening `/downloads` still renders the newer downloads hub.
- Web and Electron desktop router configurations remain synchronized.
- The homepage promotion no longer sends users to `/download`.
- Download API and external download URLs remain unchanged.
