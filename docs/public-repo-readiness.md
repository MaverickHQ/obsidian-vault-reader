# Public Repository Readiness

## Repository Decision

Production-facing repository: https://github.com/MaverickHQ/obsidian-vault-reader

Visibility: private until final public-release approval.

History strategy: one clean initial commit from release/clean-public-tree.

Current build-lab repository: https://github.com/MaverickHQ/obsidian-vault-reader-build-lab

Current build-lab repository remains private.

The production-facing repository is the review candidate for future public visibility and Obsidian Community Plugin submission. The private build-lab repository remains the internal working history and should not be made public.

## Repository Metadata

Description: Focused speed reading for Obsidian notes.

Topics: obsidian-plugin, speed-reading, rsvp, markdown, reading, typescript

Support metadata in `package.json` must point at the production-facing repository so the exported public tree does not advertise the private build-lab repository.

## Local Git Remotes

- Main working copy remote: `origin` points to `https://github.com/MaverickHQ/obsidian-vault-reader-build-lab.git`.
- Clean export remote: `release/clean-public-tree` `origin` points to `https://github.com/MaverickHQ/obsidian-vault-reader.git`.

This separation is intentional. Development work continues in the build-lab repository. The production-facing repository receives regenerated clean-tree pushes only.

## Repository Settings

- Issues enabled
- Dependabot enabled
- Private vulnerability reporting enabled when available
- Branch protection planned for main
- Wiki disabled

Branch protection may require public visibility or account-level GitHub features. If unavailable while private, record the limitation and enable it before Obsidian Community Plugin submission.

## Setup Evidence

- Private production-facing repository created from the former clean-staging repository.
- Build-lab repository renamed to `MaverickHQ/obsidian-vault-reader-build-lab`.
- Production-facing repository renamed to `MaverickHQ/obsidian-vault-reader`.
- Visibility verified as private.
- Default branch verified as `main`.
- Description verified as `Focused speed reading for Obsidian notes.`
- Issues verified as enabled.
- Wiki verified as disabled.
- Topics verified: `markdown`, `obsidian-plugin`, `reading`, `rsvp`, `speed-reading`, `typescript`.
- Dependency vulnerability alerts were enabled through GitHub.
- Dependabot configuration is present in `.github/dependabot.yml`.
- Branch protection is pending because GitHub requires either public visibility or an account feature upgrade for this repository state.
- Private vulnerability reporting could not be enabled through the available API while the repository is private; verify this manually before final public submission.
- Initial history shape verified as a single root commit named `Initial public release candidate`.

## Release Gate

Before visibility changes from private to public:

- Run `npm run verify:clean-tree`.
- Confirm the production-facing repository has one clean initial commit and no private development history.
- Confirm README, package metadata, release notes, and future Obsidian submission metadata point at the production-facing repository.
- Confirm issue intake and security reporting settings are ready for community users.
