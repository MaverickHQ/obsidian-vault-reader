# Requirements

## Document Info

- Status: Active
- Depth: Level 400
- Scope: Community Plugin Release Scope
- Last Updated: 2026-06-15

## 1. Product Intent

Vault Reader is an Obsidian community plugin that helps people read their own notes with a focused speed-reading panel and optional in-note follow-along highlight. The first public release must feel useful, safe, and understandable without requiring hardware, AI, payments, accounts, telemetry, or a backend.

The product promise for the first community release is:

> Focused speed reading for notes, local-first, with optional in-note follow-along highlight.

## 2. Problem Statement

Obsidian users often collect more notes than they revisit. Standard note reading can encourage scanning and distraction, especially for long prose, research notes, drafts, or study material. Vault Reader gives users a calmer reading mode inside the vault they already use.

The plugin solves this release problem by:

- starting from the active Markdown note,
- normalizing Markdown into readable text,
- showing one focused token at a time with ORP support,
- keeping controls visible in an Obsidian-native side panel,
- optionally highlighting the current word in the source note when exact mapping is available,
- persisting local settings and reading position.

## 3. Target Users

| User                         | Need                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Heavy Obsidian reader        | Revisit long notes, drafts, research, or saved articles with less visual noise.      |
| Keyboard-first Obsidian user | Start, pause, resume, adjust speed, and restart without leaving the editor workflow. |
| Privacy-sensitive note taker | Use the plugin without sending notes to a network service or creating an account.    |
| Community plugin reviewer    | Validate quickly that the repo is focused, safe, buildable, and packaged correctly.  |

## 4. Active Release Scope

### 4.1 Must-Have Requirements

| ID  | Requirement                                                                                    | Priority |
| --- | ---------------------------------------------------------------------------------------------- | -------- |
| R1  | The plugin starts a reader session from the active Markdown note.                              | Must     |
| R2  | The reader opens in an Obsidian side panel and remains usable while the note is visible.       | Must     |
| R3  | Markdown is normalized into stable reading text without mutating the source note.              | Must     |
| R4  | Playback supports play, pause, resume, stop, restart from beginning, and speed adjustment.     | Must     |
| R5  | The reader renders ORP focus styling and allows users to disable it.                           | Must     |
| R6  | User settings and per-note reading position persist locally in Obsidian plugin data.           | Must     |
| R7  | Optional in-note highlight follows playback when the active note can be matched exactly.       | Must     |
| R8  | Unsupported highlight contexts fall back to panel-only reading without breaking playback.      | Must     |
| R9  | No account, backend, telemetry, or network request is required for any active release feature. | Must     |
| R10 | The repo can build, test, package, and install using a documented local Obsidian workflow.     | Must     |

### 4.2 Should-Have Requirements

| ID  | Requirement                                                                                                                | Priority |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| R11 | The README explains the value without relying on the term RSVP.                                                            | Should   |
| R12 | The UI supports clear visual controls for WPM, text size, panel zoom, accent colour, highlight colour, and restart.        | Should   |
| R13 | The project includes deterministic fixtures for normalization, reader behavior, release packaging, and manual Obsidian QA. | Should   |
| R14 | Release documentation includes manual install, local QA, security stance, known limitations, and promotion copy.           | Should   |
| R15 | The repo shape is enforced so generated assets, local vault scratch files, secrets, and release outputs stay out of Git.   | Should   |

## 5. Deferred Scope

These items are deliberately outside the first community release. They remain valid backlog exploration areas but must not be presented as launch functionality.

