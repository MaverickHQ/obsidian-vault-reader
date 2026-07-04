# Release Submission Dry Run

## Release Contract

Dry-run source: release/clean-public-tree

GitHub Release tag: 0.1.2

The release tag must match manifest.json exactly.

The tag, `manifest.json` version, `package.json` version, and `versions.json` compatibility entry must agree before any GitHub Release is created or submitted to the Obsidian Community Plugin directory.

## Installable Assets

Required assets: main.js, manifest.json, styles.css

Artifact attestations: main.js, manifest.json, styles.css

The GitHub Release must attach only the installable plugin assets. The GitHub release workflow must create provenance attestations for each asset. The release package must exclude tests, fixtures, checksum sidecars, source maps, dotenv files, private keys, generated scratch output, source files, local vault state, and unrelated project documentation.

## Dry-Run Commands

Run these commands from `release/clean-public-tree` after the clean export has been regenerated:

```sh
npm ci
npm run package:release
npm run test:e2e:release
```

`npm run package:release` builds the release package under `release/0.1.2`.

`npm run test:e2e:release` performs clean-vault install smoke validation and verifies the package can be installed into `.obsidian/plugins/vault-reader`. The GitHub release workflow performs the same release verification before publishing release assets and attestations.

## Evidence To Record

- Release directory contains only `main.js`, `manifest.json`, and `styles.css`.
- GitHub artifact attestations are available for `main.js`, `manifest.json`, and `styles.css` after the tag workflow completes.
- `manifest.json` and `styles.css` in the release directory match the source files.
- The packaged `main.js` is generated and not tracked in Git.
- Clean-vault install smoke validation passes.
- No GitHub Release is created during this dry run.

## Latest Dry-Run Evidence

- Source: `release/clean-public-tree`
- Version: `0.1.2`
- Commands passed: `npm ci`, `npm run package:release`, `npm run test:e2e:release`
- Release directory verified: `release/0.1.2`
- Files verified: `main.js`, `manifest.json`, `styles.css`
- Version alignment verified: `manifest.json`, `package.json`, and `versions.json`
- Exclusion spot-check passed for source maps, dotenv files, and private-key-like files in the release directory
