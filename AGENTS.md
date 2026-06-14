# LobeChat Development Guidelines

This document serves as a comprehensive guide for all team members when developing LobeChat.

## Project Description

You are developing an open-source, modern-design AI Agent Workspace: LobeHub (previously LobeChat).

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- SPA inside Next.js with `react-router-dom`
- `@lobehub/ui`, antd for components; antd-style for CSS-in-JS — **prefer `createStaticStyles` with `cssVar.*`** (zero-runtime); only fall back to `createStyles` + `token` when styles genuinely need runtime computation. See `.cursor/docs/createStaticStyles_migration_guide.md`.
- **Component priority**: `@lobehub/ui/base-ui` (headless primitives) **first**, then `@lobehub/ui` root, then antd as last resort. When the component exists in base-ui, use it — never reach for the root or antd counterpart. Base-ui covers `Select`, `Modal` / `createModal` / `confirmModal`, `DropdownMenu`, `ContextMenu`, `Popover`, `ScrollArea`, `Switch`, `Toast`, `FloatingSheet`. Prefer `@lobehub/ui/base-ui` for new code and migrate root-package call sites opportunistically.
- react-i18next for i18n; zustand for state management
- SWR for data fetching; TRPC for type-safe backend
- Drizzle ORM with PostgreSQL; Vitest for testing

## Project Structure

```plaintext
lobehub/
├── apps/
│   ├── desktop/            # Electron desktop app
│   ├── cli/                # LobeHub CLI
│   └── server/             # Server service
├── packages/               # Shared packages (@lobechat/*)
│   ├── database/           # Database schemas, models, repositories
│   ├── agent-runtime/      # Agent runtime
│   └── ...
├── src/
│   ├── app/                # Next.js app router
│   ├── spa/                # SPA entry points (entry.*.tsx) and router config
│   ├── routes/             # SPA page components (roots)
│   ├── features/           # Business components by domain
│   ├── store/              # Zustand stores
│   ├── services/           # Client services
│   ├── server/             # Server services and routers
│   └── ...
├── .agents/skills/         # AI development skills
└── e2e/                    # E2E tests (Cucumber + Playwright)
```

## Development Workflow

### Git Workflow

- The current release branch is `next` until v2.0.0 is officially released
- Use rebase for git pull
- Git commit messages should prefix with gitmoji
- Git branch name format: `username/feat/feature-name`
- Use `.github/PULL_REQUEST_TEMPLATE.md` for PR descriptions
- **Protection of local changes**: Never use `git restore`, `git checkout --`, `git reset --hard`, or any other command or workflow that can forcibly overwrite, discard, or silently replace user-owned uncommitted changes. Before any revert or restoration affecting existing files, inspect the working tree carefully and obtain explicit user confirmation.

### Package Management

- Use `pnpm` as the primary package manager
- Use `bun` to run npm scripts
- Use `bunx` to run executable npm packages

### Code Style Guidelines

#### TypeScript

- Prefer interfaces over types for object shapes

### Testing Strategy

```bash
# Web tests
bunx vitest run --silent='passed-only' '[file-path-pattern]'

# Package tests (e.g., database)
cd packages/[package-name] && bunx vitest run --silent='passed-only' '[file-path-pattern]'
```

- Prefer `vi.spyOn` over `vi.mock`

### Type Checking

```bash
bun run type-check
```

### i18n

- Add keys to a namespace file under `src/locales/default/` (e.g. `agent.ts`, `auth.ts`)
- For dev preview: translate `locales/zh-CN/` and `locales/en-US/`
- `pnpm i18n` is slow; run it manually when locale keys need updating (e.g. before opening a PR).

### Code Style

- When a single file grows beyond \~800 lines, consider splitting it into multiple files (extract sub-components, hooks, helpers, or types). Smaller, focused files are friendly to humans and agents.

### Code Review

Before reviewing a PR / diff / branch change, read the **review-checklist** skill (`.agents/skills/review-checklist/SKILL.md`) — it lists the recurring mistakes specific to this codebase.

When designing or reviewing user-facing flows (empty/loading/error states, confirmations, async feedback, button hierarchy, lists at scale, pickers), follow the **ux** skill (`.agents/skills/ux/SKILL.md`) — LobeHub's design values (自然 / 意义感 / 确定性) plus per-aspect execution checklists.
