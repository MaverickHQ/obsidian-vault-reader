# Phase 2 QA Checklist

## Scope

Manual validation checklist for the Phase 2 exceptional-core upgrades:

- split-right presentation mode
- framed reader shell UI
- accent theme toggle (blue + Claude orange)
- persistence and reload behavior

## Local Setup

1. `npm run build`
2. Copy plugin artifacts (`manifest.json`, `main.js`, `styles.css`) into the local test vault plugin folder.
3. Reload Obsidian and ensure `Vault Reader` is enabled.

## Functional Checks

- [ ] `Vault Reader: Start reading current note` opens a reader panel to the right of the active note on first launch.
- [ ] Running `Vault Reader: Start reading current note` again reuses the existing reader panel (no duplicate reader panes).
- [ ] Reader shell displays framed header/body/controls layout.
- [ ] Play/pause/stop controls remain functional.
- [ ] Keyboard shortcuts remain functional (`Space`, `Esc`, `ArrowUp`, `ArrowDown`).

## Theme Checks

- [ ] Accent button is visible in reader controls.
- [ ] Toggling accent changes focus color to Claude orange.
- [ ] Toggling accent again returns to blue.
- [ ] ORP focus highlight uses active accent color.

## Persistence Checks

- [ ] Change accent and WPM, close/reload Obsidian, and confirm settings restore correctly.
- [ ] Reading position resumes per source as before (no regression).
- [ ] Existing older data (without new keys) loads with safe defaults for mode/theme.

## Regression Gates

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run test -- --coverage`
- [ ] `npm run build`
- [ ] `bash tests/no-secrets.sh`
