# Contributing to Vault Reader

Vault Reader is an Obsidian plugin for focused speed reading inside a local vault. Contributions should preserve the project direction: plugin-first, local-first, test-driven, and easy to validate manually in Obsidian.

## TDD-first Development Workflow

1. Install dependencies with `npm ci`.
2. Add or update the smallest behavior-first test that proves the intended change.
3. Run unit and integration tests with `npm run test`.
4. Run the local Obsidian deploy flow with `npm run build:local` or `npm run dev:local`.
5. Validate changes in `fixtures/manual-test-vault` before considering user-facing behavior complete.

## Quality Gates

- Add or update tests before changing behavior.
- Run `npm run format:check`, `npm run lint`, `npm run test`, `npm audit --audit-level=high`, and `npm run build:release` before opening or merging a change.
- Keep generated `main.js`, release packages, coverage output, and deployed manual-vault plugin artifacts out of source control.
- Keep `manifest.json`, `versions.json`, and release packaging scripts aligned because Obsidian community plugins consume GitHub release assets directly.

## Repo Hygiene

- Do not commit secrets, tokens, `.env` files, private vault notes, local Obsidian workspace state, generated coverage, or deployed manual-vault plugin artifacts.
- Keep product decisions in `CONTEXT.md`, `docs/design.md`, and `docs/tasks.md` so implementation and roadmap language stay aligned.
- Prefer small, validated changes over broad rewrites unless a task explicitly calls for a refactor phase.

## Public Repository Expectations

- Enable branch protection on `main` before public submission.
- Require CI to pass before merge: format, lint, coverage tests, audit, secret scan, and release build validation.
- Use normal reviewed pull requests for public work; no force-push to `main` during normal development.
- Keep Dependabot enabled for npm and GitHub Actions updates.
- Keep GitHub private vulnerability reporting enabled when the repository is public.
