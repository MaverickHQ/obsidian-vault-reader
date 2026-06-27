# Public History Review

## Release Decision

Default decision: publish from a new public repo with one clean initial commit.

Do not make the private working repository public.

Current private remote is not the public Obsidian submission source.

This keeps the public project focused on the polished community plugin state rather than private build-lab history. The private repository remains useful for development evidence, iteration notes, and internal recovery, but it is not the safest or clearest artifact for public review.

## Required Gates

### Tracked-file secret scan

Before a public export is created, run the tracked-file secret scan against the current tree. The scan must pass, or every finding must be removed before release.

### History-aware secret scan

Before any existing repository history is made public, run a history-aware secret scan. If the project follows the default clean-repo path, this scan is still useful as a private safety check, but the public repository must not inherit the private history.

## History Context Review

Review repository history for sensitive or unnecessary public context before deciding to expose it. The review must include tokens, local filesystem paths, paid strategy, debugging logs, copied or copyrighted content, abandoned device or AI implementation details, and private repo or branch names.

The expected outcome is a clean public repository unless a written exception explains why exposing history is safer and more valuable than publishing a clean first commit.

## Public Documentation Rule

Public-facing documentation must not record private source commit identifiers, local machine paths, personal tokens, private remotes, or build-lab notes. Keep private provenance in private release notes only.
