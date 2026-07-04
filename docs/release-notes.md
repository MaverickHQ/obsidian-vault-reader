# Release Notes

## 0.1.2 - 2026-07-04

### Automated Review Release And Source Compliance

Focused speed reading for notes, local-first, with optional in-note follow-along highlight.

- Removed unsupported `SHA256SUMS` sidecar files from the release package so GitHub Releases contain only `main.js`, `manifest.json`, and `styles.css`.
- Added a tag-based GitHub release workflow that verifies the release, publishes supported assets, and creates artifact attestations for release provenance.
- Removed leaf detachment from plugin unload to preserve user pane placement across plugin reloads.
- Shortened command IDs to Obsidian-style plugin-local identifiers while keeping user-facing command names unchanged.
- Replaced direct reviewed style and heading patterns with Obsidian-compatible APIs.
- Added explicit CodeMirror runtime dependencies for source-highlight extension imports.

### Release And Install Contract

- `manifest.json`, `package.json`, and `versions.json` must agree on version `0.1.2`.
- The GitHub release tag must match `manifest.json` exactly.
- The release package must include only `main.js`, `manifest.json`, and `styles.css`; provenance is supplied by GitHub artifact attestations.

## 0.1.1 - 2026-07-04

### Automated Review Metadata Fix

Focused speed reading for notes, local-first, with optional in-note follow-along highlight.

- Removed the redundant word `Obsidian` from the plugin manifest/package description because the Community Plugins directory implies the Obsidian context and rejects descriptions containing that word.
- Kept the product promise unchanged: a focused local-first speed reader for notes with optional in-note follow-along highlight.
- Published a matching GitHub release tag and installable release assets for `0.1.1`.

### Release And Install Contract

- `manifest.json`, `package.json`, and `versions.json` must agree on version `0.1.1`.
- The GitHub release tag must match `manifest.json` exactly.
- The release package must include `main.js`, `manifest.json`, `styles.css`, and checksum evidence.

## 0.1.0 - 2026-06-14

### Community Plugin Release Contract

Focused speed reading for Obsidian notes, local-first, with optional in-note follow-along highlight.

### Included Scope

- Split-right reader panel that opens beside the active note.
- Framed reader shell with play, pause, stop, restart, WPM, ORP, text-size, and panel-zoom controls.
- Blue and Claude-style orange accent themes.
- Optional source-mode in-note follow-along highlight with yellow, orange, and blue highlight colors.
- Per-note reading progress and startup-safe settings recovery.
- Local release packaging and clean-vault install validation for Obsidian community plugin submission.

### Deferred Scope

- RSVP Nano export, device writing, device flashing, and hardware validation are deferred to backlog.
- BYOK AI, provider settings, summarization, and rewrite workflows are deferred until the local reader has adoption signals.
- Paid licensing, account systems, hosted backends, cloud sync, and telemetry are not part of this release.

### Privacy And Security Contract

- Vault Reader is local-first and stores settings and reading progress through Obsidian plugin data.
- The plugin makes no network requests, starts no backend, sends no telemetry, and requires no account.
- Note content is read only when the user starts a reader session from the active note.

### Release And Install Contract

- Desktop-only: mobile support is not part of this release because the first public version depends on desktop Obsidian/editor validation.
- `manifest.json`, `package.json`, and `versions.json` must agree on version `0.1.0`.
- The GitHub release tag must match `manifest.json` exactly.
- The release package must include `main.js`, `manifest.json`, `styles.css`, and checksum evidence.
