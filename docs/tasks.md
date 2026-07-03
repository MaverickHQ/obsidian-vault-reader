# Tasks

## Document Info

- Status: Active
- Depth: Level 400
- Workflow: Spec-driven, design-led, TDD-first
- Last Updated: 2026-06-13

## Task Legend

| Symbol | Meaning                        |
| ------ | ------------------------------ |
| `[ ]`  | Not started                    |
| `[W]`  | In progress                    |
| `[D]`  | Done and validated             |
| `[B]`  | Blocked                        |
| `[T]`  | Test-first behavior identified |

## Phase Overview

| Phase         | Focus                                      | Outcome                                                                               |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Phase 0       | Repo pivot and tooling                     | Publishable plugin-first foundation                                                   |
| Phase 1       | Core RSVP reading                          | High-quality Obsidian reader loop                                                     |
| Phase 1.7     | Hardening and reliability                  | Close release-blocking defects before device/export work                              |
| Phase 1.8     | Reliability closure                        | Close remaining P1/P2 correctness risks before export scope                           |
| Phase 1.9     | Release-candidate reliability              | Close final data-integrity and orchestration gaps before export work                  |
| Phase 2       | Exceptional core + paid readiness          | Distinctive, in-context reader UX with monetization-grade polish                      |
| Phase 2.6     | In-note follow-along highlight (backlog)   | Active-note moving word highlight synchronized to playback                            |
| Phase 2.7     | Thermo-nuclear maintainability remediation | Structural simplification before more feature expansion                               |
| Phase 2.8     | Restart from beginning UX                  | User can reset the current reader session to the start of the note/page               |
| Phase 3       | Community plugin release readiness         | Public-review-ready Obsidian Community Plugin submission                              |
| Phase 3.4.1   | Project repository hygiene                 | Public-facing docs, folders, archives, and ignore rules are professional and enforced |
| Phase 3.4.1.5 | Exceptional pre-public polish              | First-use UX, command polish, QA evidence, and release verification feel premium      |
| Phase 3.4.2   | Clean public repository preparation        | Publish from a sanitized no-history tree without leaking private working history      |
| Backlog A     | RSVP Nano export                           | Real device-compatible export path after community release                            |
| Backlog B     | BYOK AI optional layer                     | Useful but non-blocking AI helpers after core adoption                                |
| Backlog C     | Legacy hardening and release               | Historical release checklist superseded by Phase 3                                    |

## TDD Rules For Every Task And Phase

### Task Rule

- Every implementation task must include at least one behavior-first test intent (`[T]`) before code changes for that task are considered complete.

### Checkpoint Rule

- Every checkpoint closeout (`0.1`, `0.2`, `1.1`, etc.) requires:
  - task-specific tests or explicit manual validation notes
  - `bash tests/no-secrets.sh`
  - local commit and immediate push to `origin`

### Phase Rule

- Every full phase closeout requires:
  - phase tag `phase-x-complete`
  - passing regression checks for touched components
  - a short phase summary describing what was tested and how

## Phase 0: Repo Pivot And Tooling

**Goal:** Turn the repo into an honest plugin-first project with test scaffolding and fixtures.

**Milestone:** M0 - Active docs, archive complete, implementation path clear.

### 0.1 Repository Shape

- [D] Decide whether the published plugin will live at repo root or in a dedicated repo.
- [D] Flatten or map the plugin structure so release-critical files can live at repo root.
- [D] Mark legacy directories as inactive or move them under archival/reference ownership.
- [D] Add a root `LICENSE` decision before first public release.
- [D] Define a repo-shape acceptance test in the task checklist.

**Test intent:**

- `repo has root README, manifest, package, versions file before release`

### 0.2 Development Tooling

- [D] Scaffold from the official Obsidian sample plugin structure.
- [D] Configure TypeScript build.
- [D] Configure linting and formatting.
- [D] Configure Vitest.
- [D] Configure a simple release build command.
- [D] [T] Write tests for build config expectations that can be validated in CI.

**Validation evidence (2026-05-22):**

- `npm run build:release`
- `npm run lint`
- `npm run format:check`
- `npm run test`

**Suggested test files:**

- `tests/unit/build-config.test.ts`
- `tests/unit/manifest-shape.test.ts`

### 0.3 Fixtures And Test Vault

- [D] Create fixture notes for prose, headings, lists, links, code blocks, and frontmatter.
- [D] Create a dedicated manual test vault.
- [D] Create expected normalized-text fixtures.
- [D] Create expected export-path fixtures for `books` and `articles`.
- [D] [T] Define fixture snapshots before reader and export implementation begins.

**Validation evidence (2026-05-22):**

- `npm run build:release`
- `npm run lint`
- `npm run format:check`
- `npm run test`

**Suggested test files:**

- `tests/fixtures/normalize.fixture.test.ts`
- `docs/archive/pre-community-release/export-layout.fixture.test.ts.md` (historical deferred export fixture)

## Phase 1: Core RSVP Reading

**Goal:** Deliver a reading experience strong enough to be valuable even without a device.

**Milestone:** M1 - A user can open a note and read it smoothly inside Obsidian.

### 1.1 Note Source Resolution

- [D] Implement active-note resolution.
- [D] Implement editor-selection resolution when available.
- [D] Handle missing file or unsupported editor state gracefully.
- [D] Return a stable source object for downstream modules.
- [D] [T] Write tests against the public source-resolution interface.

**Validation evidence (2026-05-22):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/source-resolver.test.ts`
- `tests/integration/active-note.test.ts`

### 1.2 Markdown Normalization

- [D] Normalize headings into readable breaks.
- [D] Strip Markdown formatting syntax while preserving text meaning.
- [D] Flatten link syntax into readable text.
- [D] Handle code blocks, callouts, quotes, and lists deterministically.
- [D] Preserve enough spacing to avoid unreadable token runs.
- [D] [T] Start with fixture tests before implementing edge cases.

**Validation evidence (2026-05-22):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/markdown-normalizer.test.ts`
- `tests/fixtures/normalization-regression.test.ts`

**Core test cases:**

- `normalize("**bold**") removes formatting markers`
- `normalize("[label](url)") keeps readable text`
- `normalize(code block) does not crash or emit malformed spacing`

### 1.3 Tokenization And ORP

- [D] Implement deterministic token splitting.
- [D] Preserve punctuation as part of token timing decisions.
- [D] Implement ORP index calculation.
- [D] Expose token metadata independent of the UI.
- [D] [T] Test word-shape edge cases before rendering work begins.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/tokenizer.test.ts`
- `tests/unit/orp-engine.test.ts`

**Core test cases:**

- `tokenize("Hello, world!") returns stable token order`
- `orpIndex("quick") returns correct focus position`
- `orpIndex("a") handles single-character token`

### 1.4 Timing And Session Control

- [D] Implement configurable WPM.
- [D] Implement punctuation-aware delay rules.
- [D] Implement `play`, `pause`, `resume`, and `stop`.
- [D] Persist last-known note position locally.
- [D] [T] Keep timing logic decoupled from the DOM so it can be tested directly.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/timing-engine.test.ts`
- `tests/unit/reader-controller.test.ts`

**Core test cases:**

- `timingForWpm(300) returns expected base delay`
- `pause() preserves current token index`
- `resume() continues from saved state`

### 1.5 Reader View

- [D] Create the reader view container.
- [D] Render the current token with ORP highlighting.
- [D] Add play/pause/stop controls.
- [D] Add live WPM adjustment.
- [D] Add keyboard shortcuts for core controls.
- [D] Show current note title and progress.
- [D] [T] Write tests for behavior, not pixel-level implementation details.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/reader-view.test.ts`
- `tests/integration/reader-session.test.ts`

### 1.6 Settings And Persistence

- [D] Persist default WPM.
- [D] Persist ORP toggle.
- [D] Persist theme or typography settings required for the reader.
- [D] Persist per-note reading position.
- [D] [T] Keep settings storage behind a small interface to simplify tests.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:release`

**Suggested test files:**

- `tests/unit/settings-store.test.ts`
- `tests/unit/reading-position-store.test.ts`

### 1.7 Hardening And Reliability (Post-Phase-1 Review)

- [D] Fix session lifecycle mismatch so `Stop` cannot produce a non-playable state.
- [D] Serialize persistent writes to prevent settings and reading-position race conditions.
- [D] Ensure replay respects current runtime WPM (or intentionally resets with explicit UX contract).
- [D] Guard keyboard shortcuts when focus is inside editable controls (`input`, `textarea`, `select`, `contenteditable`).
- [D] Add startup resilience: recover from corrupted/invalid persisted data with safe defaults and user notice.
- [D] Improve selection-scoped source identity so separate selections in one note do not collide.
- [D] Add coverage tooling (`@vitest/coverage-v8`) and enforce a minimum threshold for reader core modules.
- [D] [T] Add failing tests first for each defect class before implementation.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Suggested test files:**

- `tests/unit/reader-controller.test.ts`
- `tests/unit/reader-view.test.ts`
- `tests/unit/settings-store.test.ts`
- `tests/unit/reading-position-store.test.ts`
- `tests/integration/reader-session.test.ts`
- `tests/integration/plugin-startup.test.ts` _(new)_
- `tests/integration/selection-resume.test.ts` _(new)_

**Core test cases (TDD-first):**

- `stop() followed by play() resumes deterministic playback behavior`
- `concurrent settings + position updates do not lose writes`
- `replay uses expected WPM policy and remains stable across runs`
- `shortcut keys are ignored while editing numeric fields`
- `corrupted persisted payload falls back to defaults without startup failure`
- `different selections in same file map to different persisted keys`

**Release gate for Phase 2 start:**

- [D] All P1/P2 review findings are closed or explicitly deferred with documented rationale in `docs/roadmap.md`.

## Phase 1.8: Reliability Closure (Post-1.7 Deep Review)

**Goal:** Eliminate remaining reliability and correctness gaps identified in the level-400 deep review.

**Milestone:** M1.8 - Async failures are safely handled, markdown normalization preserves source meaning, and selection/source identity is robust.

### 1.8.1 Async Error Guardrails

- [D] Add a centralized async safety wrapper for fire-and-forget handlers in reader orchestration paths.
- [D] Ensure rejected persistence calls do not surface as unhandled promise rejections.
- [D] Surface user-visible error feedback and deterministic `ERROR` session behavior on async failure paths.
- [D] [T] Start with failing tests that simulate rejected `saveData`, `pause`, `stop`, and tick-advance flows.

**Suggested test files:**

- `tests/integration/reader-session-errors.test.ts` _(new)_
- `tests/unit/reader-controller.test.ts`
- `tests/unit/reader-view.test.ts`

### 1.8.2 Markdown Integrity And Normalization Safety

- [D] Replace underscore-emphasis stripping behavior so plain-text identifiers like `snake_case` are preserved.
- [D] Keep existing emphasis removal behavior for valid markdown formatting.
- [D] Add fixture coverage for mixed prose/markdown edge cases with underscores and code-like tokens.
- [D] [T] Add failing normalization tests before implementation for text-corruption regression cases.

**Suggested test files:**

- `tests/unit/markdown-normalizer.test.ts`
- `tests/fixtures/normalization-regression.test.ts`

### 1.8.3 Selection Identity Robustness

- [D] Extend selection source-key generation to include editor range metadata when available.
- [D] Keep deterministic fallback behavior when range metadata is unavailable.
- [D] Ensure identical selection text in different file locations resolves to distinct persisted identities.
- [D] [T] Add failing tests for same-text/different-range and same-range/stable-key scenarios.

**Suggested test files:**

- `tests/integration/selection-resume.test.ts`
- `tests/unit/source-resolver.test.ts`
- `tests/unit/source-key.test.ts` _(new)_

### 1.8.4 Startup Diagnostics And Recovery UX

- [D] Keep safe-default recovery behavior for corrupted persisted payloads.
- [D] Add actionable diagnostics (`console` logging + user guidance) so repeated failures are debuggable.
- [D] Prevent silent data-load failures from masking root-cause context.
- [D] [T] Add failing tests for both successful recovery notifications and diagnostic emission.

**Suggested test files:**

- `tests/integration/plugin-startup.test.ts`
- `tests/unit/plugin-startup.test.ts` _(new)_

### 1.8.5 Coverage And Integration Confidence

- [D] Add focused integration tests for `reader-view` orchestration behavior.
- [D] Re-introduce `reader-view` into meaningful coverage scope (directly or via integration harness).
- [D] Keep coverage thresholds as an enforced quality gate for core reader and settings modules.
- [D] [T] Add failing coverage/test expectations first before adjusting implementation.

