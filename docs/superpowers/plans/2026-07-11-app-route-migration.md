# SmallAI App Route Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the existing SmallAI download page at `/app`, redirect its former `/download` URL to `/app`, and leave the newer `/downloads` hub unchanged.

**Architecture:** Keep the existing page and layout modules under `src/routes/(download)/download`; only the public route registration changes. Mirror the canonical route and compatibility redirect in both desktop router configurations, then update the one internal homepage promotion that still targets the former URL.

**Tech Stack:** TypeScript, React 19, React Router route objects, Vitest, Testing Library

## Global Constraints

- `/downloads` and `src/features/Downloads` must remain unchanged.
- `/app` is the canonical URL for `src/routes/(download)/download`.
- `/download` must redirect to `/app` with history replacement through `redirectElement`.
- `src/spa/router/desktopRouter.config.tsx` and `src/spa/router/desktopRouter.config.desktop.tsx` must keep identical route paths.
- Do not rename `src/routes/(download)/download`.
- Do not change `/api/download/version` or external URLs such as `https://www.smallai.asia/download`.
- Do not add the legacy page to `mobileRouter.config.tsx`.

## File Map

- `src/spa/router/desktopRouter.sync.test.tsx`: regression coverage for canonical and compatibility routes in both desktop router sources.
- `src/spa/router/desktopRouter.config.tsx`: async Web/Electron route tree; registers the page at `/app` and redirects `/download`.
- `src/spa/router/desktopRouter.config.desktop.tsx`: synchronous Electron route tree mirroring the same paths and redirect.
- `src/routes/(main)/home/_layout/Footer/index.test.tsx`: verifies the SmallAI promotion exposes `/app` as its action link.
- `src/routes/(main)/home/_layout/Footer/index.tsx`: changes the legacy promotion action URL only.

---

### Task 1: Register `/app` and Preserve `/download` Compatibility

**Files:**

- Modify: `src/spa/router/desktopRouter.sync.test.tsx`
- Modify: `src/spa/router/desktopRouter.config.tsx`
- Modify: `src/spa/router/desktopRouter.config.desktop.tsx`

**Interfaces:**

- Consumes: existing `desktopRoutes: RouteObject[]` and `redirectElement(to: string)` router helper.

- Produces: canonical `/app` route rendering the existing SmallAI page and `/download` compatibility route redirecting to `/app` in both route trees.

- [ ] **Step 1: Write the failing route regression test**

Add this test inside `describe('desktopRouter config sync', ...)` in `src/spa/router/desktopRouter.sync.test.tsx`:

```tsx
it('serves the legacy SmallAI page at /app and redirects /download in both configs', async () => {
  const [asyncSource, syncSource] = await readDesktopRouterSources();

  for (const source of [asyncSource, syncSource]) {
    expect(source).toContain("path: '/app'");
    expect(source).toContain("element: redirectElement('/app')");
    expect(source).toContain("path: '/download'");
  }

  expect(asyncSource).toContain("import('@/routes/(download)/download')");
  expect(syncSource).toContain("from '@/routes/(download)/download'");
});
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```powershell
bunx vitest run --silent='passed-only' 'src/spa/router/desktopRouter.sync.test.tsx'
```

Expected: FAIL in the new test because neither router source contains `path: '/app'` or `redirectElement('/app')` yet.

- [ ] **Step 3: Change the async desktop/Web route registration**

In `src/spa/router/desktopRouter.config.tsx`, retain the existing page/layout imports but change the page route path and append the compatibility redirect:

```tsx
desktopRoutes.push({
  children: [
    {
      element: dynamicElement(() => import('@/routes/(download)/download'), 'Desktop > Download'),
      index: true,
    },
  ],
  element: dynamicLayout(
    () => import('@/routes/(download)/download/_layout/RouteLayout'),
    'Desktop > Download > Layout',
  ),
  errorElement: <ErrorBoundary />,
  path: '/app',
});

desktopRoutes.push({
  element: redirectElement('/app'),
  path: '/download',
});
```

- [ ] **Step 4: Mirror the route registration in the synchronous Electron config**

In `src/spa/router/desktopRouter.config.desktop.tsx`, retain `DownloadPage` and `DownloadRouteLayout`, change the canonical path, and append the same compatibility redirect:

```tsx
desktopRoutes.push({
  children: [
    {
      element: <DownloadPage />,
      index: true,
    },
  ],
  element: <DownloadRouteLayout />,
  errorElement: <ErrorBoundary />,
  path: '/app',
});

