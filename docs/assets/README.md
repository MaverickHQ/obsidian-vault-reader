# Demo Assets

This folder contains public launch screenshots, GIFs, or video stills for Vault Reader.

Capture source: `fixtures/manual-test-vault`

Capture assets from the same Obsidian vault used for local QA so README, QA, and launch copy all show the same tested experience.

The Obsidian Community automated review is in progress or recently completed when launch assets are prepared, and these assets can be updated independently because they do not alter installable release assets.

Do not use private notes, customer/client material, personal journal content, or copied proprietary material in public screenshots, GIFs, videos, or stills.

Do not use copyrighted book text in public demo assets.

No private notes, personal data, client material, or copyrighted book text may appear in public launch assets.

## Current Assets

- `vault-reader-demo.gif`: README/social demo GIF, 900x511, 10 fps, 18.8 seconds, approximately 571 KB.

## Required Demo Flow

Capture a concise happy path:

1. Open `fixtures/manual-test-vault/10-Prose.md`.
2. Run `Vault Reader: Start reading current note`.
3. Show the reader panel with the first-run hint.
4. Press play/pause.
5. Adjust WPM or panel zoom.
6. Enable note highlight and switch highlight colour.
7. Run `Vault Reader: Restart current note from beginning`.
8. Show that the source note remains visible beside the reader.

Recommended captures:

- `docs/assets/vault-reader-main-panel.png`
- `docs/assets/vault-reader-highlight.png`
- `docs/assets/vault-reader-review-ready.png`

If the final GIF or video is too large for the repository, attach it as GitHub Release media and keep this folder limited to optimized screenshots.

## Manual Capture Gate

- Obsidian is opened to `fixtures/manual-test-vault`.
- `10-Prose.md` is the visible note for primary screenshots.
- Highlight screenshots use only curated fixture prose.
- GIF/video does not show private desktop content, browser tabs, local paths, tokens, or unrelated apps.
- Captured assets are reviewed before commit or release attachment.