**Suggested test files:**

- `tests/integration/reader-view-integration.test.ts` _(new)_
- `tests/integration/reader-session.test.ts`
- `tests/unit/reader-view.test.ts`

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Core test cases (TDD-first):**

- `async persistence failure does not create unhandled rejection and transitions reader to an explicit error state`
- `normalize("Use snake_case identifiers.") preserves underscore text semantics`
- `same selection text at different offsets creates different source keys`
- `startup recovery logs actionable diagnostics while still booting with defaults`
- `reader-view orchestration paths are covered by integration tests with stable pass/fail expectations`

**Release gate for Phase 2 start:**

- [D] Phase 1.8 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.

## Phase 1.9: Release-Candidate Reliability (Post-1.8 Deep Review)

**Goal:** Close final reliability and correctness gaps so Phase 1 can be treated as release-candidate quality.

**Milestone:** M1.9 - Persistence is durability-safe, normalization preserves plain text semantics, and reader orchestration failures are deterministic.

### 1.9.1 Persistence Durability Semantics

- [D] Refactor datastore update flow to avoid in-memory snapshot drift when `saveData` fails.
- [D] Ensure failed writes do not silently mutate runtime state that appears persisted.
- [D] Define and document atomic update behavior (commit-on-success vs explicit optimistic mode).
- [D] [T] Add failing tests for save-failure rollback semantics and post-failure state consistency.

**Suggested test files:**

- `tests/unit/settings-store.test.ts`
- `tests/unit/reading-position-store.test.ts`
- `tests/unit/vault-reader-data-store.test.ts` _(new)_

### 1.9.2 Markdown Plain-Text Safety Hardening

- [D] Tighten emphasis normalization so plain text containing `*` delimiters is not corrupted.
- [D] Preserve existing markdown emphasis stripping behavior for valid formatting inputs.
- [D] Add regression coverage for equations/wildcards and mixed markdown-prose patterns.
- [D] [T] Add failing tests for `a * b * c`, literal star tokens, and mixed emphasis/plain-text strings before implementation.

**Suggested test files:**

- `tests/unit/markdown-normalizer.test.ts`
- `tests/fixtures/normalization-regression.test.ts`

### 1.9.3 Error Orchestration And Notification Deduping

- [D] Ensure view-level async error handling coordinates with runner timer teardown.
- [D] Prevent duplicate notices from mixed error sources (view wrapper + runner callbacks).
- [D] Ensure error-state transitions are single-source and deterministic across user action and timer paths.
- [D] [T] Add failing tests for duplicate-error scenarios and timer-after-error behavior.

**Suggested test files:**

- `tests/integration/reader-session-errors.test.ts`
- `tests/integration/reader-view-integration.test.ts`
- `tests/unit/reader-view.test.ts`

### 1.9.4 Selection Identity Fallback Robustness

- [D] Improve selection identity fallback when range metadata is unavailable.
- [D] Reduce same-file collisions for identical selected text from different locations.
- [D] Keep keys stable across repeated runs for identical source/range context.
- [D] [T] Add failing tests for range-unavailable fallback collisions and key stability constraints.

**Suggested test files:**

- `tests/integration/selection-resume.test.ts`
- `tests/unit/source-key.test.ts`
- `tests/unit/source-resolver.test.ts`

### 1.9.5 Coverage Gate Completeness

- [D] Bring `reader-view` behavior back into quality gates via focused integration and/or unit harnessing.
- [D] Reassess coverage includes/excludes so core orchestration code is represented in threshold metrics.
- [D] Keep coverage thresholds enforceable without masking risky code paths.
- [D] [T] Add failing expectations that prove `reader-view` path coverage is exercised before final gate adjustments.

**Suggested test files:**

- `tests/integration/reader-view-integration.test.ts`
- `tests/unit/reader-view.test.ts`
- `tests/unit/coverage-policy.test.ts` _(new)_

**Validation evidence (required at closeout):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Validation evidence (2026-06-01):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`

**Core test cases (TDD-first):**

- `failed datastore save leaves persisted snapshot semantics consistent with durability contract`
- `normalize("Equation: a * b * c.") preserves plain-text star-delimited content`
- `single runtime failure produces one deterministic reader error transition and no duplicate notifications`
- `selection fallback without range metadata minimizes key collisions for same-file repeated phrases`
- `reader-view orchestration code path participation is visible in enforced coverage gates`

### 1.9.6 Well-Architected Review Findings And Tasks

**Review scope:** Deployment, operations, performance, security, and functional behavior across current plugin code.

#### Deployment (Operational Excellence + Reliability)

**Findings:**

- Build/release validation currently relies on local command execution with no explicit CI workflow definition in-repo.
- Release-critical quality checks exist (`build:release`, secrets scan, repo shape), but deployment gating is not yet automated as a protected pipeline.
- Coverage policy still excludes `reader-view.ts`, leaving a critical orchestration path outside enforced release metrics.

**Recommendations (TDD-first tasks):**

- [D] Add CI workflow to run `lint`, `test`, `test -- --coverage`, and `build:release` on push/PR.
- [D] Add failing CI-policy test/check that blocks release when required checks are skipped or unavailable.
- [D] Re-evaluate coverage include/exclude policy and enforce orchestration-path participation in release gates.
- [D] [T] Add tests/fixtures that fail when coverage-policy drift reintroduces blind spots.

#### Operations (Reliability + Observability)

**Findings:**

- Error handling has improved, but runtime observability remains minimal (notice-level feedback with limited structured diagnostics).
- Startup recovery logs and notices exist, but no consistent error taxonomy/telemetry contract across controller, runner, and view layers.
- Async failure paths can surface multiple error channels unless fully deduped and orchestrated through one authority.

**Recommendations (TDD-first tasks):**

- [D] Define a shared error taxonomy (`code`, `message`, `context`) for startup/session/settings flows.
- [D] Centralize error reporting so one failure yields one canonical state transition and one user-visible notice.
- [D] Add deterministic integration tests for error dedupe across timer-driven and user-triggered failure paths.
- [D] [T] Add failing tests for duplicate-notice and duplicate-state-transition scenarios before refactors.

#### Performance (Performance Efficiency)

**Findings:**

- Reader rendering performs full-view refresh on each snapshot, including repeated DOM text/value assignments.
- Settings updates trigger immediate persistence on frequent interaction paths (e.g., WPM adjustments), which can cause high write frequency.
- Tokenization/normalization are recalculated per session start; no memoization/cache strategy exists for unchanged source payloads.

**Recommendations (TDD-first tasks):**

- [D] Add render diffing/minimal DOM update strategy for hot playback paths.
- [D] Introduce debounced/batched persistence for high-frequency setting changes while preserving correctness guarantees.
- [D] Add benchmark-style tests for playback loop and settings-write burst scenarios.
- [D] [T] Add failing performance guard tests (timing/operation-count budgets) before optimization changes.

#### Security (Security + Data Protection)

**Findings:**

- No high-confidence secret leakage found in tracked files through existing checks, but enforcement is local-command dependent.
- User-controlled note content is rendered via `textContent` (safe baseline), reducing XSS risk in current view logic.
- Error messages may include raw exception strings; unstructured propagation can leak low-value internals into UX notices.

**Recommendations (TDD-first tasks):**

- [D] Keep `textContent`-only rendering as a non-negotiable contract for reader token and metadata output.
- [D] Add explicit sanitization/allowlist policy for surfaced error messages shown to users.
- [D] Add tests that verify no HTML injection surfaces in reader rendering and notices.
- [D] [T] Add failing tests for unsafe error/markup rendering before hardening changes.

#### Functional (Correctness + User Experience)

**Findings:**

- Persistence durability semantics need explicit contract hardening (in-memory vs persisted truth under save failures).
- Selection keying is improved with range metadata but still collision-prone in range-unavailable contexts.
- Markdown normalization still has edge-risk for plain-text star-delimited content vs emphasis parsing boundaries.

**Recommendations (TDD-first tasks):**

- [D] Finalize and document persistence consistency contract; enforce via unit and integration tests.
- [D] Improve fallback selection identity strategy when range metadata is missing.
- [D] Tighten markdown parsing boundaries to avoid plain-text semantic drift.
- [D] [T] Add failing regression tests first for each identified functional edge case.

**Validation evidence (2026-05-23):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Release gate for Phase 2 start:**

- [D] Phase 1.9 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.

## Phase 2: Exceptional Core And Paid Readiness

**Goal:** Elevate the current plugin into a distinctive, in-context reading experience that is strong enough for portfolio impact and paid-tier exploration before device/export scope.

**Milestone:** M2 - Reader opens as an in-workspace framed panel with theme control (blue + Claude orange), reliable persistence, and regression-tested UX behavior.

### 2.1 Presentation Mode And Leaf Placement

- [D] Add a persisted `presentationMode` setting with explicit values (`split-right`, `tab`).
- [D] Make `split-right` the default for new installs to keep reading in-context with the active note.
- [D] Update view activation flow to open in a right-side split pane when `presentationMode` is `split-right`.
- [D] Keep `tab` mode as a supported fallback path for users who prefer the existing behavior.
- [D] Ensure leaf resolution is deterministic and does not create duplicate reader panes during repeated command runs.
- [D] [T] Add failing tests first for mode resolution, default behavior, and repeated-command pane behavior.

**Suggested test files:**

- `tests/unit/vault-reader-data-store.test.ts`
- `tests/unit/settings-store.test.ts`
- `tests/integration/start-session-command.test.ts`

### 2.2 Framed Reader Shell UI (In-Page Experience)

- [D] Refactor reader markup to render inside a framed shell panel (header band + body + controls) that feels like an embedded tool window.
- [D] Keep all current controls and keyboard behaviors intact inside the new shell layout.
- [D] Ensure empty/no-session state remains informative and accessible inside the frame.
- [D] Add resilient class/attribute hooks for runtime styling and future premium-theme extensions.
- [D] [T] Add failing runtime/view tests first for shell structure, control presence, and no-regression keyboard behavior.

**Suggested test files:**

- `tests/unit/reader-view.test.ts`
- `tests/integration/reader-view-runtime.test.ts`
- `tests/integration/reader-view-integration.test.ts`

### 2.3 Accent Theme System (Blue + Claude Orange)

- [D] Add a persisted `accentTheme` setting with explicit values (`blue`, `claude-orange`).
- [D] Add a reader control to toggle accent theme at runtime without restarting the session.
- [D] Map accent tokens to CSS variables and ensure ORP focus highlighting uses the selected accent.
- [D] Implement `claude-orange` with a fixed palette token (`#D97757`) and keep `blue` as existing accent behavior.
- [D] Ensure theme changes persist and restore correctly across plugin reload and session restart.
- [D] [T] Add failing tests first for setting normalization, runtime toggle behavior, and persistence/restore behavior.

**Suggested test files:**

