# Launch Plan

## Purpose

Launch Vault Reader as a focused, local-first Obsidian speed reader before expanding into RSVP Nano device workflows or BYOK AI.

The launch story should be simple: open a note in Obsidian, run Vault Reader, read in a focused side panel, optionally follow along in the note, and keep all content local.

## Tester Install Flow

Use the same Obsidian vault we use for testing:

1. Run `npm ci`.
2. Run `npm run build:local`.
3. Open `fixtures/manual-test-vault` in Obsidian.
4. Enable `Vault Reader` in `Settings -> Community plugins`.
5. Open `10-Prose.md`.
6. Run `Vault Reader: Start reading current note`.
7. Validate play, pause, restart, WPM, zoom, accent, note highlight, and `Read current note`.

For external testers before directory approval, use a GitHub release package and ask them to install the assets into `.obsidian/plugins/vault-reader`.

## Demo Asset Plan

Status: automated review is in progress. Demo capture can proceed now because screenshots and GIF/video do not alter installable release assets.

Required happy-path capture:

- Open `fixtures/manual-test-vault`.
- Open `10-Prose.md`.
- Run `Vault Reader: Start reading current note`.
- Show the reader opening beside the note.
- Click `Play`, `Pause`, and `Restart`.
- Adjust WPM, text size, and panel zoom.
- Toggle note highlight and cycle yellow, orange, and blue.
- Open a second note and show `Read current note` instead of silent source switching.

Recommended assets:

- `docs/assets/vault-reader-main-panel.png`
- `docs/assets/vault-reader-highlight.png`
- `docs/assets/vault-reader-review-ready.png`
- short GIF or video for the happy path, attached as GitHub Release media if binary size is not suitable for the repo.

GitHub Release media is the approved fallback location for a large GIF or video. Keep optimized screenshots in `docs/assets/` whenever possible.

Short GIF/video story:

1. Start from `10-Prose.md`.
2. Open Vault Reader beside the note.
3. Press play, pause, and restart.
4. Toggle in-note highlight.
5. Adjust one control such as WPM or panel zoom.

## Launch Copy

### Obsidian Forum

I’m building Vault Reader, a local-first speed reader for Obsidian notes.

It opens a focused reader panel beside your current note, supports WPM controls, ORP focus mode, restart, text sizing, panel zoom, blue/orange accents, and optional in-note follow-along highlighting.

The beta/test flow uses the same Obsidian vault we use for development: `fixtures/manual-test-vault`. The plugin makes no network requests, uses no backend, requires no account, and sends no telemetry.

I’m looking for feedback on the reader feel, source-mode highlighting, keyboard/control clarity, and install experience.

### Obsidian Discord

Vault Reader beta: a local-first speed reader inside Obsidian. It opens beside your note, has WPM/zoom/restart controls, optional in-note highlighting, and no telemetry/network/backend. Test flow uses `fixtures/manual-test-vault`; feedback welcome on reader feel and install clarity.

### Reddit

I made Vault Reader, a local-first speed reader for Obsidian notes. It keeps your note visible, opens a reader panel beside it, supports WPM/zoom/restart controls, and can optionally highlight the current word in source mode.

It is intentionally small for the first release: no backend, no telemetry, no account, no BYOK AI, and no device workflow yet. The test setup uses `fixtures/manual-test-vault`, the same vault used during development.

### GitHub Release

Vault Reader `0.1.3` is the current community-plugin review candidate.

Included:

- focused reader panel for the active note
- play, pause, stop, restart, WPM, ORP, text size, and panel zoom controls
- blue and Claude-style orange accent themes
- optional source-mode in-note highlight
- local settings and per-note progress
- release package with only `main.js`, `manifest.json`, and `styles.css`
- GitHub artifact attestations for release provenance

Deferred as future exploration: RSVP Nano export, BYOK AI, mobile support, and follow-scroll.

## Feedback Loop

Use GitHub Issues for public feedback.

Labels:

- `bug`
- `enhancement`
- `accessibility`
- `install`
- `highlighting`
- `reader-feel`
- `docs`
- `backlog-device`
- `backlog-ai`

Most useful feedback:

- Obsidian version and operating system.
- Plugin version or release tag.
- Whether the test used `fixtures/manual-test-vault` or another vault.
- Note shape: prose, headings, lists, links, code blocks, frontmatter, long note, or repeated words.
- Expected behavior, actual behavior, and reproducible steps.

## Success Metrics Without Telemetry

Vault Reader should not add telemetry to measure launch success.

Use external/public signals:

- GitHub stars.
- GitHub release downloads.
- Obsidian Community Plugin downloads after approval.
- Issues opened and closed.
- Forum, Discord, and Reddit qualitative feedback.
- Repeat comments about reader feel, install friction, or highlight reliability.

## GitHub Topics

Recommended topics:

- `obsidian-plugin`
- `obsidian`
- `speed-reading`
- `rsvp`
- `markdown`
- `reading`
- `typescript`
- `local-first`

## Roadmap Boundaries

Keep the launch message focused on the Obsidian reader.

RSVP Nano and BYOK AI are future exploration items. They should appear as roadmap possibilities, not launch promises.
