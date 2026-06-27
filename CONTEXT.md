# Context

## Purpose

This file defines the shared language for the project. It is the first place to check before naming features, writing requirements, or splitting work into tasks.

## Product Sentence

This project is an Obsidian plugin that provides focused speed reading for local Markdown notes inside Obsidian, with strong reader controls, local settings, and optional in-note follow-along highlight.

## Scope Anchors

- The product is the Obsidian community plugin.
- The first public release is local-first and must remain useful with no account and no internet connection.
- RSVP Nano export is deferred until after the community plugin release.
- BYOK AI is deferred until there is a clear user-requested workflow and privacy model.
- Paid licensing, telemetry, cloud sync, and backend services are not part of the active release.
- The active release must be understandable from README, requirements, design, QA docs, and release notes without reading archived history.

## Canonical Terms

| Term | Meaning |
|------|---------|
| **Active Note** | The Obsidian file currently open in the editor. |
| **Reading Source** | The active note content selected for reading. |
| **Reading Text** | The normalized plain-text representation used by the RSVP engine. |
| **RSVP Session** | A single reading run with timing, position, and settings state. |
| **ORP** | Optimal Recognition Point. The visual focus character for a displayed token. |
| **Reader View** | The in-plugin UI that renders the RSVP session. |
| **Source Highlight** | The optional in-note decoration that follows playback when exact note mapping is available. |
| **Fixture** | A stable sample note, normalized output, release package case, or manual QA vault artifact used for tests and regression checks. |
| **Deferred Scope** | Valid future work that is intentionally not part of the first community release. |
| **Archive** | Historical planning or deferred implementation material preserved for context but not treated as active release scope. |

## Decision Rules

When two ideas compete, prefer the option that:

1. Improves the in-Obsidian reading experience.
2. Keeps the first public release local-first, safe, and reviewable.
3. Avoids introducing a backend, account system, telemetry, payment, AI provider, or hardware workflow before adoption signals justify it.
4. Can be explained clearly in the README and demonstrated in a short video.
5. Produces stable public interfaces that are easy to test through TDD.

## Explicit Non-Language

Avoid these terms unless they are deliberately reintroduced in a later phase:

- Platform
- Ecosystem
- Subscription tier
- Cloud sync
- Hardware SKU
- Proprietary protocol
- AI assistant
- Device sync

These words pull the project back toward the oversized scope we intentionally retired.
