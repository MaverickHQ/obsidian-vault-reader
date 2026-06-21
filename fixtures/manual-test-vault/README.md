# Manual Test Vault

This folder is a dedicated Obsidian vault for local plugin validation.

## Quick Start

1. Open Obsidian and choose "Open folder as vault".
2. Select `fixtures/manual-test-vault`.
3. In this repo, run `npm run dev` to rebuild on changes.
4. Copy or symlink plugin artifacts into:
   `fixtures/manual-test-vault/.obsidian/plugins/obsidian-vault-reader`
5. In Obsidian, disable Restricted mode and enable "Vault Reader".

## Test Notes

- `00-Test-Index.md`
- `10-Prose.md`
- `20-Headings.md`
- `30-Lists.md`
- `40-Links.md`
- `50-Code-Blocks.md`
- `60-Frontmatter.md`

## Manual Validation Goals

- Reader opens on active note.
- Reader handles headings, lists, links, code blocks, and frontmatter content.
- Export commands produce book and article outputs into expected paths.
