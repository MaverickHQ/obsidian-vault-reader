# ADR 0002: Community Plugin First Release

## Status

Accepted

## Date

2026-06-15

## Context

Vault Reader started with a broader vision that included Obsidian reading, RSVP Nano export, device workflows, BYOK AI, and possible paid-product readiness. The working product that has momentum today is the Obsidian plugin itself: a local-first speed reader with strong controls, settings, and optional in-note highlight.

Keeping device, AI, and monetization scope in the active release documents makes the project look larger and less finished than it is. It also creates avoidable risk for Obsidian community plugin review because reviewers need to understand exactly what ships.

## Decision

The first public release will focus only on the Obsidian community plugin.

Active release scope includes:

- active-note reading,
- Markdown normalization,
- reader panel playback,
- ORP display,
- WPM, text size, panel zoom, accent, highlight colour, and restart controls,
- local settings and progress persistence,
- optional in-note highlight with safe fallback,
- local build, package, release, and manual QA workflows.

Deferred scope includes:

- RSVP Nano export,
- device flashing,
- SD-card writing,
- BYOK AI,
- paid licensing,
- backend services,
- telemetry,
- mobile support,
- selected-text command.

## Consequences

- Active requirements and design stay smaller and easier to review.
- Historical documents move to `docs/archive/pre-community-release/`.
- Device and AI work remain outside the release promise unless reactivated through updated requirements, design, task, and TDD gates.
- Repo-shape and policy tests enforce the public release boundary.
- Future phases can reactivate deferred work only through updated requirements, design, ADR, task list, and TDD coverage.