- `tests/unit/vault-reader-data-store.test.ts`
- `tests/unit/settings-store.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

### 2.4 Settings Migration, Safety, And Backward Compatibility

- [D] Extend data normalization so existing user data (without new keys) migrates safely to defaults.
- [D] Validate and clamp invalid theme/mode values to known-safe defaults.
- [D] Ensure no data loss for existing settings (`defaultWpm`, `orpEnabled`, `typographyScale`) during schema extension.
- [D] Add defensive tests for malformed persisted payloads containing partial or invalid new settings.
- [D] [T] Add failing migration and malformed-payload tests before implementation changes.

**Suggested test files:**

- `tests/unit/vault-reader-data-store.test.ts`
- `tests/unit/settings-store.test.ts`
- `tests/integration/plugin-startup.test.ts`

### 2.5 UX Validation And Paid-Readiness Baseline

- [D] Add manual QA checklist for panel-mode behavior, theme toggling, keyboard controls, and persistence restore.
- [D] Update docs/screenshots copy to highlight differentiated UX (in-context panel + accent themes).
- [D] Define one-page paid-readiness baseline for this scope (what is “premium-ready” at Phase 2 completion).
- [D] Capture explicit non-goals so device export remains deferred to Backlog Phase A without scope bleed.
- [D] [T] Add documentation-policy tests/checks where practical (repo shape, command discoverability, release notes completeness).

**Suggested test files:**

- `tests/repo-shape.sh`
- `tests/unit/manifest-shape.test.ts`

**Validation evidence (required at closeout):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Core test cases (TDD-first):**

- `default settings resolve to split-right presentation mode and blue accent theme`
- `start-session command reuses deterministic reader leaf behavior across repeated launches`
- `reader shell renders framed structure while preserving control and keyboard behavior`
- `toggling accent theme updates ORP focus accent and persists across reload`
- `legacy persisted data without new settings keys upgrades safely with no data loss`

**Release gate for active release-readiness work:**

- [D] Phase 2 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.

## Phase 2.6: In-Note Follow-Along Highlight

**Goal:** Show moving word-level progress directly in the active note while the reader runs, without breaking playback performance or editor safety.

**Milestone:** M2.6 - Source-mode highlighting tracks current token in real time with deterministic fallback when accurate mapping is unavailable.

### 2.6.1 Source Offset Mapping Contract

- [D] Define and implement a mapping contract between reader tokens and active editor offsets.
- [D] Ensure token offsets remain deterministic for active-note and editor-selection sources.
- [D] Define fallback behavior when exact mapping cannot be guaranteed (disable in-note highlight, keep reader panel active).
- [D] Preserve existing reading behavior when mapping data is missing or stale.
- [D] [T] Add failing tests first for mapping correctness across punctuation, newlines, and repeated tokens.

**Suggested test files:**

- `tests/unit/source-highlight-map.test.ts`
- `tests/unit/source-resolver.test.ts`
- `tests/integration/active-note.test.ts`

### 2.6.2 Source-Mode Highlight Rendering

- [D] Add source-mode editor highlighting using Obsidian/CodeMirror decorations for the current token range.
- [D] Update highlight on each playback index change, pause, resume, and replay transitions.
- [D] Ensure highlight teardown is deterministic on stop, session switch, and plugin unload.
- [D] Keep highlight behavior isolated so reader playback remains functional if editor extension fails.
- [D] [T] Add failing integration tests first for highlight add/update/remove lifecycle behavior.

**Suggested test files:**

- `tests/unit/source-highlighter.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

### 2.6.3 Performance And Runtime Safety

- [D] Ensure highlight updates only occur when token index changes (no redundant decoration churn).
- [D] Avoid forced scroll/reflow per tick unless user enables follow-scroll behavior explicitly.
- [D] Keep high-WPM behavior stable (no dropped playback ticks from highlight work).
- [D] Add graceful no-op behavior in unsupported editor contexts (preview-only state, missing editor view).
- [D] [T] Add failing tests and performance guards for high-frequency update paths before optimization.

**Suggested test files:**

- `tests/unit/source-highlighter.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

### 2.6.4 UX Policy And Fallbacks

- [D] Add a user-visible toggle for in-note highlight (`off` by default until fully validated).
- [D] Define visual style contract for the active token highlight (contrast-safe, theme-compatible).
- [D] Add explicit runtime notice/log guidance when highlight is unavailable for the current view mode.
- [D] Document expected behavior differences between source mode and preview mode.
- [D] [T] Add failing tests first for toggle persistence and unsupported-context fallback messaging.

**Suggested test files:**

- `tests/unit/settings-store.test.ts`
- `tests/unit/vault-reader-data-store.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Validation evidence (2026-06-07):**

- `npm run lint`
- `npm run test`
- `npm run test:coverage`
- `npm run build`
- `npm run build:release`
- `npm run build:local`

**Validation evidence (required at closeout):**

- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build`
- `npm run build:release`
- `bash tests/no-secrets.sh`

**Core test cases (TDD-first):**

- `current token index maps to exact editor offset range for active-note sessions`
- `highlight updates once per token advance and clears on stop`
- `unsupported editor context does not throw and falls back to panel-only reading`
- `high-WPM playback remains stable while in-note highlighting is enabled`
- `highlight toggle persists and restores safely across reload`

**Release gate for active release-readiness work:**

- [D] Phase 2.6 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.

## Phase 2.7: Thermo-Nuclear Maintainability Remediation

**Goal:** Resolve the structural risks found in the thermo-nuclear code quality review before adding more feature surface.

**Milestone:** M2.7 - Reader runtime, startup orchestration, highlighting, source capture, and release packaging have explicit boundaries, typed contracts, and E2E validation.

**Priority order:** Complete tasks in sequence. Do not begin a later implementation task until the previous task has passed its focused tests and refactor gate.

### 2.7.1 Characterization Tests And Reader View Harness

- [D] Capture current reader behavior through public APIs before refactoring `VaultReaderView`.
- [D] Add a reusable `createReaderViewHarness` helper for fake leaf, settings store, position store, scheduler, notices, and DOM query helpers.
- [D] Remove direct private-member access from new reader-view tests.
- [D] Add a complexity policy test that fails if `src/reader/reader-view.ts` crosses `1000` lines before decomposition is complete.
- [D] [T] RED: write harness-backed tests that prove the current shell, controls, session loading, keyboard actions, settings persistence, highlighting, zoom bounds, and closeout behavior.
- [D] [T] GREEN: introduce only test helpers and characterization coverage first; no production refactor in this slice.
- [D] [T] REFACTOR: replace duplicated setup in reader-view tests with the harness while keeping behavior unchanged.

**Suggested test files:**

- `tests/helpers/reader-view-harness.ts`
- `tests/integration/reader-view-runtime.test.ts`
- `tests/unit/architecture-boundary-policy.test.ts`

**Acceptance tests:**

- `reader view harness can open a session, click controls, and observe public DOM state`
- `reader view tests do not need direct access to private sessionRunner`
- `reader-view.ts line-count guard fails before uncontrolled growth past 1000 lines`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/architecture-boundary-policy.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts`

### 2.7.2 Split Reader View Shell And DOM Rendering

- [D] Extract static shell construction from `VaultReaderView` into a focused view-shell module.
- [D] Extract render/update logic into a renderer that receives a snapshot and settings-derived view model.
- [D] Keep `VaultReaderView` responsible only for Obsidian lifecycle, composition, and delegation.
- [D] Preserve existing CSS class hooks and DOM structure used by tests and manual validation.
- [D] [T] RED: add failing shell/renderer tests before moving DOM creation code.
- [D] [T] GREEN: move DOM construction and render updates with no behavior change.
- [D] [T] REFACTOR: delete duplicated null checks and collapse repeated DOM update branches into typed element refs.

**Suggested implementation files:**

- `src/reader/view/reader-view-shell.ts`
- `src/reader/view/reader-view-renderer.ts`
- `src/reader/view/reader-view-elements.ts`

**Suggested test files:**

- `tests/unit/reader-view-shell.test.ts`
- `tests/unit/reader-view-renderer.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `shell builder creates header, body, token, and controls with stable class names`
- `renderer updates text, controls, ORP token parts, and disabled states without rebuilding the shell`
- `reader session started before onOpen still renders a usable UI`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts tests/unit/architecture-boundary-policy.test.ts`

### 2.7.3 Extract Reader Actions, Settings, And Appearance Controllers

- [D] Extract play/pause/stop/WPM/keyboard behavior into a reader action controller.
- [D] Extract typography, panel zoom, accent theme, and in-note highlight setting updates into an appearance/settings controller.
- [D] Move panel zoom measurement and dynamic bounds into a dedicated module with no Obsidian dependency.
- [D] Keep debounced WPM persistence atomic and flushable on close.
- [D] [T] RED: write failing action-controller and appearance-controller tests first.
- [D] [T] GREEN: route existing button and keyboard events through the extracted controllers.
- [D] [T] REFACTOR: remove feature-specific branches from `VaultReaderView` once controllers own the behavior.

**Suggested implementation files:**

- `src/reader/view/reader-view-actions.ts`
- `src/reader/view/reader-appearance-controller.ts`
- `src/reader/view/panel-zoom-controller.ts`

**Suggested test files:**

- `tests/unit/reader-view-actions.test.ts`
- `tests/unit/reader-appearance-controller.test.ts`
- `tests/unit/panel-zoom-controller.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `space, k, escape, arrow-up, and arrow-down resolve to expected public actions`
- `WPM changes persist after debounce and flush on close`
- `typography and panel zoom controls clamp to dynamic container bounds`
- `accent and highlight color toggles persist and rerender without restarting playback`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-view-actions.test.ts tests/unit/reader-appearance-controller.test.ts tests/unit/panel-zoom-controller.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts tests/unit/architecture-boundary-policy.test.ts`

### 2.7.4 Convert In-Note Highlighting To An Explicit State Machine

- [D] Replace implicit `enabled/map/unavailable/notified` flags with a typed highlight state model.
- [D] Model highlight states as `disabled`, `ready`, `active`, and `unavailable(reason)`.
- [D] Render control labels from the state model so users can see degraded highlight state.
- [D] Ensure adapter failures transition exactly once to unavailable and do not break panel playback.
- [D] [T] RED: write failing state-machine tests before changing `ReaderSourceHighlighter`.
- [D] [T] GREEN: implement the state transitions with current behavior preserved where possible.
- [D] [T] REFACTOR: move notification throttling out of `VaultReaderView` and into the highlight session boundary.

**Suggested implementation files:**

- `src/reader/source-highlight-state.ts`
- `src/reader/source-highlighter.ts`
- `src/reader/view/reader-highlight-session.ts`

**Suggested test files:**

- `tests/unit/source-highlight-state.test.ts`
- `tests/unit/source-highlighter.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `disabled highlight state never calls adapter apply`
- `ready state becomes active when a valid token range exists`
- `adapter failure becomes unavailable(reason) and notifies once`
- `unavailable highlight state keeps reader playback active`
- `highlight control label reflects disabled, active, and unavailable states`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/integration/reader-view-runtime.test.ts tests/unit/source-highlight-state.test.ts tests/unit/source-highlighter.test.ts tests/unit/reader-view-renderer.test.ts`

### 2.7.5 Extract Start Session Use Case From Obsidian Plugin Startup

- [D] Move command orchestration out of `src/main.ts` into a dedicated start-session use case.
- [D] Return typed results instead of directly showing notices inside orchestration.
- [D] Keep `src/main.ts` as an Obsidian adapter that wires commands, views, notices, and editor integration.
- [D] Isolate reader leaf activation behind a small view activator boundary.
- [D] [T] RED: write failing use-case tests for each source/session outcome before moving code.
- [D] [T] GREEN: implement the use case and adapt the existing command callback to it.
- [D] [T] REFACTOR: delete orchestration logic from `src/main.ts` once tests prove the extracted path.

**Suggested implementation files:**

- `src/reader/start-reader-session-use-case.ts`
- `src/reader/reader-view-activator.ts`
- `src/main.ts`

**Suggested test files:**

- `tests/unit/start-reader-session-use-case.test.ts`
- `tests/unit/reader-view-activator.test.ts`
- `tests/integration/start-session-command.test.ts`

**Acceptance tests:**

- `no active note returns NO_ACTIVE_FILE result without opening reader view`
- `empty source returns EMPTY_SOURCE_TEXT result without opening reader view`
- `zero-token normalized source returns TOKENIZATION_EMPTY result`
- `successful source builds source key, tokens, highlight map, and session payload`
- `stale reader leaf is recreated before session is set`
- `main plugin command converts use-case results into Obsidian notices`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/start-reader-session-use-case.test.ts tests/unit/reader-view-activator.test.ts tests/integration/start-session-command.test.ts`

### 2.7.6 Replace Silent Source Fallbacks With Typed Capture Diagnostics

- [D] Replace silent selection/editor catches with typed source capture diagnostics.
- [D] Capture source capabilities for readable selection, range/context metadata, offset fallback, document text, read failures, and capture failures.
- [D] Preserve graceful UX while making fallback reasons observable to tests and diagnostics.
- [D] Improve fallback source-key strategy when range metadata is unavailable to reduce repeated-selection collisions.
- [D] [T] RED: add failing tests for each missing capability and capture failure.
- [D] [T] GREEN: implement typed diagnostics without changing successful source resolution behavior.
- [D] [T] REFACTOR: remove ambiguous `{}` and `null` fallbacks where a typed diagnostic is available.

**Suggested implementation files:**

- `src/reader/source-capture-diagnostics.ts`
- `src/reader/source-resolver.ts`
- `src/reader/source-key.ts`

**Suggested test files:**

- `tests/unit/source-capture-diagnostics.test.ts`
- `tests/unit/source-resolver.test.ts`
- `tests/unit/source-key.test.ts`
- `tests/integration/active-note.test.ts`

**Acceptance tests:**

- `missing active editor returns SOURCE_SELECTION_EMPTY diagnostic`
- `selection without range metadata returns SOURCE_SELECTION_METADATA_UNAVAILABLE diagnostic and stable fallback key`
- `selection without offset metadata falls back safely while keeping panel reading`
- `editor capture exception returns SOURCE_SELECTION_CAPTURE_FAILED diagnostic without throwing`
- `same-file repeated selection fallback keys use range, context, offset, then anonymous hash scope`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/source-resolver.test.ts tests/integration/active-note.test.ts`
- `npm run test -- tests/unit/source-key.test.ts tests/unit/source-resolver.test.ts tests/unit/start-reader-session-use-case.test.ts`

