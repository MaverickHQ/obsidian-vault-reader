# Security Review

## Purpose

This document records the security and privacy contract for the first Vault Reader community-plugin release.

Vault Reader is local-first Obsidian plugin software. The current release reads the active note only when the user starts a reader session, renders words inside Obsidian, and stores settings/progress through Obsidian plugin data.

## Threat Model

Primary assets:

- User note content inside the local Obsidian vault.
- Reading progress and settings stored as Obsidian plugin data.
- Release artifacts distributed through GitHub Releases.
- Repository source, tests, fixtures, and release scripts used for public review.

Relevant threat scenarios:

- Accidental exfiltration of note content through network requests, telemetry, backend calls, or future provider integrations.
- Unsafe rendering of note-derived content as HTML or script-capable markup.
- Exposure of local paths, stack traces, or implementation internals in user-facing notices.
- Accidental packaging or committing of secrets, private keys, `.env` files, generated release outputs, or manual-vault local state.
- Dependency or release-package drift that ships different assets from those reviewed in source.

Out of scope for this release:

- BYOK AI, provider credentials, remote summarization, account systems, hosted sync, paid licensing, and RSVP Nano device export.
- Mobile support, because the current release is desktop-only and depends on desktop editor/source-mode validation.

## Data Handling

Vault Reader makes no network requests, uses no backend, sends no telemetry, and stores no credentials.

The plugin reads note content only after the user runs `Vault Reader: Start reading current note` or clicks an in-reader action that explicitly reads the current note.

Stored data is limited to local Obsidian plugin data:

- default WPM
- ORP setting
- presentation mode
- typography scale
- panel zoom
- accent theme
- in-note highlight preferences
- per-note reading position keyed by local source identifier

No note body text is intentionally persisted by Vault Reader. Reading progress and settings remain in Obsidian plugin data controlled by the user's local vault environment.

## Rendering Safety

Reader token output and user-facing metadata must use text-safe DOM APIs such as `textContent`, `replaceChildren`, `setAttribute`, or typed input values.

Runtime source must not use:

- `insertAdjacentHTML`
- non-empty `innerHTML` assignment
- `outerHTML`
- `eval`
- `new Function`

The release already includes behavior tests proving note-derived token text is rendered as text rather than injected markup.

## Notice And Error Safety

User-facing notices should be short, actionable, and sanitized.

Notices must not intentionally expose:

- stack traces
- absolute local filesystem paths
- raw HTML/script markup
- high-noise internal implementation details

Unexpected errors should fall back to a friendly message when sanitization cannot produce safe user-facing text.

## Release And Supply Chain Controls

Release safety is enforced through scripted checks:

- CI runs format, lint, coverage tests, `npm audit --audit-level=high`, secret scanning, and release validation.
- `npm run check:secrets` runs `tests/no-secrets.sh` against tracked files.
- `npm run check:repo-shape` prevents repo-shape drift before release.
- `npm run check:release-artifacts` verifies required Obsidian release assets.
- `npm run build:release` runs the release checks before packaging.
- `scripts/package-release.mjs` produces `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- Dependabot is configured for npm and GitHub Actions dependency update visibility.

The release package must not include fixtures, test vault files, dotenv files, private keys, source maps, or unrelated source-tree content.

## Public Repository Controls

Before the repository is made public or submitted to the Obsidian Community Plugin directory:

- Enable branch protection on `main`.
- Require CI to pass before merge.
- Use reviewed pull requests for public changes and no force-push to `main` during normal work.
- Keep GitHub Dependabot alerts enabled.
- Keep GitHub private vulnerability reporting enabled for sensitive reports.

Current repository verification on 2026-07-03: the repository is public, the default branch is `main`, Issues are enabled, branch protection is enabled with the `quality` required status check, and private vulnerability reporting is enabled.

## Public Review Checklist

- [x] Confirm `npm run format:check` passes.
- [x] Confirm `npm run lint` passes.
- [x] Confirm `npm run test` passes.
- [x] Confirm `npm run build:release` passes.
- [x] Confirm `npm audit` has no high or critical unresolved findings, or document justified exceptions.
- [x] Confirm `bash tests/no-secrets.sh` finds no high-confidence secret signatures.
- [x] Confirm Dependabot is enabled for npm and GitHub Actions.
- [x] Confirm branch protection and private vulnerability reporting are enabled before public release.
- [x] Confirm runtime source contains no `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or `navigator.sendBeacon` usage.
- [x] Confirm runtime reader rendering contains no unsafe HTML insertion.
- [x] Confirm README, release notes, and community QA docs state the local-first/no telemetry/no backend contract.

## Public Review Evidence

- 2026-07-03: `npm run verify:release` passed, covering format, lint, tests, release build, release packaging, release e2e install smoke test, high-severity npm audit, and tracked-file secret scan.
- 2026-07-03: `npm run test -- --coverage` passed with 65 test files and 245 tests.
- 2026-07-03: source-only scans found no runtime use of `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, `insertAdjacentHTML`, non-empty `innerHTML` assignment, `outerHTML` assignment, `eval`, or `new Function`.
- 2026-07-03: GitHub repository settings verified public visibility, branch protection on `main`, dependency visibility through Dependabot configuration, and private vulnerability reporting.