desktopRoutes.push({
  element: redirectElement('/app'),
  path: '/download',
});
```

- [ ] **Step 5: Run the route test and verify GREEN**

Run:

```powershell
bunx vitest run --silent='passed-only' 'src/spa/router/desktopRouter.sync.test.tsx'
```

Expected: PASS, including the existing path-parity test and the new `/app` compatibility test.

- [ ] **Step 6: Commit the route migration**

```powershell
git add -- 'src/spa/router/desktopRouter.sync.test.tsx' 'src/spa/router/desktopRouter.config.tsx' 'src/spa/router/desktopRouter.config.desktop.tsx'
git commit -m "♻️ refactor(routes): move legacy download page to app"
```

### Task 2: Update and Verify the Homepage Promotion Link

**Files:**

- Modify: `src/routes/(main)/home/_layout/Footer/index.test.tsx`
- Modify: `src/routes/(main)/home/_layout/Footer/index.tsx`

**Interfaces:**

- Consumes: `PRODUCT_HUNT_NOTIFICATION.actionHref` passed to `HighlightNotification`.

- Produces: homepage SmallAI promotion action link targeting canonical `/app` while the separate Get App menu link continues to target `/downloads`.

- [ ] **Step 1: Extend the existing HighlightNotification mock to expose links**

In the mock prop interface in `src/routes/(main)/home/_layout/Footer/index.test.tsx`, add `actionHref`:

```tsx
default: (props: {
  actionHref?: string;
  actionLabel?: string;
  description?: string;
  onAction?: () => void;
  onActionClick?: () => void;
  onClose?: () => void;
  open?: boolean;
  title?: string;
}) =>
```

Replace the mock's existing action-label block with link-aware rendering:

```tsx
{props.actionLabel &&
  (props.actionHref ? (
    <a href={props.actionHref} onClick={props.onActionClick}>
      {props.actionLabel}
    </a>
  ) : (
    <button
      type="button"
      onClick={() => {
        if (props.onAction) props.onAction();
        else props.onActionClick?.();
      }}
    >
      {props.actionLabel}
    </button>
  ))}
```

Add `vi.useRealTimers()` to the existing `afterEach` cleanup so the time-window test cannot leak fake timers into other cases:

```tsx
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  // Keep the existing vi.doUnmock(...) calls below this line.
});
```

- [ ] **Step 2: Write the failing promotion-link test**

Add this test after the agent onboarding promotion describe block:

```tsx
describe('Footer SmallAI desktop promotion', () => {
  it('links the promotion action to the canonical /app route', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T00:00:00.000Z'));

    await renderFooter({ enabled: false });

    const card = screen.getByTestId('highlight-notification');
    expect(within(card).getByRole('link', { name: 'Support us' })).toHaveAttribute('href', '/app');
  });
});
```

- [ ] **Step 3: Run the footer test and verify RED**

Run:

```powershell
bunx vitest run --silent='passed-only' 'src/routes/(main)/home/_layout/Footer/index.test.tsx'
```

Expected: FAIL because the rendered promotion link still has `href="/download"`.

- [ ] **Step 4: Point the promotion at `/app`**

In `src/routes/(main)/home/_layout/Footer/index.tsx`, change only the internal action URL:

```tsx
const PRODUCT_HUNT_NOTIFICATION = {
  actionHref: '/app',
  endTime: new Date('2026-04-30T00:00:00Z'),
  image: 'https://smaihub-1301925107.cos.ap-guangzhou.myqcloud.com/logo/windows.png',
  slug: 'smai.ai-desktop',
  startTime: new Date('2026-04-15T00:00:00Z'),
} as const;
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```powershell
bunx vitest run --silent='passed-only' 'src/spa/router/desktopRouter.sync.test.tsx' 'src/routes/(main)/home/_layout/Footer/index.test.tsx'
```

Expected: both test files PASS with zero failed tests.

- [ ] **Step 6: Run lint, type-check, and static scope verification**

Run:

```powershell
node 'node_modules/eslint/bin/eslint.js' 'src/spa/router/desktopRouter.sync.test.tsx' 'src/spa/router/desktopRouter.config.tsx' 'src/spa/router/desktopRouter.config.desktop.tsx' 'src/routes/(main)/home/_layout/Footer/index.test.tsx' 'src/routes/(main)/home/_layout/Footer/index.tsx'
bun run type-check
git diff --check
rg -n -F '/downloads' 'src/features/User/UserPanel/useMenu.tsx' 'src/routes/(main)/home/_layout/Footer/index.tsx'
rg -n -F "path: 'downloads'" 'src/spa/router/desktopRouter.config.tsx' 'src/spa/router/desktopRouter.config.desktop.tsx' 'src/spa/router/mobileRouter.config.tsx'
rg -n -F '/api/download/version' 'src/routes/(download)/download/_lib/version.ts'
```

Expected:

- ESLint exits 0.

- Type-check exits 0.

- `git diff --check` produces no output.

- `/downloads` remains present in the new downloads-hub menu, and `path: 'downloads'` remains registered in both desktop configs and the mobile config.

- `/api/download/version` remains unchanged in the legacy page version helper.

- [ ] **Step 7: Review the final diff and commit the promotion update**

Run:

```powershell
git diff --stat
git diff -- 'src/routes/(main)/home/_layout/Footer/index.test.tsx' 'src/routes/(main)/home/_layout/Footer/index.tsx'
git add -- 'src/routes/(main)/home/_layout/Footer/index.test.tsx' 'src/routes/(main)/home/_layout/Footer/index.tsx'
git commit -m "🔗 fix(navigation): point desktop promotion to app"
git status --short --branch
```

Expected: the final commit contains only the footer test and production link change; the branch is clean and ahead of its upstream by the documentation and implementation commits.