### 2.7.7 Strengthen Release Packaging Contracts And Coverage Boundaries

- [D] Extract release packaging validation rules into a testable policy module.
- [D] Add tests for manifest ID, version sync, release asset set, checksum generation, and tag naming.
- [D] Expand coverage scope to include startup, errors, and extracted command orchestration.
- [D] Keep generated `main.js` and `release/` out of source tracking.
- [D] [T] RED: add failing release-policy tests before changing scripts.
- [D] [T] GREEN: implement release policy module and adapt `scripts/package-release.mjs`.
- [D] [T] REFACTOR: keep scripts thin and move reusable validation logic into tested source.

**Suggested implementation files:**

- `scripts/release-package-policy.mjs`
- `scripts/release-package-policy.d.ts`
- `scripts/package-release.mjs`
- `vitest.config.ts`

**Suggested test files:**

- `tests/unit/release-package-policy.test.ts`
- `tests/unit/release-artifact-policy.test.ts`
- `tests/unit/coverage-policy.test.ts`

**Acceptance tests:**

- `release policy rejects manifest IDs containing obsidian or plugin suffix`
- `release policy requires manifest/package/versions version sync`
- `release package contains exactly main.js, manifest.json, styles.css, and SHA256SUMS`
- `coverage policy includes src/main.ts, src/errors, and extracted orchestration modules`
- `repo-shape rejects tracked main.js and release output`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/release-package-policy.test.ts tests/unit/release-artifact-policy.test.ts tests/unit/coverage-policy.test.ts`

### 2.7.8 End-To-End Release Candidate Validation

- [D] Add an automated E2E smoke that packages the plugin and installs the assets into a clean temporary vault plugin folder.
- [D] Validate the installed manifest ID, asset presence, and release checksum integrity.
- [D] Add a manual Obsidian E2E checklist for the real app because Obsidian UI automation is not yet part of the repo.
- [D] Validate the changed architecture still works from a user perspective: command, reader pane, playback, controls, settings persistence, in-note highlight, reload.
- [D] [T] RED: write failing E2E packaging/install smoke before changing release scripts or local deploy flow.
- [D] [T] GREEN: implement the automated E2E smoke and document the manual Obsidian gate.
- [D] [T] REFACTOR: make local deploy and release package flows share the same asset list/policy.

**Suggested implementation files:**

- `scripts/release-candidate-validation.mjs`
- `scripts/release-candidate-validation.d.ts`
- `scripts/package-release.mjs`
- `scripts/deploy-local-vault.mjs`
- `docs/archive/pre-community-release/phase-2-qa-checklist-2026-06.md`

**Suggested test files:**

- `tests/e2e/release-package-install.test.ts`
- `tests/integration/start-session-command.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Automated E2E acceptance tests:**

- `npm run package:release creates release/<version>/main.js, manifest.json, styles.css, SHA256SUMS`
- `release package installs into a clean temporary .obsidian/plugins/vault-reader folder`
- `installed manifest id is vault-reader and version matches package version`
- `release checksum file verifies copied assets`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/e2e/release-package-install.test.ts tests/unit/release-package-policy.test.ts`
- `npm run test:e2e:release`

**Manual Obsidian E2E checklist:**

- Open `fixtures/manual-test-vault` in Obsidian.
- Enable the `vault-reader` community plugin.
- Run command palette action `Vault Reader: Start reading current note` from a normal note.
- Confirm the reader opens in the right split with title, token, controls, WPM, text size, zoom, accent, and highlight controls visible.
- Press play, pause, resume, stop, arrow-up, and arrow-down.
- Toggle ORP, accent, note highlight, and highlight color.
- Reload Obsidian or disable/enable the plugin and confirm settings/progress recover safely.
- Confirm unsupported highlight contexts fall back to panel-only reading without breaking playback.

### 2.7.9 Thermo-Nuclear Closeout Gate

- [D] Re-run the thermo-nuclear code quality review after all 2.7 implementation tasks are complete.
- [D] Confirm `reader-view.ts` is substantially below the 1000-line tripwire and owns only Obsidian lifecycle/composition.
- [D] Confirm `src/main.ts` owns plugin wiring only, not business orchestration.
- [D] Confirm source capture diagnostics and highlight state are explicit typed contracts.
- [D] Confirm no new high-traffic feature branches were bolted into shared modules.
- [D] [T] Add or update architecture policy tests that prevent the same structural regression from returning.

**Suggested test files:**

- `tests/unit/architecture-boundary-policy.test.ts`
- `tests/unit/ci-workflow-policy.test.ts`
- `tests/unit/coverage-policy.test.ts`

**Closeout validation evidence required:**

- `npm run format:check`
- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build:release`
- `npm run package:release`
- `npm audit`
- `bash tests/no-secrets.sh`
- Manual Obsidian E2E checklist completed with notes
- Thermo-nuclear gate result recorded as `pass` or explicitly accepted `pass-with-conditions`

**Thermo-nuclear gate result (2026-06-13):**

- `pass-with-conditions`: no blocker/high structural findings remain after resolving source capture diagnostics and source-key fallback scope; remaining condition is manual Obsidian E2E before publish.
- `reader-view.ts` reduced to 589 lines and remains below the 1000-line tripwire.
- `src/main.ts` reduced to plugin wiring, command notices, and Obsidian adapter composition.
- Source capture diagnostics, highlight state, reader actions, render shell, release package policy, and release candidate validation now have explicit typed contracts.

**Closeout validation evidence (2026-06-13):**

- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 48 test files, 180 tests.
- `npm run test -- --coverage` passed: statements 89.92%, branches 79.77%, functions 93.52%, lines 89.99%.
- `npm run build:release` passed.
- `npm run package:release` passed and packaged `release/0.1.0`.
- `npm audit` initially found a high-severity `esbuild` advisory; upgraded `esbuild` to `^0.28.1`; rerun passed with `found 0 vulnerabilities`.
- `bash tests/no-secrets.sh` passed.
- Manual Obsidian E2E remains required before publishing.

**Release gate for active release-readiness work:**

- [D] Phase 2.7 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.
- [D] No blocker or high thermo-nuclear findings remain unresolved.

## Phase 2.8: Restart From Beginning UX

**Goal:** Give users an obvious, reliable way to reset the current reading session to the start of the note/page without reopening the note or clearing plugin data manually.

**Milestone:** M2.8 - The reader panel exposes a tested restart path that resets playback, progress, persisted position, and in-note highlight to token `0`.

**Recommended product decision:** Implement a visible `Restart` button in the reader controls first. Defer command palette and keyboard shortcuts unless manual testing shows discoverability or speed issues.

### 2.8.1 Restart Behavior Contract

- [D] Define restart semantics for every reader state: `READY`, `PLAYING`, `PAUSED`, `COMPLETE`, `IDLE`, and `ERROR`.
- [D] Decide whether `Restart` should leave the reader in `READY` or immediately play; default recommendation is `READY` to avoid surprising autoplay.
- [D] Ensure restart is unavailable or harmless when no session is loaded.
- [D] Ensure restart uses the current session payload, current WPM, current settings, and token list without resolving the Obsidian source again.
- [D] [T] RED: add failing action-controller tests for restart from `PLAYING`, `PAUSED`, `COMPLETE`, and `READY`.
- [D] [T] GREEN: implement a restart action that reloads the current session at `startIndex: 0`.
- [D] [T] REFACTOR: keep restart orchestration inside the reader action controller instead of bolting special cases into `VaultReaderView`.

**Suggested implementation files:**

- `src/reader/view/reader-view-actions.ts`
- `src/reader/reader-view-model.ts`
- `src/reader/reader-view.ts`

**Suggested test files:**

- `tests/unit/reader-view-actions.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `restart reloads the current session at token index 0 without source re-resolution`
- `restart from PLAYING stops playback and leaves the session READY at token 0`
- `restart from PAUSED leaves the session READY at token 0`
- `restart from COMPLETE behaves consistently with replay but does not autoplay unless explicitly chosen`
- `restart with no loaded session is a no-op and does not show an error notice`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-view-actions.test.ts tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts`

### 2.8.2 Reader Panel Restart Control

- [D] Add a visible `Restart` control near `Play/Pause` and `Stop`.
- [D] Preserve existing control order and keyboard navigation.
- [D] Disable the restart button when there is no active token/session.
- [D] Keep the button label simple and non-technical: `Restart`.
- [D] [T] RED: add failing shell/renderer tests proving the restart button exists, has stable class/name hooks, and disables correctly.
- [D] [T] GREEN: add the shell element and renderer state update.
- [D] [T] REFACTOR: keep DOM creation in `reader-view-shell` and state rendering in `reader-view-renderer`.

**Suggested implementation files:**

- `src/reader/view/reader-view-elements.ts`
- `src/reader/view/reader-view-shell.ts`
- `src/reader/view/reader-view-renderer.ts`
- `src/reader/reader-view.ts`

**Suggested test files:**

- `tests/unit/reader-view-shell.test.ts`
- `tests/unit/reader-view-renderer.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `reader shell exposes a Restart button with a stable vault-reader restart class`
- `renderer disables Restart when state is IDLE with no session`
- `renderer enables Restart for READY, PLAYING, PAUSED, and COMPLETE sessions`
- `clicking Restart resets the visible token, progress label, and play button label`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-view-actions.test.ts tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts`

### 2.8.3 Persistence And Highlight Reset

- [D] Persist the reading position as `0` after restart so reopening the note starts from the beginning.
- [D] Clear any pending WPM persistence safely before or after restart without losing the current WPM.
- [D] Update in-note highlight to the first token when highlight is enabled.
- [D] Clear stale highlight when restart is unavailable or no exact source map exists.
- [D] [T] RED: add failing integration tests for saved position reset and first-token highlight after restart.
- [D] [T] GREEN: persist token index `0` through the existing position store boundary.
- [D] [T] REFACTOR: avoid direct store writes from the view if the controller/session boundary can own position persistence.

**Suggested implementation files:**

- `src/reader/reader-controller.ts`
- `src/reader/reader-session-runner.ts`
- `src/reader/view/reader-view-actions.ts`
- `src/reader/source-highlighter.ts`

**Suggested test files:**

- `tests/unit/reader-controller.test.ts`
- `tests/unit/reader-view-actions.test.ts`
- `tests/unit/source-highlighter.test.ts`
- `tests/integration/reader-view-runtime.test.ts`

**Acceptance tests:**

