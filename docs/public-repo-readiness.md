# Public Repository Readiness

## Repository Decision

Production-facing repository: https://github.com/MaverickHQ/obsidian-vault-reader

Visibility: public.

History strategy: one clean initial commit from release/clean-public-tree.

Current build-lab repository: private build-lab repository, exact remote intentionally not recorded in public-facing docs.

Current build-lab repository remains private.

The production-facing repository is the review candidate for future public visibility and Obsidian Community Plugin submission. The private build-lab repository remains the internal working history and should not be made public.

## Repository Metadata

Description: Focused speed reading for Obsidian notes with in-note highlighting.

Topics: obsidian-plugin, speed-reading, rsvp, markdown, reading, typescript

Support metadata in `package.json` must point at the production-facing repository so the exported public tree does not advertise the private build-lab repository.

## Local Git Remotes

- Main working copy remote: `origin` points to the private build-lab repository, not the production-facing repository.
- Clean export remote: `release/clean-public-tree` `origin` points to `https://github.com/MaverickHQ/obsidian-vault-reader.git`.

This separation is intentional. Development work continues in the build-lab repository. The production-facing repository receives regenerated clean-tree pushes only.

## Repository Settings

- Issues enabled
- Dependabot enabled
- Private vulnerability reporting enabled
- Branch protection enabled for main
- Wiki disabled

Branch protection requires the `quality` status check on `main`, requires branches to be up to date before merge, blocks force-pushes and branch deletion, and enforces rules for administrators.

## Setup Evidence

- Private production-facing repository created from the former clean-staging repository.
- Build-lab repository renamed away from the production-facing repository name.
- Production-facing repository renamed to `MaverickHQ/obsidian-vault-reader`.
- Visibility verified as public.
- Default branch verified as `main`.
- Description verified as `Focused speed reading for Obsidian notes with in-note highlighting.`
- Issues verified as enabled.
- Wiki verified as disabled.
- Topics verified: `markdown`, `obsidian-plugin`, `reading`, `rsvp`, `speed-reading`, `typescript`.
- Dependency vulnerability alerts were enabled through GitHub.
- Dependabot configuration is present in `.github/dependabot.yml`.
- Branch protection verified on `main` with required `quality` status check, strict status checks, admin enforcement, no force-pushes, and no branch deletion.
- Private vulnerability reporting verified as enabled.
- Initial history shape verified as a single root commit named `Initial public release candidate`.
- Public-facing docs intentionally avoid recording the private build-lab repository URL.

## Release Gate

Before the Obsidian Community Plugin submission PR is opened:

- Run `npm run verify:clean-tree`.
- Confirm the production-facing repository has one clean initial commit and no private development history.
- Confirm README, package metadata, release notes, and future Obsidian submission metadata point at the production-facing repository.
- Confirm issue intake and security reporting settings are ready for community users.
