# Vault Reader for Obsidian

Focused speed reading for Obsidian notes, local-first, with optional in-note follow-along highlight.

Vault Reader turns the note you are already reading into a calm side-panel reader. It keeps your note open, lets you control pace and focus, and avoids accounts, telemetry, backend services, or network calls.

## Why Use It

- Read long notes without leaving Obsidian.
- Keep the source note visible while the reader runs beside it.
- Adjust WPM, text size, panel zoom, accent color, and ORP focus mode in the reader.
- Restart from the beginning or continue from saved per-note progress.
- Optionally highlight the current word in source mode with yellow, orange, or blue follow-along highlight.

## Who It Is For

Vault Reader is for people who keep research notes, essays, meeting notes, study material, or drafts in Obsidian and want a focused reading mode without sending note content anywhere.

It is especially useful when you want to review dense notes at a steady pace while keeping the original Markdown nearby.

## Install For Testing

Before Obsidian Community Plugin approval, use the included manual test vault:

1. Install dependencies:
   `npm ci`
2. Build and deploy into the test vault:
   `npm run build:local`
3. Open this vault in Obsidian:
   `fixtures/manual-test-vault`
4. Enable `Vault Reader` in `Settings -> Community plugins`.
5. Open a test note such as `10-Prose.md`.
6. Run `Vault Reader: Start reading current note` from the command palette.

For a different local vault, set:

`VAULT_READER_PLUGIN_DIR="/absolute/path/to/.obsidian/plugins/vault-reader" npm run build:local`

## Install After Community Approval

After approval, install from Obsidian Community Plugins:

1. Open `Settings -> Community plugins`.
2. Browse for `Vault Reader`.
3. Install and enable the plugin.
4. Open any Markdown note and run `Vault Reader: Start reading current note`.

Until then, tester installs should use the release package or `fixtures/manual-test-vault`.

## How To Use

1. Open a Markdown note.
2. Run `Vault Reader: Start reading current note`.
3. Use `Play`, `Pause`, `Stop`, and `Restart`.
4. Adjust WPM with the buttons, number input, or `ArrowUp` / `ArrowDown`.
5. Press `Space` while the reader panel is focused to play or pause.
6. Toggle ORP, accent, text size, panel zoom, note highlight, and highlight color from the reader controls.

If you open a different note while the reader is still loaded, Vault Reader keeps the existing session and shows a `Read current note` action. This avoids silently losing your place.

## Demo

The public demo package is planned and documented in [docs/assets/README.md](docs/assets/README.md). Capture it from `fixtures/manual-test-vault` so the README, QA flow, and launch copy all show the same tested experience.

The demo flow should show: open note, run `Vault Reader: Start reading current note`, play/pause, adjust WPM or zoom, enable in-note highlight, and run `Vault Reader: Restart current note from beginning`.

## In-Note Highlighting

In-note highlighting is opt-in from the reader controls via `Note Highlight On/Off`.

Current behavior:

- Source mode is supported when Obsidian exposes the active editor view and exact token offsets can be mapped.
- Highlight colors cycle between yellow, orange, and blue.
- Preview mode or unsupported editor states fall back to panel-only reading and keep playback running.
- Follow-scroll is intentionally not enabled yet, so playback does not force editor scroll/reflow on every token.

## Privacy And Security

Vault Reader does not collect telemetry, does not make network requests, does not require an account, and does not use a hosted backend.

The plugin stores settings and reading progress locally through Obsidian plugin data. It reads the active note only when you run the reader command or explicitly click `Read current note`.

See [SECURITY.md](SECURITY.md) and [security-review.md](docs/security-review.md) for the public-review security contract.

## Known Limitations

- Desktop-only for the first release.
- In-note highlight requires source-mode editor access and may fall back to panel-only reading.
- Follow-scroll is not part of the first release.
- Selected-text reading is not a launch feature.
- Mobile support is not validated yet.

## Roadmap

The first community release is focused on an excellent Obsidian-native reader.

future exploration:

- RSVP Nano export and device workflows.
- BYOK AI reading helpers.
- Reading queues or playlist-style flows.
- Optional follow-scroll behavior after performance validation.

RSVP Nano and BYOK AI are roadmap items, not current release functionality.

## Local Build + Deploy Pipeline

- Deploy into the local manual test vault plugin folder:
  `npm run deploy:local`
- Build then deploy in one step:
  `npm run build:local`
- Watch mode with auto-deploy after each successful rebuild:
  `npm run dev:local`

## Project Docs

- [CONTEXT.md](CONTEXT.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [requirements.md](docs/requirements.md)
- [design.md](docs/design.md)
- [tasks.md](docs/tasks.md)
- [roadmap.md](docs/roadmap.md)
- [community-plugin-qa.md](docs/community-plugin-qa.md)
- [launch-plan.md](docs/launch-plan.md)
- [public-history-review.md](docs/public-history-review.md)
- [public-repo-readiness.md](docs/public-repo-readiness.md)
- [release-notes.md](docs/release-notes.md)
- [ADR 0001](docs/adr/0001-plugin-first-and-upstream-device-interop.md)