- `restart saves reading position 0 for the current source key`
- `reopening the same source after restart resumes from token 0`
- `restart keeps the current WPM value`
- `restart re-applies in-note highlight to the first token`
- `restart does not emit highlight unavailable notices when highlight is disabled`

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-controller.test.ts tests/unit/source-highlighter.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts`

### 2.8.4 Optional Command And Keyboard Shortcut Backlog

- [D] Document command palette restart as optional, not required for the first fix.
- [D] Document keyboard shortcut support as optional, not required for the first fix.
- [ ] If added, make the command operate only on the active reader view and no-op safely when the reader view is unavailable.
- [ ] If added, reserve a low-conflict key such as `Home` only when focus is inside the reader panel; avoid global shortcuts by default.
- [ ] [T] RED: if selected, add failing command integration tests before registering the command.
- [ ] [T] GREEN: if selected, register the command or keyboard action through the same restart controller path as the button.
- [ ] [T] REFACTOR: keep command and keyboard inputs as thin adapters over the restart action.

**Suggested implementation files if selected:**

- `src/main.ts`
- `src/reader/reader-view-model.ts`
- `src/reader/view/reader-view-actions.ts`

**Suggested test files if selected:**

- `tests/integration/start-session-command.test.ts`
- `tests/integration/reader-view-runtime.test.ts`
- `tests/unit/reader-view-actions.test.ts`

**Acceptance tests if selected:**

- `command palette restart resets the active reader session to token 0`
- `reader-focused keyboard restart does not trigger while typing in inputs`
- `button, command, and keyboard paths share the same restart behavior`

**Deferral note (2026-06-13):**

- Command palette and keyboard restart were intentionally deferred. The visible `Restart` button is the canonical first release path; future command/keyboard adapters should call the same `ReaderViewActions.restart()` behavior.

### 2.8.5 Local QA And Release Gate

- [D] Run focused restart tests before broad regression.
- [D] Run full reader runtime regression after implementation.
- [D] Run local build/deploy so the fix can be tested in `fixtures/manual-test-vault`.
- [D] Manually verify restart from a normal note, after partial playback, after pause, after completion, with note highlight on, and with note highlight off.
- [D] [T] Close the phase only after automated restart tests and manual Obsidian QA both pass.

**Validation evidence required at closeout:**

- `npm run test -- tests/unit/reader-view-actions.test.ts tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts`
- `npm run test -- tests/integration/reader-view-runtime.test.ts`
- `npm run test -- tests/unit/reader-controller.test.ts tests/unit/source-highlighter.test.ts`
- `npm run lint`
- `npm run build:local`
- Manual Obsidian QA notes for restart behavior

**Release gate for active release-readiness work:**

- [D] Phase 2.8 restart behavior is complete and validated, or explicitly deferred in `docs/roadmap.md`.
- [D] Restart does not regress resume/progress persistence, playback controls, or in-note highlight.

**Validation evidence (2026-06-13):**

- `npm run test -- tests/unit/reader-view-actions.test.ts tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts` passed.
- `npm run test -- tests/integration/reader-view-runtime.test.ts` passed: 19 tests.
- `npm run test -- tests/unit/reader-controller.test.ts tests/unit/source-highlighter.test.ts` passed.
- `npm run lint` passed.
- `npm run build:local` passed and deployed to `fixtures/manual-test-vault/.obsidian/plugins/vault-reader`.
- Manual Obsidian QA passed on 2026-06-15 after the reader source-change/rebind fix was validated locally.

## Phase 3: Community Plugin Release Readiness

**Goal:** Make Vault Reader ready for public GitHub review and Obsidian Community Plugin submission while preserving the focused, local-first product identity.

**Milestone:** M3 - A release candidate can be installed from GitHub Releases, passes security/public-review gates, has launch-ready documentation, and is ready for an `obsidianmd/obsidian-releases` submission PR.

**Priority principle:** Ship the exceptional Obsidian-native reader first. Do not add RSVP Nano, BYOK AI, payment, telemetry, accounts, or backend scope before the first community release.

### 3.1 Scope Freeze, Positioning, And Release Contract

- [D] Define the first public release promise in one sentence: `Focused speed reading for Obsidian notes, local-first, with optional in-note follow-along highlight`.
- [D] Mark RSVP Nano export, BYOK AI, paid licensing, cloud sync, telemetry, and device flashing as explicit non-goals for this release.
- [D] Confirm `manifest.json` values are public-store appropriate: `id`, `name`, `version`, `minAppVersion`, `description`, `author`, `authorUrl`, and `isDesktopOnly`.
- [D] Confirm desktop-only status is intentional; if mobile is not tested, keep `isDesktopOnly: true` and document that boundary.
- [D] Add a release-readiness decision note to `docs/release-notes.md` that states what is included, what is deferred, and why.
- [D] [T] RED: add policy tests that fail when manifest/package/versions drift or release-scope docs omit required public-release sections.
- [D] [T] GREEN: update docs and metadata until the release contract tests pass.
- [D] [T] REFACTOR: remove duplicate release wording from older docs and link to one canonical release contract.

**Suggested test files:**

- `tests/unit/manifest-shape.test.ts`
- `tests/unit/release-package-policy.test.ts`
- `tests/unit/docs-release-readiness-policy.test.ts`

**Acceptance tests:**

- `manifest, package, versions, and release notes agree on the public release version`
- `release-readiness docs contain included scope, deferred scope, privacy stance, and manual install path`
- `manifest description is concise, searchable, and aligned with the README product promise`

**Validation evidence (2026-06-14):**

- `npm run test -- tests/unit/docs-release-readiness-policy.test.ts tests/unit/community-plugin-qa-policy.test.ts tests/unit/manifest-shape.test.ts tests/unit/release-package-policy.test.ts` passed.
- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed.
- `npm run build:release` passed.

### 3.2 Security And Public Review: Threat Model, Privacy, And Data Handling

- [D] Write a lightweight threat model covering local note content, Obsidian plugin APIs, persisted settings/progress, release artifacts, dependency supply chain, and GitHub distribution.
- [D] Confirm the plugin makes no network requests, starts no backend, stores no credentials, and sends no telemetry.
- [D] Document exactly what is stored locally and where Obsidian stores plugin data.
- [D] Confirm all user-controlled note content is rendered through safe text APIs (`textContent` or equivalent), not unsafe HTML insertion.
- [D] Ensure user-facing error messages are sanitized and do not leak stack traces, filesystem paths, or low-value internals.
- [D] Verify no secrets, tokens, private keys, or local machine paths are committed or packaged.
- [D] [T] RED: add failing security policy tests for no-network imports, no unsafe HTML rendering in reader paths, sanitized notice copy, and release package contents.
- [D] [T] GREEN: harden code and docs until security policy tests pass.
- [D] [T] REFACTOR: isolate any required Obsidian API boundary so the domain remains testable without real vault data.

**Suggested implementation files:**

- `docs/security-review.md`
- `SECURITY.md`
- `src/errors/*`
- `src/reader/view/*`
- `tests/no-secrets.sh`

**Suggested test files:**

- `tests/unit/security-policy.test.ts`
- `tests/unit/reader-view-renderer.test.ts`
- `tests/unit/error-presenter.test.ts`
- `tests/unit/release-artifact-policy.test.ts`

**Acceptance tests:**

- `security policy rejects fetch, XMLHttpRequest, WebSocket, or remote URL usage in runtime source`
- `reader rendering uses text-safe output for note-derived content`
- `notices expose friendly error copy without stack traces or absolute local paths`
- `release package does not include fixtures, test vault files, dotenv files, private keys, or source maps unless intentionally approved`

**Validation evidence (2026-06-15):**

- RED: `npm run test -- tests/unit/security-policy.test.ts` failed for missing `docs/security-review.md` and the remaining reader `innerHTML` clear operation.
- GREEN focused suite: `npm run test -- tests/unit/security-policy.test.ts tests/unit/vault-reader-error.test.ts tests/integration/reader-view-runtime.test.ts tests/unit/release-artifact-policy.test.ts` passed: 4 files, 30 tests.
- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 56 files, 211 tests.
- `npm run build:release` passed, including no-secrets, repo-shape, release-artifacts, package build, and release packaging for `0.1.0`.
- Replaced reader shell `innerHTML = ""` with `replaceChildren()`.
- Added absolute-path and stack-trace fallback coverage for user-facing notice sanitization.

### 3.3 Security And Public Review: Supply Chain, CI, GitHub Hygiene, And Submission Safety

- [D] Run and document `npm audit` results; fix high/critical findings before public release or document a justified exception.
- [D] Run and document secret scanning across tracked files and, if feasible, repository history before making the repo public.
- [D] Ensure GitHub Actions run format, lint, tests, coverage, release build, package validation, audit, and secret scan on PR/push.
- [D] Add or verify branch protection expectations for `main` once public: passing CI before merge, no force-push for normal work, and reviewed release changes.
- [D] Add or verify Dependabot alerts/updates and GitHub private vulnerability reporting.
- [D] Add issue templates for bug reports and feature requests that collect Obsidian version, plugin version, platform, reproduction steps, and expected behavior.
- [D] Add a minimal contributing note that explains TDD-first changes, release gates, and how to run local validation.
- [D] Verify repository visibility is switched to public only after the release package, README, license, security policy, and QA evidence are ready.
- [D] [T] RED: add failing CI-policy and repo-shape tests that detect missing release gates, missing docs, or tracked generated artifacts.
- [D] [T] GREEN: update workflows, scripts, and docs until the public-review gate is reproducible.
- [D] [T] REFACTOR: keep CI scripts small by reusing existing package/release policy modules.

**Suggested implementation files:**

- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/dependabot.yml`
- `CONTRIBUTING.md`
- `docs/security-review.md`

**Suggested test files:**

- `tests/unit/ci-workflow-policy.test.ts`
- `tests/unit/repo-shape-policy.test.ts`
- `tests/unit/release-package-policy.test.ts`
- `tests/unit/docs-release-readiness-policy.test.ts`

**Acceptance tests:**

- `CI workflow contains format, lint, test, coverage, build, package, audit, and no-secrets gates`
- `repo-shape policy rejects tracked build outputs and release artifacts`
- `public-review docs include license, security, contributing, release notes, and manual QA links`
- `GitHub issue templates collect enough reproduction detail for Obsidian plugin support`

**Validation evidence (2026-06-15):**

- RED: `npm run test -- tests/unit/ci-workflow-policy.test.ts tests/unit/public-review-hygiene-policy.test.ts` failed for missing format/audit/secrets CI gates, Dependabot config, issue templates, and public repo hygiene docs.
- GREEN focused suite: `npm run test -- tests/unit/ci-workflow-policy.test.ts tests/unit/public-review-hygiene-policy.test.ts` passed: 2 files, 4 tests.
- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 57 files, 214 tests.
- `npm audit --audit-level=high` passed with `found 0 vulnerabilities`.
- `npm run build:release` passed, including no-secrets, repo-shape, release-artifacts, package build, and release packaging for `0.1.0`.
- Git history high-confidence secret scan passed.
- GitHub repo verification via `gh api` confirmed private repo, default branch `main`, Issues enabled; branch protection returned `403` until the repo is public or upgraded, so branch protection remains a required pre-public switch documented in `docs/security-review.md`.

### 3.4 Promotion Prep: README, Demo Assets, Launch Copy, And Feedback Loops

- [D] Rewrite the README around user value, not implementation history: what it does, who it is for, how to install, how to use it, privacy, limitations, roadmap.
- [D] Define high-quality screenshot/GIF plan showing the happy path: open note, start reader, play/pause, adjust WPM/zoom, use highlight, restart.
- [D] Add a manual install section for testers before directory approval and a community-plugin install section for after approval.
- [D] Draft Obsidian Forum Showcase copy, Obsidian Discord update copy, Reddit post copy, and a short GitHub release announcement.
- [D] Add GitHub topics such as `obsidian-plugin`, `speed-reading`, `rsvp`, `markdown`, `reading`, and `typescript`.
- [D] Define a feedback loop: issue labels, beta feedback template, known limitations, and what feedback is most useful.
- [D] Define success metrics that do not require plugin telemetry: GitHub stars, release downloads, community plugin downloads after listing, issues opened/closed, and qualitative feedback.
- [D] Keep the roadmap credible: device reader and BYOK AI appear as future exploration, not promised launch features.
- [D] [T] RED: add failing docs/readme policy checks for required launch sections, asset references, install instructions, and roadmap/non-goal clarity.
- [D] [T] GREEN: update README, release notes, and promotional drafts until checks pass.
- [D] [T] REFACTOR: centralize launch copy snippets under docs so README stays concise.

**Suggested docs/assets:**

- `README.md`
- `docs/release-notes.md`
- `docs/launch-plan.md`
- `docs/community-plugin-qa.md`
- `docs/assets/`

**Suggested test files:**

- `tests/unit/readme-policy.test.ts`
- `tests/unit/docs-release-readiness-policy.test.ts`
- `tests/unit/manifest-shape.test.ts`

**Acceptance tests:**

- `README contains value proposition, quick start, privacy, limitations, local install, and roadmap sections`
- `README references demo assets that exist or intentionally links to external release media`
- `launch plan includes forum, Discord, Reddit, GitHub release, and feedback channels`
- `roadmap copy marks RSVP Nano and BYOK AI as future work, not current release functionality`

**Validation evidence (2026-06-15):**

- RED: `npm run test -- tests/unit/readme-public-shape.test.ts tests/unit/launch-plan-policy.test.ts` failed for missing `docs/launch-plan.md`, missing launch-plan link, and missing public README sections.
- GREEN focused suite: `npm run test -- tests/unit/readme-public-shape.test.ts tests/unit/launch-plan-policy.test.ts tests/unit/community-plugin-qa-policy.test.ts tests/unit/docs-release-readiness-policy.test.ts` passed: 4 files, 9 tests.
- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 58 files, 216 tests.
- `npm run build:release` passed, including no-secrets, repo-shape, release-artifacts, package build, and release packaging for `0.1.0`.
- README tester flow, demo plan, and launch copy use `fixtures/manual-test-vault`, the same Obsidian vault used for local QA.
- Actual screenshot/GIF capture remains a manual pre-submission task because it requires Obsidian UI capture from the test vault.

### 3.4.1 Project Repository Hygiene: Public File Structure, Archive Policy, And Scope Alignment

**Goal:** Make the repository look and behave like a professional public Obsidian plugin project before Phase 3.5 submission packaging begins.

**Why this exists:** The working plugin is ready for deeper release prep, but several active docs still described older hardware, BYOK AI, and paid-readiness scope. This phase prevents public reviewers from seeing a confused product boundary.

#### 3.4.1.1 Active Scope Documentation

- [D] Rewrite `CONTEXT.md`, `docs/requirements.md`, and `docs/design.md` around the current community-plugin-first release.
- [D] Make RSVP Nano export, BYOK AI, payments, telemetry, cloud sync, mobile support, and selected-text command explicit deferred scope.
- [D] Preserve historical originals under `docs/archive/pre-community-release/`.
- [D] [T] RED: add a project-hygiene policy test that fails while active docs contain old launch-scope language.
- [D] [T] GREEN: update active docs until the policy test passes.
- [D] [T] REFACTOR: keep active docs concise and move historical rationale to ADR/archive files.

**Acceptance tests:**

- `active requirements contain Community Plugin Release Scope and Deferred Scope`
- `active design contains Community Plugin Architecture and Deferred Architecture`
- `active docs do not define device export, SD-card writing, or BYOK AI as current architecture`

#### 3.4.1.2 Archive And Deferred Test Hygiene

- [D] Move stale paid-readiness and Phase 2 QA docs from active docs into `docs/archive/pre-community-release/`.
- [D] Move deferred RSVP Nano export fixture tests and JSON fixtures out of the active test suite.
- [D] Add an archive README that explains archived files are historical context, not release commitments.
- [D] [T] RED: policy test fails until archived docs, archived export fixtures, and removed active stale paths are all detected.
- [D] [T] GREEN: archive the stale files without deleting the work.
- [D] [T] REFACTOR: update task-list references so historical entries point to archived paths where needed.

**Acceptance tests:**

- `docs/paid-readiness-baseline.md is not active`
- `docs/phase-2-qa-checklist.md is not active`
- `tests/fixtures/export-layout.fixture.test.ts is not active`
- `archived requirements, design, paid-readiness, Phase 2 QA, export test, and export fixtures exist`

#### 3.4.1.3 Repo Shape, Ignore, And Formatter Policy

- [D] Document the professional folder structure in `docs/PROJECT_STRUCTURE.md`.
- [D] Update `tests/repo-shape.sh` so public-review docs and archive paths are required.
- [D] Ensure generated outputs, release packages, local manual-vault scratch files, and deferred active-test artifacts are forbidden from tracking.
- [D] Tighten `.prettierignore` so active docs can be formatted while archive files and local generated material remain intentionally excluded.
- [D] [T] RED: policy test fails until project structure docs and ignore rules match the intended public repo shape.
- [D] [T] GREEN: update repo-shape and ignore policies until focused checks pass.
- [D] [T] REFACTOR: keep structure rules in shell policy and doc-scope rules in Vitest policy tests.

**Acceptance tests:**

- `docs/PROJECT_STRUCTURE.md explains root files, source, tests, fixtures, docs, generated files, and archive policy`
- `.gitignore keeps generated/local files out of Git but does not ignore tracked docs/archive`
- `.prettierignore does not hide active docs or stale one-off backup paths`
- `repo-shape rejects active stale docs, active export-layout tests, generated outputs, and tracked local scratch artifacts`

#### 3.4.1.4 Phase Closeout Gate

- [D] Run focused RED/GREEN evidence for `tests/unit/project-hygiene-policy.test.ts`.
- [D] Run `npm run format:check`.
- [D] Run `npm run lint`.
- [D] Run `npm run test`.
- [D] Run `npm run build:release`.
- [D] Run `bash tests/no-secrets.sh`.
- [D] Review `git status --short` for unexpected generated or secret-like files.
- [D] [T] Phase-level test gate: project hygiene must be covered by both Vitest policy tests and `tests/repo-shape.sh`.

**Closeout validation evidence required:**

- RED output from `npm run test -- tests/unit/project-hygiene-policy.test.ts`
- GREEN output from `npm run test -- tests/unit/project-hygiene-policy.test.ts`
- Full regression output from `npm run test`
- Release-shape output from `npm run build:release`

**Validation evidence (2026-06-15):**

- RED: `npm run test -- tests/unit/project-hygiene-policy.test.ts` failed with 5 failures for stale active requirements/design, missing archive files, missing project-structure docs, and stale `.prettierignore` policy.
- GREEN focused suite: `npm run test -- tests/unit/project-hygiene-policy.test.ts` passed: 1 file, 5 tests.
- `npm run test -- tests/unit/project-hygiene-policy.test.ts tests/unit/no-secrets-policy.test.ts` passed: 2 files, 6 tests.
- `bash tests/no-secrets.sh` passed with no high-confidence secret signatures found.
- `bash tests/repo-shape.sh` passed.
- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 58 files, 218 tests.
- `npm run build:release` passed, including no-secrets, repo-shape, release-artifacts, package build, and release packaging for `0.1.0`.
- Manual test vault scratch files were moved into ignored local archive `fixtures/archive/manual-test-vault/2026-06-15-project-hygiene/`; curated manual QA notes remain in `fixtures/manual-test-vault`.

### 3.4.1.5 Exceptional Pre-Public Polish: First-Use UX, Commands, QA Evidence, And Release Verification

**Goal:** Add small, high-signal improvements that make Vault Reader feel polished and trustworthy before the clean public repository is prepared.

**Scope guard:** Do not add RSVP Nano export, BYOK AI, payments, telemetry, backend services, mobile support, or large new workflows in this phase. This phase is about first-use quality, keyboard/native feel, release confidence, and portfolio presentation.

#### 3.4.1.5.1 Command Palette Polish

- [D] Add a command such as `Vault Reader: Restart current note from beginning`.
- [D] Consider a command such as `Vault Reader: Toggle play/pause` only if it can operate safely on the active reader view without surprising users.
- [D] Ensure new commands no-op safely or show helpful notices when the reader panel is unavailable.
- [D] Keep commands as thin adapters over existing reader actions rather than duplicating controller logic.
- [D] [T] RED: add command integration tests proving restart/toggle commands call the same action path as the UI controls.
- [D] [T] GREEN: register commands and pass command tests.
- [D] [T] REFACTOR: centralize command IDs/copy so README, tests, and plugin registration do not drift.

**Acceptance tests:**

- `restart command resets the active reader session to index 0`
- `restart command gives a helpful notice when no reader session is available`
- `optional toggle command does not start stale hidden-note playback`
- `command IDs and command names remain stable for README/manual QA`

#### 3.4.1.5.2 First-Run Onboarding Hint

- [D] Add a small first-run hint when the reader opens for a user who has not seen onboarding.
- [D] Keep the hint concise: explain play/pause, WPM, highlight, and restart without becoming a tutorial.
- [D] Persist dismissal locally through plugin settings.
- [D] Ensure onboarding never blocks playback or command execution.
- [D] [T] RED: add settings/view-model tests for first-run hint visibility and dismissal persistence.
- [D] [T] GREEN: implement the hint and dismissal path.
- [D] [T] REFACTOR: keep onboarding copy in shared UI copy helpers.

**Acceptance tests:**

- `first reader open shows a concise onboarding hint`
- `dismissed onboarding hint stays dismissed after reload`
- `onboarding hint does not block play, pause, WPM, highlight, or restart controls`
- `onboarding copy does not mention AI, device export, paid plans, or telemetry`

#### 3.4.1.5.3 Empty And Error State Polish

- [D] Review no-note, unsupported editor, highlight-fallback, empty note, and stale-source messages.
- [D] Make each message calm, specific, and action-oriented.
- [D] Ensure notices avoid stack traces, absolute local paths, internal class names, or alarming language.
- [D] Add a distinct empty-reader panel state when there is no readable text.
- [D] [T] RED: add tests for no-note, empty-note, highlight-fallback, and stale-source user-facing copy.
- [D] [T] GREEN: update error and empty-state handling until tests pass.
- [D] [T] REFACTOR: keep user-facing copy centralized and reusable.

**Acceptance tests:**

- `no active note tells the user to open a Markdown note and run Vault Reader again`
- `empty note produces a friendly empty-state instead of broken playback`
- `highlight fallback keeps panel playback available`
- `error notices are sanitized and action-oriented`

#### 3.4.1.5.4 README Screenshot/GIF Capture Package

- [D] Capture or prepare a public demo asset showing the happy path: note, command palette, reader panel, playback, WPM/zoom, in-note highlight, restart.
- [D] Store final assets under `docs/assets/` or document an approved external release-media location.
- [D] Update README to reference the real asset once captured.
- [D] Ensure demo uses only the curated manual test vault content, not private notes or copyrighted book text.
- [D] [T] RED: add/readjust README asset policy tests so referenced local assets must exist or an intentional external media link is documented.
- [D] [T] GREEN: add the asset reference and supporting docs.
- [D] [T] REFACTOR: keep README concise and move capture notes to `docs/assets/README.md` or launch plan.

**Acceptance tests:**

- `README references an existing demo asset or approved external demo link`
- `demo asset plan uses fixtures/manual-test-vault content only`
- `demo flow covers open note, start reader, play/pause, adjust controls, highlight, and restart`
- `docs/assets documents how the demo was captured and what vault content was used`

#### 3.4.1.5.5 Accessibility And Visual Quality Pass

- [D] Validate keyboard flow for opening the command palette, focusing reader controls, play/pause, restart, WPM, ORP, accent, highlight colour, and panel controls.
- [D] Check accessible labels for icon/compact controls.
- [D] Check focus states are visible in default Obsidian themes.
- [D] Check contrast for blue/orange accents and highlight colours.
- [D] Confirm reduced-motion behavior or absence of unnecessary animation.
- [D] [T] RED: add accessibility smoke tests for labels, focusable controls, and no unlabeled interactive elements.
- [D] [T] GREEN: fix labels/focus/contrast issues.
- [D] [T] REFACTOR: keep visual constants centralized where practical.

**Acceptance tests:**

- `reader controls have accessible names`
- `keyboard users can reach primary controls without mouse-only paths`
- `focus states remain visible`
- `accent and highlight colours meet practical contrast expectations in supported contexts`

#### 3.4.1.5.6 Manual QA Evidence Matrix

- [D] Expand `docs/community-plugin-qa.md` with a compact platform matrix.
- [D] Mark macOS as tested when completed and Windows/Linux as not yet tested or community-needed if not available.
- [D] Include Obsidian version, plugin version, OS, install method, and tester initials/date.
- [D] Keep unsupported/unverified platforms honest rather than implying coverage.
- [D] [T] RED: add QA policy tests requiring platform matrix fields and explicit untested-platform wording.
- [D] [T] GREEN: update QA docs until tests pass.
- [D] [T] REFACTOR: keep QA docs short enough to maintain every release.

**Acceptance tests:**

- `QA docs include OS, Obsidian version, plugin version, install method, tester, date, and result`
- `untested platforms are explicitly marked as not yet verified`
- `manual QA flows cover command, reader, playback, settings, highlight, restart, reload, and clean install`

#### 3.4.1.5.7 Release Verification Command

- [D] Add a single release verification command such as `npm run verify:release`.
- [D] The command should run format, lint, tests, release build/package checks, release E2E, audit, and no-secrets checks.
- [D] Keep the existing smaller scripts available for focused local work.
- [D] Document when to use `npm run verify:release` before public repo export and before GitHub releases.
- [D] [T] RED: add package-script policy tests requiring the composed release verification command and expected subcommands.
- [D] [T] GREEN: update `package.json` scripts and docs.
- [D] [T] REFACTOR: avoid duplicating long command sequences across docs.

**Acceptance tests:**

- `package.json includes verify:release`
- `verify:release includes format, lint, test, build:release, package:release, test:e2e:release, audit, and no-secrets gates`
- `docs reference verify:release as the pre-public-export and pre-release gate`

#### 3.4.1.5.8 Phase Closeout Gate

- [D] Run focused tests for touched command/onboarding/error/accessibility/docs/package-script policies.
- [D] Run `npm run format:check`.
- [D] Run `npm run lint`.
- [D] Run `npm run test`.
- [D] Run `npm run build:release`.
- [D] Run `npm run verify:release` after it exists.
- [D] Run `bash tests/no-secrets.sh`.
- [D] Run manual Obsidian QA for the polished first-use flow and record results.
- [D] [T] Phase-level test gate: each polish item must have automated policy/behavior coverage or explicit manual QA evidence.

**Closeout validation evidence required:**

- RED/GREEN evidence for each implemented polish item.
- Full regression evidence.
- Manual Obsidian QA evidence for first-run UX, command palette, empty/error states, accessibility basics, demo flow, and release verification.
- Confirmation that no deferred hardware/AI/payment scope was introduced.

**Validation evidence (2026-06-19):**

- RED: `npm run test -- tests/integration/plugin-commands.test.ts tests/unit/vault-reader-data-store.test.ts tests/unit/settings-store.test.ts tests/unit/reader-view-shell.test.ts tests/unit/reader-view-renderer.test.ts tests/unit/ui-copy.test.ts tests/unit/exceptional-polish-policy.test.ts` failed with 20 expected failures for missing command adapters, onboarding state/elements, demo/QA docs, and `verify:release`.
- GREEN focused suite passed: 7 files, 32 tests.
- `npm run lint` passed.
- `npm run test` passed: 60 files, 228 tests.
- `npm run verify:release` passed with network access for `npm audit`; audit reported 0 vulnerabilities after `npm audit fix` updated the lockfile.
- `npm run build:local` passed and deployed `main.js`, `manifest.json`, and `styles.css` into `fixtures/manual-test-vault/.obsidian/plugins/vault-reader`.
- Manual Obsidian QA passed on 2026-06-21 against `fixtures/manual-test-vault`; Obsidian version was not recorded.
- No RSVP Nano export, BYOK AI, payment, telemetry, backend, or mobile scope was introduced.

### 3.4.2 Clean Public Repository Preparation: No-History Publication And Leak Prevention

**Goal:** Prepare a clean public GitHub publication path that exposes only the polished current project state, not the private working history, old scope churn, abandoned implementation attempts, local debugging context, or strategy notes.

**Recommendation:** Keep this private repo as the working/build lab. Publish the community plugin from a fresh public repository or an explicitly orphaned public branch with one clean initial commit.

**Why this exists:** The private Git history is useful for development but not useful for public review. Even if secret scans pass, the history reveals internal product strategy, paid-readiness discussion, device roadmap churn, reverted work, debugging attempts, and local workflow details. A clean public repo gives reviewers the best signal with the lowest leakage risk.

#### 3.4.2.1 Private Working Repo Closeout

- [D] Commit the completed Phase 3.4.1 project-hygiene work privately before preparing any public export.
- [D] Push the private working repo so the current build-lab state is backed up.
- [D] Confirm `git status --short` is clean before creating the clean public tree.
- [D] Record the private source commit SHA used for the public export in a private note, not in public docs.
- [D] [T] RED: add or update a release-prep policy test that fails when the public-export source state is dirty or lacks a recorded source-ref checklist item.
- [D] [T] GREEN: document the private closeout checklist and make the policy pass.
- [D] [T] REFACTOR: keep private provenance out of public-facing docs.

**Acceptance tests:**

- `private working repo has a clean status before export`
- `Phase 3.4.1 commit exists before clean public repo preparation`
- `public docs do not expose private commit hashes, local usernames, private repo URLs, tokens, or build-lab notes`

**Validation evidence (2026-06-21):**

- `bash tests/no-secrets.sh` passed before staging.
- Completed private baseline commit for Phase 3.4.1 and Phase 3.4.1.5 work.
- Pushed `main` to private `origin`.
- `git status --short` returned clean after push.
- Private source reference is intentionally not recorded in public docs.

#### 3.4.2.2 History And Secret Review Gate

- [D] Run tracked-file secret scan on the current tree.
- [D] Run history-aware secret scan before any existing repo is made public.
- [D] Review Git history for sensitive or unnecessary public context: tokens, local paths, paid strategy, debugging logs, copied content, abandoned device/AI implementation details, and private repo/branch names.
- [D] Decide explicitly: new public repo with one clean initial commit is the default; exposing current history requires a written exception.
- [D] [T] RED: add a public-history policy test/checklist that fails unless `no-history public repo` is the selected default or an exception is documented.
- [D] [T] GREEN: document the decision and required scans.
- [D] [T] REFACTOR: keep scan commands reusable and avoid hard-coding local machine paths.

**Acceptance tests:**

- `tracked-file no-secrets scan passes`
- `history scan passes or produces only documented false positives`
- `public-history decision is recorded as no-history by default`
- `current private remote is not treated as the public submission source unless explicitly approved`

**Validation evidence:**

- RED: `npm run test -- tests/unit/public-history-policy.test.ts` failed while `docs/public-history-review.md` did not exist.
- GREEN: `npm run test -- tests/unit/public-history-policy.test.ts` passed: 1 file, 3 tests.
- `bash tests/no-secrets.sh` passed with no high-confidence tracked-file secret signatures.
- High-confidence history-aware secret scan produced no matches.
- `bash tests/repo-shape.sh` passed with `docs/public-history-review.md` required as a release-readiness document.
- Broader history context review confirms the current private history contains unnecessary public context, so the documented default remains a new public repository with one clean initial commit.
- Public history docs intentionally avoid private source commit identifiers, local machine paths, private remotes, and token examples.

#### 3.4.2.3 Clean Tree Export

- [D] Export the current working tree without `.git`.
- [D] Exclude ignored/generated/local-only artifacts: `node_modules/`, `coverage/`, `release/`, `main.js`, `.DS_Store`, `.env*`, manual-vault deployed plugin assets, local workspace files, and ignored scratch archives.
- [D] Include only the public project source, docs, tests, fixtures, scripts, metadata, and GitHub workflow files needed for review and release.
- [D] Validate the exported tree can run install, format, lint, tests, build, package, and release validation independently.
- [D] [T] RED: add a clean-export policy test that fails when exported file lists include generated, ignored, local-only, or private artifacts.
- [D] [T] GREEN: implement or document the clean-export process until the export policy passes.
- [D] [T] REFACTOR: keep the export allow/deny rules aligned with `.gitignore`, `tests/repo-shape.sh`, and release packaging policy.

**Acceptance tests:**

- `clean export does not contain .git`
- `clean export does not contain generated or local-only artifacts`
- `clean export contains manifest.json, versions.json, README, LICENSE, SECURITY, CONTRIBUTING, docs, src, tests, fixtures, scripts, and GitHub workflow files`
- `clean export can pass npm run verify or equivalent release-readiness command from a fresh checkout`

**Validation evidence:**

- RED: `npm run test -- tests/unit/clean-tree-export-policy.test.ts` failed for missing clean-tree export policy tooling.
- GREEN: `npm run test -- tests/unit/clean-tree-export-policy.test.ts` passed: 1 file, 4 tests.
- `npm run export:clean-tree` exported the tracked public source tree to `release/clean-public-tree`.
- `npm run verify:clean-tree` passed from the clean export after initializing a throwaway Git index: dependency install, lint, full tests, release build checks, no-secrets, repo-shape, and release packaging all completed.
- The export policy rejects `.git`, generated assets, dotenv files, local-only manual-vault plugin assets, scratch archives, and release output.

#### 3.4.2.4 Public Repository Creation

- [D] Create a new public GitHub repo for the clean project, or create an orphan public branch only if a new repo is deliberately rejected.
- [D] Initialize the public repo from the clean tree with a single first commit such as `Initial public release candidate`.
- [D] Set public repo topics: `obsidian-plugin`, `speed-reading`, `rsvp`, `markdown`, `reading`, `typescript`.
- [D] Confirm public repo settings: Issues enabled, Dependabot enabled, private vulnerability reporting enabled when available, branch protection planned for `main`.
- [D] Confirm public repo description is concise and searchable without relying on the term `RSVP`.
- [D] [T] RED: add a public-repo-readiness checklist/policy that fails until repo URL, visibility decision, topics, description, issue settings, and security settings are documented.
- [D] [T] GREEN: document the public repo setup evidence.
- [D] [T] REFACTOR: keep public repo setup docs separate from Obsidian submission docs.

**Acceptance tests:**

- `public repo has a clean first commit and no private development history`
- `public repo metadata matches manifest/package positioning`
- `public repo is the repo referenced by README, package metadata, release notes, and future Obsidian submission metadata`
- `public repo settings support community issue intake and security reporting`

**Validation evidence:**

- RED: `npm run test -- tests/unit/public-repo-readiness-policy.test.ts` failed for missing readiness docs and stale package metadata.
- GREEN: `npm run test -- tests/unit/public-repo-readiness-policy.test.ts` passed: 1 file, 3 tests.
- `npm run verify:clean-tree` passed with the production-facing repository metadata and readiness docs included.
- Created private clean-staging repository, then renamed it to the production-facing repository: `MaverickHQ/obsidian-vault-reader`.
- Renamed the private working repository away from the production-facing repository name.
- Updated the main working copy `origin` to the private build-lab remote; exact private URL is intentionally not recorded in public-facing docs.
- Updated the clean export repo `origin` to `https://github.com/MaverickHQ/obsidian-vault-reader.git`.
- Pushed one root commit named `Initial public release candidate` from `release/clean-public-tree`.
- Verified repository visibility is private, default branch is `main`, description is concise, Issues are enabled, Wiki is disabled, and topics are set.
- Enabled dependency vulnerability alerts through GitHub.
- Branch protection remains a required final public-release switch because GitHub returned the expected private-repo/account-limit response.
- Private vulnerability reporting remains a required manual final public-release switch because the available API returned unavailable while the repo is private.

#### 3.4.2.5 Public Release Asset Dry Run

- [D] Build release assets from the clean public tree.
- [D] Verify GitHub Release tag will match `manifest.json` version exactly.
- [D] Verify release assets include `main.js`, `manifest.json`, `styles.css`, and checksum evidence.
- [D] Verify Obsidian install behavior expectations match the Obsidian release contract: repo `manifest.json` and `README.md` are public, release tag matches manifest version, and installable assets are attached to the release.
- [D] [T] RED: add release-submission policy tests before creating public release assets.
- [D] [T] GREEN: generate release assets from the clean public tree and pass the tests.
- [D] [T] REFACTOR: share release asset validation with Phase 3.5 submission checks.

**Acceptance tests:**

- `release tag equals manifest version`
- `release package includes installable Obsidian assets`
- `release package excludes tests, fixtures, source maps, dotenv files, private keys, and generated scratch`
- `clean-vault install from release assets passes smoke validation`

**Validation evidence:**

- RED: `npm run test -- tests/unit/release-submission-dry-run-policy.test.ts` failed for missing release-submission dry-run documentation.
- GREEN: `npm run test -- tests/unit/release-submission-dry-run-policy.test.ts` passed: 1 file, 3 tests.
- `npm run verify:clean-tree` passed with release-submission dry-run docs/tests included.
- From `release/clean-public-tree`, `npm ci` passed.
- From `release/clean-public-tree`, `npm run package:release` passed and generated `release/0.1.0`.
- From `release/clean-public-tree`, `npm run test:e2e:release` passed: 1 file, 1 test.
- Release package contains exactly `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- `manifest.json`, `package.json`, and `versions.json` version compatibility align with release tag `0.1.0`.
- Release package spot-check found no source maps, dotenv files, or private-key-like files.

#### 3.4.2.6 Phase Closeout Gate

- [D] Run `npm run format:check`.
- [D] Run `npm run lint`.
- [D] Run `npm run test`.
- [D] Run `npm run build:release`.
- [D] Run `npm run package:release`.
- [D] Run `npm run test:e2e:release`.
- [D] Run `npm audit --audit-level=high`.
- [D] Run `bash tests/no-secrets.sh`.
- [D] Run history-aware secret scan before public visibility is enabled.
- [D] Confirm the clean public repo is ready for Phase 3.5 submission packaging.
- [D] [T] Phase-level test gate: clean public repo preparation must be covered by policy tests plus manual evidence for GitHub visibility/settings.

**Closeout validation evidence required:**

- Private repo commit/push completed before export.
- Clean tree export file list reviewed.
- Public repo initialized with one clean first commit, or explicit exception documented.
- Public repo metadata/settings evidence recorded.
- Clean-tree validation commands passed.
- Secret/history scan evidence recorded.
- No Phase 3.5 Obsidian submission PR is opened until this gate passes.

**Closeout validation evidence:**

- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run test` passed: 64 files, 242 tests.
- `npm run build:release` passed, including no-secrets, repo-shape, release-artifact validation, build, and package checks.
- `npm run package:release` passed and generated `release/0.1.0`.
- `npm run test:e2e:release` passed: 1 file, 1 test.
- `npm audit --audit-level=high` passed with 0 vulnerabilities.
- `bash tests/no-secrets.sh` passed.
- High-confidence history-aware secret scan produced no matches.
- Release package contains exactly `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- Production-facing repository `MaverickHQ/obsidian-vault-reader` verified private, on `main`, with one root commit named `Initial public release candidate`.
- Production-facing repository topics verified: `markdown`, `obsidian-plugin`, `reading`, `rsvp`, `speed-reading`, `typescript`.
- Clean export remote verified as `https://github.com/MaverickHQ/obsidian-vault-reader.git`.
- Phase 3.4.2 clean public repository preparation is ready for Phase 3.5 submission packaging, except final public-visibility switches already documented: branch protection and private vulnerability reporting.

### 3.5 Obsidian Community Plugin Submission Package

- [D] Create or verify a GitHub Release whose tag exactly matches `manifest.json` version.
- [D] Attach `main.js`, `manifest.json`, and `styles.css` to the GitHub Release.
- [D] Verify `versions.json` includes the release version and correct `minAppVersion`.
- [D] Prepare the `obsidianmd/obsidian-releases` PR entry for `community-plugins.json`.
- [D] Use searchable listing copy that explains the product without relying on the term `RSVP`.
- [D] Verify a clean vault can install from the release package before submission.
- [D] Optionally run a short BRAT/public beta before submitting if manual QA finds uncertainty or if we want early social proof.
- [D] [T] RED: add failing release-submission policy tests for tag/version alignment, release assets, and community listing metadata.
- [D] [T] GREEN: generate the release package and submission metadata.
- [D] [T] REFACTOR: keep submission metadata in docs so future releases are repeatable.

**Suggested docs/scripts:**

- `docs/community-plugin-submission.md`
- `scripts/package-release.mjs`
- `scripts/release-candidate-validation.mjs`

**Suggested test files:**

- `tests/e2e/release-package-install.test.ts`
- `tests/unit/release-package-policy.test.ts`
- `tests/unit/community-submission-policy.test.ts`

**Acceptance tests:**

- `GitHub release tag matches manifest version exactly`
- `release assets include main.js, manifest.json, styles.css, and checksum evidence`
- `community plugin listing metadata includes id, name, author, description, and repo`
- `clean vault install passes command, reader, playback, settings, highlight, restart, and reload smoke tests`

**Validation evidence:**

- Current Obsidian release guidance reviewed from `obsidianmd/obsidian-releases`: plugin listing metadata is in `community-plugins.json`; Obsidian reads `manifest.json` and `README.md` from the plugin repo; install files are fetched from a GitHub Release tagged identically to `manifest.json`.
- `npm run test -- tests/unit/community-submission-policy.test.ts` passed: 1 file, 3 tests.
- `bash tests/repo-shape.sh` passed with `docs/community-plugin-submission.md` required.
- `npm run verify:clean-tree` passed with submission docs/tests included.
- From `release/clean-public-tree`, `npm ci` passed.
- From `release/clean-public-tree`, `npm run package:release` passed and generated `release/0.1.0`.
- From `release/clean-public-tree`, `npm run test:e2e:release` passed: 1 file, 1 test.
- Production-facing private repo `MaverickHQ/obsidian-vault-reader` refreshed with one clean root commit including submission docs/tests.
- Private GitHub Release created: `https://github.com/MaverickHQ/obsidian-vault-reader/releases/tag/0.1.0`.
- GitHub Release verified: tag `0.1.0`, title `Vault Reader 0.1.0`, not draft, not prerelease.
- Release assets verified: `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- Release tag `0.1.0` points to the current production-facing clean root commit.
- Community plugin listing entry prepared in `docs/community-plugin-submission.md`.
- BRAT/public beta remains optional and deferred unless manual QA finds risk.
- Process note: the community-submission policy test and doc were added in the same edit, so a separate failing RED run was not captured for that specific test; earlier release-submission dry-run policy captured RED for missing submission documentation.

**Still required before opening the Obsidian submission PR:**

- Production-facing repo visibility must be switched from private to public.
- Manual clean-vault Obsidian QA must pass from release assets.
- Branch protection and private vulnerability reporting must be revisited after public visibility is enabled.
- No `obsidianmd/obsidian-releases` PR has been opened yet.

**Closeout validation evidence required:**

- `npm run format:check`
- `npm run lint`
- `npm run test`
- `npm run test -- --coverage`
- `npm run build:release`
- `npm run package:release`
- `npm run test:e2e:release`
- `npm audit`
- `bash tests/no-secrets.sh`
- Manual clean-vault Obsidian QA completed and recorded
- Security/public-review checklist completed and recorded
- README/demo/promotion package reviewed
- GitHub release candidate created or dry-run documented

**Release gate for community submission:**

- [ ] Phase 3 tasks are complete and validated, or explicit deferrals are documented in `docs/roadmap.md`.
- [ ] No blocker/high security, deployment, operational, performance, or functional findings remain unresolved.
- [ ] The repo is ready to be made public before the Obsidian submission PR is opened.
- [ ] RSVP Nano export, BYOK AI, paid licensing, and device flashing remain deferred to backlog.

## Backlog Phase A: RSVP Nano Export (Deferred)

**Goal:** Prove that notes can move from Obsidian to the real device without custom firmware work.

**Milestone:** Backlog A - Exported artifacts open on the flashed device through the established RSVP Nano workflow.

### A.1 Upstream Format Research

- [ ] Inspect the current RSVP Nano file and folder expectations.
- [ ] Record the active compatibility assumptions in the design doc or ADRs.
- [ ] Capture one or more known-good sample artifacts if possible.
- [ ] Turn those artifacts into regression fixtures.
- [T] Write compatibility assertions before building a serializer.

**Suggested test files:**

- `tests/fixtures/rsvp-compatibility.fixture.test.ts`

### A.2 Export Domain Model

- [ ] Define an export request shape with source, target type, and destination.
- [ ] Define how filenames are generated and sanitized.
- [ ] Distinguish `book` vs `article` output cleanly.
- [ ] Represent target layout validation errors explicitly.
- [T] Test the export request API as a public contract.

**Suggested test files:**

- `tests/unit/export-request.test.ts`
- `tests/unit/file-name-policy.test.ts`

### A.3 Serializer

- [ ] Implement serialization from normalized text to RSVP Nano-compatible output.
- [ ] Ensure deterministic line endings and encoding.
- [ ] Ensure serializer output remains stable across equivalent inputs.
- [ ] Add regression fixtures for representative notes.
- [T] Start with snapshot or fixture comparisons.

**Suggested test files:**

- `tests/unit/rsvp-serializer.test.ts`
- `tests/fixtures/rsvp-serializer-regression.test.ts`

### A.4 Target Writing

- [ ] Implement export to a user-chosen local folder.
- [ ] Implement export into the RSVP Nano library layout.
- [ ] Validate missing directories and report corrective actions.
- [ ] Avoid partial writes where possible.
- [T] Test path resolution and write behavior separately from UI.

**Suggested test files:**

- `tests/unit/target-writer.test.ts`
- `tests/integration/export-to-layout.test.ts`

### A.5 Export UX

- [ ] Add command palette actions for export.
- [ ] Let the user choose `book` or `article`.
- [ ] Show destination and resulting path.
- [ ] Report success with enough detail for manual device testing.
- [ ] Report failures with a next-step message.
- [T] Verify command behavior through integration tests.

**Suggested test files:**

- `tests/integration/export-command.test.ts`
- `tests/unit/export-feedback.test.ts`

### A.6 Manual Device Validation

- [ ] Flash the Waveshare board with current RSVP Nano firmware.
- [ ] Prepare a clean FAT32 SD card with the required folder layout.
- [ ] Export fixture notes as both book and article samples.
- [ ] Copy files onto the card and confirm they open on-device.
- [ ] Record validation notes and any compatibility gaps.
- [T] Convert successful manual validations into fixture baselines where possible.

**Manual validation checklist:**

- reader recognizes exported file
- file appears in expected library section
- file opens without manual repair
- long notes behave acceptably

## Backlog Phase B: BYOK AI Optional Layer (Deferred)

**Goal:** Add tasteful AI helpers without changing the identity of the project.

**Milestone:** Backlog B - AI is useful, optional, and clearly isolated from the core plugin.

### B.1 Provider Settings

- [ ] Create a provider abstraction.
- [ ] Add settings for provider type and credentials.
- [ ] Keep secrets local to the user environment.
- [ ] Disable AI commands when provider configuration is incomplete.
- [T] Test provider selection and validation without network calls.

**Suggested test files:**

- `tests/unit/ai-provider-settings.test.ts`
- `tests/unit/ai-provider-registry.test.ts`

### B.2 Summarize Command

- [ ] Implement summarize-active-note behavior.
- [ ] Run the command against normalized text, not raw Markdown.
- [ ] Show a preview before the result is used elsewhere.
- [ ] Allow discard with no side effects.
- [T] Mock the provider through the public adapter.

**Suggested test files:**

- `tests/unit/ai-summarize-command.test.ts`
- `tests/integration/ai-preview-flow.test.ts`

### B.3 Rewrite For Reading Command

- [ ] Implement rewrite-for-RSVP behavior.
- [ ] Preserve a clear boundary between source note and generated output.
- [ ] Allow the generated text to be read immediately without saving it to the vault.
- [ ] Allow export of generated text only after user confirmation.
- [T] Use fixtures to verify prompt-output handling and preview flow.

**Suggested test files:**

- `tests/unit/ai-rewrite-command.test.ts`
- `tests/fixtures/ai-preview-regression.test.ts`

### B.4 Failure Handling

- [ ] Handle provider errors gracefully.
- [ ] Handle rate-limit or auth failures with useful feedback.
- [ ] Ensure the reader and export paths still work when AI is broken or disabled.
- [T] Write negative-path tests early.

**Suggested test files:**

- `tests/unit/ai-error-handling.test.ts`

## Backlog Phase C: Legacy Hardening And Release (Superseded By Phase 3)

**Goal:** Preserve the original hardening/release checklist as historical backlog while Phase 3 becomes the active community-release path.

**Milestone:** Backlog C - Historical public beta/release checklist preserved for reference.

### C.1 Performance And Accessibility

- [ ] Validate reading loop responsiveness on long notes.
- [ ] Validate keyboard-only control path.
- [ ] Check visual contrast and focus states.
- [ ] Remove obvious UI jitter or timing drift.
- [T] Add measurable checks where practical and manual gates where needed.

**Suggested test files:**

- `tests/integration/accessibility-smoke.test.ts`
- `tests/unit/performance-guard.test.ts`

### C.2 Release Packaging

- [ ] Create release build output that produces `main.js`, `manifest.json`, and optional `styles.css`.
- [ ] Add `versions.json`.
- [ ] Validate manifest versioning.
- [ ] Validate that release assets match manifest version.
- [T] Add CI checks around packaging consistency.

**Suggested test files:**

- `tests/unit/release-assets.test.ts`
- `tests/unit/versions-map.test.ts`

### C.3 README And Demo

- [ ] Rewrite README around the actual product.
- [ ] Add screenshots or a demo GIF/video.
- [ ] Document local Obsidian testing steps.
- [ ] Document device validation steps using RSVP Nano.
- [ ] Document what AI does and does not do.
- [T] Treat docs as part of release quality, not an afterthought.

### C.4 Community Plugin Readiness

- [ ] Confirm root repo files meet Obsidian submission expectations.
- [ ] Prepare initial GitHub release.
- [ ] Validate install flow in a clean Obsidian vault.
- [ ] Prepare a BRAT beta if desired before directory submission.
- [ ] Submit the plugin when the quality bar is met.

**Release checklist:**

- root `README.md`
- root `LICENSE`
- root `manifest.json`
- GitHub release with required assets
- manual install verified in clean vault

## Exit Criteria

### Community Plugin Release Exit

All of the following must be true:

- reader loop feels good in real Obsidian use
- clean-vault install works from release package assets
- security/public-review checklist is complete
- README, release notes, and launch materials explain the product clearly
- docs explain local validation clearly
- repo shape supports public review

### Device Backlog Exit

All of the following must be true before device work leaves backlog:

- export works on the real RSVP Nano device workflow
- device workflow does not compromise the Obsidian-only core release
- upstream RSVP Nano compatibility assumptions are documented
- manual hardware validation has repeatable fixture evidence

### AI Release Exit

All of the following must be true:

- AI remains optional
- no backend is required
- preview and discard paths are solid
- failures never block the non-AI workflow
