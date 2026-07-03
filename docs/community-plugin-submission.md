# Obsidian Community Plugin Submission

## Submission State

This document records the submission package for Vault Reader. It does not open the `obsidianmd/obsidian-releases` PR yet.

Repository visibility is public.

Manual clean-vault Obsidian QA passed from release assets.

Branch protection is enabled on `main`.

Private vulnerability reporting is enabled.

No `obsidianmd/obsidian-releases` PR is opened during this phase.

BRAT/public beta is optional and deferred unless manual QA finds risk.

Screenshot or GIF capture is recommended before broader promotion and can be added before or shortly after the Obsidian submission PR. It is not required for the Obsidian release metadata PR.

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
  "description": "Focused speed reading for Obsidian notes with in-note highlighting. - This plugin has not been manually reviewed by Obsidian staff.",
  "repo": "MaverickHQ/obsidian-vault-reader"
}
```

The repository `manifest.json` and README keep the shorter product description. The community listing entry above follows the current upstream convention observed in the latest `community-plugins.json` entries for newly listed plugins.

## Release Package

Release tag: 0.1.0

Assets: main.js, manifest.json, styles.css

Checksum evidence: SHA256SUMS

The release tag must match `manifest.json` exactly. `manifest.json`, `package.json`, and `versions.json` must agree on `0.1.0`, and `versions.json` must map `0.1.0` to the release `minAppVersion`.

## Pre-Submission Gates

- Production-facing repository is `MaverickHQ/obsidian-vault-reader`.
- Repository visibility is public.
- GitHub Release `0.1.0` is published.
- Release package must contain `main.js`, `manifest.json`, `styles.css`, and `SHA256SUMS`.
- Manual clean-vault Obsidian QA verified command palette launch, reader panel, playback, settings, in-note highlight, restart, note switching, reload behavior, and install from release assets.
- Branch protection requires the `quality` status check on `main`, blocks force-pushes and deletions, and enforces rules for admins.
- Private vulnerability reporting is enabled for sensitive security reports.

## Prepared Obsidian PR

Suggested PR title:

```text
Add Vault Reader community plugin
```

Suggested PR body:

```text
Adds Vault Reader to the Obsidian Community Plugin directory.

Repository: https://github.com/MaverickHQ/obsidian-vault-reader
Release: https://github.com/MaverickHQ/obsidian-vault-reader/releases/tag/0.1.0

Validation:
- Release tag matches manifest version 0.1.0.
- Release assets include main.js, manifest.json, and styles.css.
- Clean-vault release-asset QA passed.
- Plugin is desktop-only and local-first with no telemetry, backend, account system, or network calls.
```

Prepared upstream change:

- File: `community-plugins.json`
- Position: appended to the end of the current plugin list, matching recent community entries.
- Duplicate check: `vault-reader` ID and `MaverickHQ/obsidian-vault-reader` repo were not present in the current upstream list.
- Local patch prepared during release closeout at `/private/tmp/vault-reader-obsidian-releases.patch`.
