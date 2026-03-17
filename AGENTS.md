# LobeChat Development Guidelines

This document serves as a comprehensive guide for all team members when developing LobeChat.

## Project Description

You are developing an open-source, modern-design AI Agent Workspace: LobeHub (previously LobeChat).

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Ant Design, @lobehub/ui, antd-style
- **State Management**: Zustand, SWR
- **Database**: PostgreSQL, PGLite, Drizzle ORM
- **Testing**: Vitest, Testing Library
- **Package Manager**: pnpm (monorepo structure)

## Directory Structure

```
lobe-chat/
├── apps/desktop/           # Electron desktop app
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

**Important Notes**:

- Wrap file paths in single quotes to avoid shell expansion
- Never run `bun run test` - this runs all tests and takes \~10 minutes

### Type Checking

- Use `bun run type-check` to check for type errors

### i18n

- **Keys**: Add to `src/locales/default/namespace.ts`
- **Dev**: Translate `locales/zh-CN/namespace.json` locale file only for preview
- DON'T run `pnpm i18n`, let CI auto handle it

## Linear Issue Management

Follow [Linear rules in CLAUDE.md](CLAUDE.md#linear-issue-management-ignore-if-not-installed-linear-mcp) when working with Linear issues.

## SPA Routes and Features

- **`src/routes/`** holds only page segments (layout + page entry files). Keep route files thin; they should import from `@/features/*` and compose.
- **`src/features/`** holds business components by domain. Put layout pieces, hooks, and domain UI here.
- See [CLAUDE.md – SPA Routes and Features](CLAUDE.md#spa-routes-and-features) and the **spa-routes** skill for how to add new routes and how to split files.

## Skills (Auto-loaded)

All AI development skills are available in `.agents/skills/` directory:

| Category     | Skills                                     |
| ------------ | ------------------------------------------ |
| Frontend     | `react`, `typescript`, `i18n`, `microcopy` |
| State        | `zustand`                                  |
| Backend      | `drizzle`                                  |
| Desktop      | `desktop`                                  |
| Testing      | `testing`                                  |
| UI           | `modal`, `hotkey`, `recent-data`           |
| Config       | `add-provider-doc`, `add-setting-env`      |
| Workflow     | `linear`, `debug`                          |
| Architecture | `spa-routes`                               |
| Performance  | `vercel-react-best-practices`              |
| Overview     | `project-overview`                         |
