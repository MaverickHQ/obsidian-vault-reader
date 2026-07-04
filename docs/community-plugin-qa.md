# Community Plugin QA

## Purpose

This checklist is the manual release-candidate gate before Vault Reader is made public or submitted to the Obsidian Community Plugin directory.

Use this document to prove that the packaged plugin works from release assets, not only from the source tree or development watcher.

## Release Package Install Gate

- [ ] Run `npm run package:release`.
- [ ] Run `npm run test:e2e:release`.
- [ ] Confirm `release/0.1.3` contains only `main.js`, `manifest.json`, and `styles.css`.
- [ ] Confirm the GitHub Release workflow creates artifact attestations for `main.js`, `manifest.json`, and `styles.css`.
- [ ] Confirm generated release assets are not tracked by git.

## Clean Temporary Vault

- [ ] Create or reuse a clean temporary vault with no previous Vault Reader plugin data.
- [ ] Copy release package assets into `.obsidian/plugins/vault-reader`.
- [ ] Confirm the installed manifest ID is `vault-reader`.
- [ ] Enable Vault Reader from Obsidian settings.
- [ ] Run `Vault Reader: Start reading current note`.
- [ ] Confirm the reader opens without source-tree or watcher dependencies.

## Local Manual Test Vault

- [x] Run `npm run build:local`.
- [x] Open `fixtures/manual-test-vault` in Obsidian.
- [x] Confirm Vault Reader is enabled.
- [x] Run `Vault Reader: Start reading current note`.
- [x] Confirm the right split reader panel opens and reuses the existing panel on repeated launch.
- [x] If recording demo assets, use this same `fixtures/manual-test-vault` flow so screenshots and launch copy match the tested experience.

## Representative Notes

Validate the reader against notes that include:

- headings
- lists
- links
- code blocks
- frontmatter
- long prose
- repeated words
- empty or unsupported contexts

## Reader Flow Checks

- [x] start from a normal note.
- [x] play begins playback.
- [x] pause stops playback without losing position.
- [x] resume continues from the paused token.
- [x] stop clears active playback safely.
- [x] restart returns the current session to token `0`.
- [x] WPM changes update playback speed and persist.
- [x] ORP toggle changes focus-letter rendering.
- [x] accent switches between blue and Claude orange.
- [x] text size updates the word display and value readout.
- [x] panel zoom updates the panel and value readout without hiding controls.
- [x] note highlight can be enabled and disabled without breaking playback.
- [x] highlight colour cycles through yellow, orange, and blue.
- [x] reload Obsidian and confirm settings/progress recover.
- [x] disable and re-enable the plugin and confirm settings/progress recover.

## Fallback Checks

- [x] No active note shows one actionable notice.
- [x] Empty note shows one actionable notice.
- [x] Unsupported editor or preview contexts fall back to panel-only reading.
- [x] Note highlight failure keeps playback running.
- [x] Repeated failure does not spam duplicate notices.

## Platform QA Matrix

| Platform | Obsidian version | Plugin version | Install method               | Tester           | Date       | Result           |
| -------- | ---------------- | -------------- | ---------------------------- | ---------------- | ---------- | ---------------- |
| macOS    | Not recorded     | 0.1.0          | `fixtures/manual-test-vault` | User-confirmed   | 2026-06-21 | Pass             |
| macOS    | Not recorded     | 0.1.0          | GitHub Release assets        | User-confirmed   | 2026-07-03 | Pass             |
| macOS    | Pending          | 0.1.3          | GitHub Release assets        | Pending          | TBD        | Pending          |
| Windows  | Not yet verified | 0.1.0          | release package              | Community-needed | TBD        | Not yet verified |
| Linux    | Not yet verified | 0.1.0          | release package              | Community-needed | TBD        | Not yet verified |

## Known Limitations

- Desktop-only: mobile support is not part of the first community release.
- Preview mode: in-note highlight requires source-mode editor access and falls back to panel-only reading when exact mapping is unavailable.
- Follow-scroll: automatic source-note scrolling is intentionally not enabled for this release.
- RSVP Nano export: device export, device writing, flashing guidance, and hardware validation are deferred to backlog.
- BYOK AI: AI provider settings, summarization, and rewrite workflows are deferred until the local reader has adoption signals.

## QA Evidence Template

- Date:
- Obsidian version:
- Operating system:
- Plugin version:
- Release package path:
- Clean temporary vault result:
- `fixtures/manual-test-vault` result:
- Known limitations confirmed:
- Issues found:
- Release decision: `pass`, `pass-with-conditions`, or `hold`

## QA Evidence

- Date: 2026-06-21
- Obsidian version: Not recorded
- Operating system: macOS
- Plugin version: 0.1.0
- Release package path: local manual test vault deployment
- Clean temporary vault result: Not yet run
- `fixtures/manual-test-vault` result: pass
- Known limitations confirmed: Desktop-only release; preview-mode highlight fallback; follow-scroll deferred; RSVP Nano export deferred; BYOK AI deferred
- Issues found: None reported during manual pass
- Release decision: `pass-with-conditions`

- Date: 2026-07-03
- Obsidian version: Not recorded
- Operating system: macOS
- Plugin version: 0.1.0
- Release package path: local clean release-asset QA vault prepared from GitHub Release `0.1.0`
- Clean temporary vault result: pass
- `fixtures/manual-test-vault` result: previously passed
- Known limitations confirmed: Desktop-only release; preview-mode highlight fallback; follow-scroll deferred; RSVP Nano export deferred; BYOK AI deferred
- Issues found: None reported during release-asset QA pass
- Release decision: `pass`
