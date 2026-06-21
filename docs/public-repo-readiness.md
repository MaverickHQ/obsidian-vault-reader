# Public Repository Readiness

## Repository Decision

Staging repository: https://github.com/MaverickHQ/obsidian-vault-reader-clean-public

Visibility: private until final public-release approval.

History strategy: one clean initial commit from release/clean-public-tree.

Current build-lab repository remains private.

The clean-staging repository is the review candidate for future public visibility and Obsidian Community Plugin submission. The private build-lab repository remains the internal working history and should not be made public.

## Repository Metadata

Description: Focused speed reading for Obsidian notes.

Topics: obsidian-plugin, speed-reading, rsvp, markdown, reading, typescript

Support metadata in `package.json` must point at the clean-staging repository so the exported public tree does not advertise the private build-lab repository.

## Repository Settings

- Issues enabled
- Dependabot enabled
- Private vulnerability reporting enabled when available
- Branch protection planned for main
- Wiki disabled

Branch protection may require public visibility or account-level GitHub features. If unavailable while private, record the limitation and enable it before Obsidian Community Plugin submission.

## Release Gate

Before visibility changes from private to public:

- Run `npm run verify:clean-tree`.
- Confirm the clean-staging repository has one clean initial commit and no private development history.
- Confirm README, package metadata, release notes, and future Obsidian submission metadata point at the clean-staging or final public repository.
- Confirm issue intake and security reporting settings are ready for community users.
