# Requirements

## Document Info

- Status: Active
- Depth: Level 400
- Scope: Obsidian-first RSVP plugin with RSVP Nano interoperability
- Last Updated: 2026-05-22

## 1. Product Intent

The project exists to make Obsidian notes easier to consume by turning them into a polished RSVP reading experience and by making those notes easy to carry onto an existing RSVP Nano device workflow.

The product should feel opinionated, fast, and practical:

- Open a note and start reading quickly.
- Preserve the user's existing Obsidian workflow.
- Export in a way that works with the device the user already owns.
- Keep AI optional, local-user-controlled, and clearly subordinate to the main reading loop.

## 2. Problem Statement

Obsidian users create large quantities of notes, but many of those notes are hard to revisit in a focused way. Traditional reading inside the editor encourages scanning, distraction, and context switching. Device workflows are possible today through RSVP Nano, but they require separate manual steps and are not integrated into note-taking.

This project solves that by:

- providing RSVP reading directly in Obsidian,
- normalizing note content into a reading-friendly form,
- exporting notes into a device-compatible format,
- and optionally applying AI-assisted cleanup or summaries when the user opts in.

## 3. Target Users

### Primary User

- Heavy Obsidian users who want to review notes, drafts, research, or articles at speed.

### Secondary User

- Users who already own or plan to use an RSVP Nano-compatible device and want a smoother handoff from note vault to device library.

### Tertiary User

- Power users who want to experiment with BYOK AI transforms without surrendering their notes to a required cloud backend.

## 4. Product Scope

### 4.1 Must-Have Scope for Core Release

| ID | Requirement | Priority |
|----|-------------|----------|
| R1 | The plugin must start an RSVP session from the active note. | Must |
| R2 | The plugin must support reading from the current editor selection when available. | Must |
| R3 | The plugin must normalize Markdown into stable reading text without breaking plain prose. | Must |
| R4 | The reader must support play, pause, resume, stop, and speed adjustment. | Must |
| R5 | The reader must render a visible ORP focus point and allow it to be disabled. | Must |
| R6 | The plugin must persist reading position and user settings locally. | Must |
| R7 | The plugin must export reading content into a device-compatible file format used by RSVP Nano. | Must |
| R8 | The plugin must support writing exports into the RSVP Nano SD card library layout. | Must |
| R9 | The plugin must remain fully usable with no account and no backend. | Must |
| R10 | The plugin must document a repeatable workflow for validating exports on the device. | Must |

### 4.2 Should-Have Scope for First Public Release

| ID | Requirement | Priority |
|----|-------------|----------|
| R11 | The plugin should offer a dedicated reader view rather than only modal-based playback. | Should |
| R12 | The plugin should offer keyboard-first controls suitable for long reading sessions. | Should |
| R13 | The plugin should ship with fixtures that demonstrate note-to-device compatibility. | Should |
| R14 | The repo should be shaped so it can be published as an Obsidian community plugin without major restructuring. | Should |
| R15 | The plugin should provide a simple command for exporting the active note as a book or article target. | Should |

### 4.3 Optional Scope

| ID | Requirement | Priority |
|----|-------------|----------|
| R16 | The plugin may offer BYOK AI summarization for the active note. | Optional |
| R17 | The plugin may offer BYOK AI rewrite helpers to make rough notes more RSVP-friendly. | Optional |
| R18 | The plugin may offer a preview-and-accept flow so AI changes are never applied invisibly. | Optional |

## 5. Explicit Non-Goals

The following are out of scope for the core release:

- Custom firmware for the device
- A new wireless sync protocol
- Bluetooth transport design
- Subscription billing
- Hosted backend services
- Cloud sync
- Reading analytics dashboards
- Smart recommendations
- Marketing site work
- Hardware commerce and fulfillment

## 6. Functional Requirements

### 6.1 Reading Workflow

