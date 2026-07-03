# Obsidian Community Plugin Submission

## Submission State

This document prepares the submission package for Vault Reader. It does not open the `obsidianmd/obsidian-releases` PR yet.

Repository visibility must be public before the PR is opened.

Manual clean-vault Obsidian QA must pass before submission.

No `obsidianmd/obsidian-releases` PR is opened during this phase.

BRAT/public beta is optional and deferred unless manual QA finds risk.

## Current Obsidian Pull Contract

Source references:

- `https://github.com/obsidianmd/obsidian-releases`
- `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json`

Community plugin listing metadata lives in `community-plugins.json`.

Obsidian uses `name`, `author`, and `description` for search. Obsidian reads `manifest.json` and `README.md` from the plugin repository detail page. Installable files are fetched from GitHub Releases tagged identically to the version inside `manifest.json`.

## Community Plugin Entry

```json
{
  "id": "vault-reader",
  "name": "Vault Reader",
  "author": "MaverickHQ",
  "description": "Focused speed reading for Obsidian notes with in-note highlighting.",
  "repo": "MaverickHQ/obsidian-vault-reader"
}
```

## Release Package

Release tag: 0.1.0

Assets: main.js, manifest.json, styles.css

Checksum evidence: SHA256SUMS

The release tag must match `manifest.json` exactly. `manifest.json`, `package.json`, and `versions.json` must agree on `0.1.0`, and `versions.json` must map `0.1.0` to the release `minAppVersion`.

## Pre-Submission Gates

- Production-facing repository is `MaverickHQ/obsidian-vault-reader`.
- Repository remains private until final approval to switch visibility.
- GitHub Release `0.1.0` can be created while private.
- Release package must contain `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- Manual clean-vault Obsidian QA must verify command palette launch, reader panel, playback, settings, in-note highlight, restart, note switching, reload behavior, and install from release assets.
- Branch protection and private vulnerability reporting must be revisited after public visibility is enabled.
