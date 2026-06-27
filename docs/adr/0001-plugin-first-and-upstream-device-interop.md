# ADR 0001: Plugin-First Scope And Upstream Device Interoperability

## Status

Accepted

## Date

2026-05-22

## Context

The archived project scope attempted to define a plugin, a backend, a custom hardware path, a marketing site, subscriptions, and a bespoke sync story at once. The implementation surface was far larger than the actual proof needed for a strong first release or a strong GitHub portfolio project.

At the same time, the user already owns a compatible Waveshare ESP32-S3 Touch LCD 3.49 board and there is an existing upstream project, RSVP Nano, that already provides a working firmware and device workflow.

## Decision

We will:

- make the Obsidian plugin the product,
- treat RSVP Nano compatibility as a first-class feature,
- defer custom firmware work until there is a proven need,
- keep BYOK AI optional and local-user-controlled,
- and avoid introducing a backend, subscription model, or custom sync protocol in the core release.

## Consequences

### Positive

- The first public release becomes realistic.
- The repo can be shaped for Obsidian community plugin publication.
- Device support becomes demonstrable early without firmware ownership.
- The portfolio story becomes sharper and more believable.

### Negative

- Some previously imagined product breadth is intentionally removed.
- The project now depends on understanding and tracking upstream RSVP Nano behavior.
- Device innovation is postponed in favor of compatibility and shipping discipline.

## Follow-Up

- Flatten the repo toward a publishable plugin-first layout.
- Build fixture-based compatibility checks around successful RSVP Nano exports.
- Revisit firmware work only after the plugin-export loop is proven and released.