- The user can launch RSVP reading from the command palette.
- The user can launch RSVP reading from an active note without exporting first.
- The reader uses normalized text generated from Markdown source.
- The user can adjust WPM during playback and see immediate effect.
- The user can stop and later resume reading from the last saved position.

### 6.2 Export Workflow

- The user can export the active note.
- The user can export the current selection as a standalone reading artifact when a selection exists.
- The user can choose whether the export is intended for `books` or `articles`.
- The export path can target a local folder or a mounted SD card.
- The plugin validates the target layout and tells the user what is missing.

### 6.3 BYOK AI Workflow

- AI features are disabled by default.
- The user must provide their own provider and credentials.
- AI actions never overwrite source notes automatically.
- AI output is previewed before it becomes reading input or an export source.
- AI failures degrade gracefully and never block the non-AI reading path.

## 7. Non-Functional Requirements

### 7.1 Quality

- The codebase must support a TDD workflow where behaviors are tested through public interfaces.
- The project must ship with deterministic fixtures for tokenization and export compatibility.
- The design must favor a small number of clear modules over a broad feature surface.

### 7.2 Performance

- The plugin should open a reader session from a typical note fast enough to feel immediate.
- The normalization and export pipeline should comfortably handle long notes without freezing the UI.
- The reader timing loop should remain stable across speed changes.

### 7.3 Usability

- The reading experience must be usable with keyboard controls alone.
- Error messages must tell the user what action to take next.
- Device export language should match the RSVP Nano mental model, not invent a second vocabulary.

### 7.4 Portability

- The plugin must run on desktop Obsidian.
- The repo and release flow should be compatible with Obsidian community plugin distribution.
- The device validation flow must work with the existing Waveshare ESP32-S3 Touch LCD 3.49 board running RSVP Nano firmware.

## 8. Acceptance Criteria

| ID | Criteria |
|----|----------|
| AC1 | A user can open an Obsidian note and start RSVP reading from a command without leaving Obsidian. |
| AC2 | The reader supports play, pause, resume, stop, and WPM changes during a session. |
| AC3 | Markdown normalization preserves readable prose while removing distracting formatting artifacts. |
| AC4 | Reading position persists locally and resumes correctly for a note. |
| AC5 | The plugin exports a device-compatible file that RSVP Nano can open from SD card. |
| AC6 | The plugin writes files into the correct library layout for books and articles. |
| AC7 | Export validation catches missing folders or bad target paths with clear feedback. |
| AC8 | The project can be tested locally inside desktop Obsidian using a documented development loop. |
| AC9 | The project can be validated against a real device using a documented flash and copy workflow. |
| AC10 | The repo includes a release path that matches Obsidian community plugin expectations. |
| AC11 | BYOK AI, if enabled, is visibly optional and never required for core use. |
| AC12 | All phase-complete tasks have matching tests or an explicit manual validation note. |

## 9. Release Strategy

### 9.1 Core Release

The first public release should include:

- in-app RSVP reading,
- settings and resume state,
- RSVP Nano-compatible export,
- SD card workflow validation,
- release packaging for Obsidian.

### 9.2 Optional Follow-Up Release

The first optional enhancement release may add:

- BYOK AI summarization,
- BYOK rewrite-for-reading assistance,
- export from AI-generated reading text with preview controls.

## 10. Constraints

| Constraint | Value |
|------------|-------|
| Desktop app target | Obsidian desktop |
| Distribution target | Obsidian community plugin-compatible |
| Backend requirement | None for core release |
| Device strategy | Interoperate with existing RSVP Nano workflow |
| Device board | Waveshare ESP32-S3 Touch LCD 3.49 |
| Firmware ownership | Upstream RSVP Nano for v1 |

## 11. Success Criteria

The project is successful when:

- it is obviously smaller and more real than the archived version,
- it can be demonstrated end-to-end in a short local video,
- a user can move from note to device file without custom firmware work,
- and the README tells a believable story that a reviewer can validate quickly.
