---
name: version-release
description: 'Version release workflow — release process and GitHub Release notes (not docs/changelog pages).'
disable-model-invocation: true
argument-hint: '[minor|patch] [version?]'
---

# Version Release Workflow

This skill routes release work to the detailed workflows in `references/`.

## Scope

Use this skill for release branches, release PRs, CI release triggers, and GitHub Release notes.
For website changelog pages under `docs/changelog/`, use `../docs-changelog/SKILL.md` instead.

For every version-release execution, also read and apply `../microcopy/SKILL.md`.

## Choose the Workflow

- **Minor release** → `references/minor-release.md`
- **Patch release** (weekly, hotfix, model launch, or DB migration) → `references/patch-release-scenarios.md`
- **Release PR body / GitHub Release notes** → `references/release-notes-style.md`

The references describe the upstream `canary` / `main` process. This checkout configures
semantic-release for `main` and prerelease branch `next` in `.releaserc.cjs`; confirm the selected
reference applies to the requested release before choosing its source branch.

## Release Automation

Verify the repository's current workflow files before preparing a release.

- `release-pr-version.yml` updates `package.json` on eligible release PRs targeting `main`.
  An exact `🚀 release: v{x.y.z}` title selects that version; other eligible release / hotfix
  PRs use the next patch after the latest stable tag, falling back to `package.json` when no tag exists.
- Inspect `.releaserc.cjs` and the current `.github/workflows/` for tagging, publishing, and
  branch synchronization. Do not assume the upstream `auto-tag-release.yml` or
  `sync-main-to-canary` workflows exist in this checkout.

## Hard Rules

- Do not manually change `package.json` versions or create tags; CI owns both.
- Minor release titles must use the exact `🚀 release: v{x.y.z}` format.
- Patch PRs do not need an explicit version number.
- Derive release-note inputs (compare range, PR references, contributors, and metrics) from Git
  as described in `references/release-notes-style.md`; never invent them or rely on memory.
