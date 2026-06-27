# Design

## Document Info

- Status: Active
- Depth: Level 400
- Scope: Community Plugin Architecture
- Last Updated: 2026-06-15

## 1. Architectural Thesis

Vault Reader should be a small, local-first Obsidian plugin with a strong reading loop and a narrow integration surface. The active architecture is intentionally limited to source resolution, Markdown normalization, token/timing logic, reader UI, settings persistence, source highlighting, local build/deploy tooling, and release packaging.

The first public release should not carry inactive architecture for hardware export, BYOK AI, payments, telemetry, or backend services. Those ideas remain in backlog documents and archived design material until a later phase proves demand and technical feasibility.

See `docs/adr/0002-community-plugin-first-release.md` for the current scope decision.

## 2. Design Principles

- **Obsidian-native first:** The plugin should feel like a focused Obsidian reading tool, not an external app embedded in a pane.
- **Local-first trust:** Notes stay inside the vault. No network calls, telemetry, account flows, or hosted backend are part of the active runtime.
- **Small boundaries:** Domain logic stays testable without a real Obsidian window wherever possible.
- **Safe rendering:** Note-derived content is rendered as text, never as trusted HTML.
- **Honest roadmap:** Deferred work stays documented but does not appear in active architecture diagrams or release tests.
- **TDD by behavior:** Tests describe user-visible or release-critical behavior before implementation details.

## 3. Professional Repo Shape

The repo root is the plugin root because Obsidian community releases expect root-level metadata and GitHub release assets.

```text
/
├── .github/
├── docs/
├── fixtures/
├── scripts/
├── src/
├── tests/
├── manifest.json
├── package.json
├── styles.css
└── versions.json
```

Generated release files such as `main.js`, `coverage/`, `release/`, and deployed manual-vault plugin assets are local-only and ignored.

## 4. Runtime Components

| Component               | Responsibility                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `src/main.ts`           | Obsidian plugin entrypoint.                                                              |
| `src/plugin-startup.ts` | Lifecycle orchestration, command registration, view registration, settings registration. |
| `SourceResolver`        | Resolves the current editable Markdown note and source metadata.                         |
| `MarkdownNormalizer`    | Converts Markdown source into deterministic reading text.                                |
| `Tokenizer`             | Splits reading text into stable tokens.                                                  |
| `ORPEngine`             | Computes focus-character metadata for each token.                                        |
| `TimingEngine`          | Converts WPM and punctuation rules into playback delays.                                 |
| `ReaderController`      | Owns session state transitions and progress updates.                                     |
| `ReaderSessionRunner`   | Coordinates playback ticks and controller updates.                                       |
| `ReaderViewModel`       | Converts domain/session state into UI-ready values.                                      |
| `ReaderView`            | Renders controls, token display, settings controls, and user actions.                    |
| `ReaderViewActivator`   | Opens/reuses the Obsidian reader pane and binds it to the active note.                   |
| `SourceHighlighter`     | Attempts safe in-note highlight when the source note can be mapped exactly.              |
| `SettingsStore`         | Persists local plugin preferences through Obsidian data APIs.                            |
| `ReadingPositionStore`  | Persists per-source reading progress locally.                                            |
| `VaultReaderError`      | Normalizes expected user-facing errors and notices.                                      |

## 5. Core Data Flow

```text
Active Obsidian Markdown note
  -> SourceResolver
  -> MarkdownNormalizer
  -> Tokenizer
  -> ORPEngine + TimingEngine
  -> ReaderController
  -> ReaderViewModel
  -> ReaderView
```

Optional source highlighting is a side effect of playback state:

```text
ReaderController current token
  -> SourceHighlightMap
  -> SourceHighlighter
  -> Obsidian editor decoration
```

If highlighting cannot map the token safely, playback continues in the reader panel.

## 6. State And Persistence

The reader state machine stays intentionally small:

- `idle`
- `ready`
- `playing`
- `paused`
- `complete`
- `error`

Settings and reading progress are persisted through Obsidian plugin data only. The plugin does not persist note contents, API keys, remote identifiers, analytics identifiers, or account data.

## 7. Testing Strategy

| Layer              | Purpose                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Unit               | Normalization, tokenization, ORP, timing, settings, source keys, view models, security policies.             |
| Integration        | Plugin startup, source resolution, reader sessions, reader view runtime behavior, source highlight fallback. |
| E2E/package        | Release package generation and clean-vault install shape.                                                    |
| Shell policy       | No-secrets, repo-shape, release artifact validation.                                                         |
| Manual Obsidian QA | Real command palette, reader panel, playback, highlight, settings, reload, and clean-vault behavior.         |

Every new feature task must define a RED behavior test before implementation, then close with GREEN and REFACTOR evidence in `docs/tasks.md`.

## 8. Security And Privacy Design

- Runtime source is local-only and must not introduce network primitives.
- Reader rendering uses text-safe DOM updates for note-derived content.
- Errors are sanitized before reaching Obsidian notices.
- Release artifacts are limited to `main.js`, `manifest.json`, `styles.css`, and checksum evidence.
- GitHub/public-review workflows include dependency audit, secret checks, CI, issue templates, and security reporting documentation.

## 9. Deferred Architecture

The following designs are intentionally not active in the release architecture:

- RSVP Nano export
- SD-card library writing
- device flashing
- BYOK AI provider integration
- paid licensing
- cloud sync
- telemetry
- mobile support
- selected-text reading command

Historical exploration for some of these areas is preserved in `docs/archive/pre-community-release/`. Future work must re-enter through requirements, design, ADR, tasks, and TDD gates before code is added.

## 10. Operational Design

The local developer loop is:

1. Run tests and build from the repo root.
2. Use `npm run build:local` to build and deploy assets into `fixtures/manual-test-vault`.
3. Reload Obsidian and test against the manual vault.
4. Use `npm run build:release` and `npm run package:release` for release candidates.
5. Record manual QA in `docs/community-plugin-qa.md` before public submission.

The public release loop is:

1. Confirm active docs and roadmap agree on scope.
2. Run full automated validation.
3. Build a release package.
4. Install into a clean vault.
5. Capture manual QA evidence.
6. Create a GitHub release when the repo is ready to be public.
7. Submit to the Obsidian community plugin directory after repo visibility and release assets are ready.