| Deferred Item            | Reason                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| RSVP Nano export         | Hardware and SD-card validation would expand scope and delay the community plugin release.                      |
| Device flashing workflow | Firmware/device support needs a separate compatibility phase and real hardware QA.                              |
| BYOK AI                  | AI introduces provider setup, privacy copy, key handling, and quality risk that should not block core adoption. |
| Paid licensing           | Payment infrastructure is not required to prove community value and would complicate Obsidian submission.       |
| Cloud sync or telemetry  | The first release is intentionally local-first and trust-building.                                              |
| Mobile support           | The current release targets desktop Obsidian only until mobile behavior is explicitly tested.                   |
| Selected-text command    | Selection-only reading remains backlog until the Obsidian editor-selection lifecycle is reliable.               |

## 6. Functional Requirements

### 6.1 Reader Session

- The user can run `Vault Reader: Start reading current note` from the command palette.
- The plugin resolves the active Markdown note and shows an actionable notice if no note is open.
- The reader panel displays note title, current token, progress, WPM, playback controls, restart, ORP toggle, accent control, text size, panel zoom, note highlight toggle, and highlight colour.
- The reader responds to visible controls and supported keyboard shortcuts without requiring a page reload.
- The reader updates when the active note changes, so playback does not silently continue from a hidden note.

### 6.2 Normalization

- Markdown formatting is flattened into readable text.
- Links preserve readable labels rather than raw URL syntax.
- Headings, lists, code blocks, frontmatter, repeated words, and long prose behave deterministically.
- Source notes are never modified by normalization or playback.

### 6.3 Highlighting

- In-note highlight is optional.
- Exact highlight mapping is attempted only against the active editable note.
- If highlight mapping fails, the reader continues in panel-only mode and gives the user clear feedback.
- Highlight colour is user-selectable from the supported set.

### 6.4 Settings And Persistence

- Settings persist through Obsidian reloads.
- Per-note progress is saved locally.
- Restart from beginning resets the current session position without altering the note.
- The plugin does not store secrets, tokens, account credentials, or remote service configuration.

## 7. Non-Functional Requirements

### 7.1 Security And Privacy

- Runtime source must not use `fetch`, `XMLHttpRequest`, `WebSocket`, remote script loading, analytics, or telemetry.
- Note-derived text must render through safe DOM text APIs.
- Notices should avoid stack traces, absolute local paths, or sensitive internals.
- Release packages must include only Obsidian plugin assets required for installation.

### 7.2 Performance

- Opening a reader session from a typical note should feel immediate.
- Playback timing should stay stable across speed changes.
- Long notes should not freeze the Obsidian UI during normal use.

### 7.3 Quality

- Development follows behavior-first TDD.
- Active release scope is protected by policy tests.
- Manual Obsidian QA is documented for flows that cannot yet be automated.
- Historical or deferred work is archived instead of left active.

## 8. Acceptance Criteria

| ID  | Criteria                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | A clean clone can install dependencies, run tests, build, package, and validate release artifacts.                                                 |
| AC2 | A tester can install the plugin into the manual test vault and start reading a fixture note.                                                       |
| AC3 | Playback controls, WPM, ORP, text size, panel zoom, accent, highlight toggle, highlight colour, and restart work in Obsidian.                      |
| AC4 | Reloading Obsidian preserves settings and recovers safely.                                                                                         |
| AC5 | Opening a different active note updates the reader source before playback continues.                                                               |
| AC6 | Unsupported contexts produce helpful notices rather than broken or stale playback.                                                                 |
| AC7 | Security policy tests verify no runtime network calls, no unsafe note rendering, and sanitized user-facing errors.                                 |
| AC8 | Repository-shape checks prevent generated assets, local scratch files, release output, secrets, and old active-scope artifacts from being tracked. |
| AC9 | README, release notes, community QA, launch plan, requirements, and design all describe the same release scope.                                    |

## 9. Success Criteria

The first public release is successful when:

- Obsidian users can understand and try the plugin in under five minutes,
- reviewers can see a focused local-first product rather than a hardware/AI platform pitch,
- the repo looks professional enough for public review,
- manual QA evidence covers the real Obsidian workflow,
- future device and AI ideas are credible because they are deferred, not half-shipped.
