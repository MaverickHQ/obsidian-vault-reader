# Roadmap

## Purpose

This file tracks meaningful future work that is deliberately out of scope for the active core release.

## Near-Term After Core Release

### Active Priority: Community Plugin Release

- Make Vault Reader public-review-ready for the Obsidian Community Plugin directory before adding device or AI scope.
- Treat README/demo polish, settings discoverability, accessibility, security review, clean release packaging, and promotion prep as the active next phase.
- Keep the first public release local-first: no backend, no telemetry, no account system, no BYOK provider, and no device flashing workflow.
- Use GitHub Releases as the distribution source for the Obsidian submission path, with the release tag matching `manifest.json`.

### Phase 2 Non-Goals (Scope Guard)

- Do not move device writing, flashing, or firmware workflow into Phase 2.
- Keep Phase 2 focused on exceptional Obsidian-native reading UX and reliability.
- Defer any payment infrastructure implementation until Phase 2 validation is complete.

### Better Device Workflows

- Backlog until after the Obsidian Community Plugin release is accepted or deliberately paused.
- Assist users with copying exports to the correct RSVP Nano folders.
- Explore safer local sync helpers that reuse upstream workflows.
- Add richer validation around mounted SD card targets.

### BYOK AI Expansion

- Backlog until the free local-first reader has adoption signals and a clear user-requested AI workflow.
- Add provider-specific quality tuning.
- Add glossary and key-term extraction.
- Add "rewrite dense notes into readable prose" presets.

## Medium-Term

### RSVP Nano Upstream Contributions

- Contribute compatibility improvements upstream instead of maintaining a private firmware fork.
- Investigate whether any export or metadata conventions should be stabilized jointly with upstream.
- Document verified best practices for the Waveshare ESP32-S3 Touch LCD 3.49 workflow.

### Better Note Selection Workflows

- Export multiple chosen notes in one pass.
- Support folder-based export batches.
- Support queue-based reading sessions inside Obsidian.

## Long-Term

### Firmware-Adjacent Work

- Only consider custom firmware work if a clear plugin limitation cannot be solved via interop.
- Prefer upstream collaboration over an immediate fork.
- Do not design new Bluetooth or backend sync protocols without first proving a real user need.

### Optional Product Extensions

- Reading playlists
- Progressive reading review flows
- Deeper vault-native study workflows
- Mobile-adjacent ideas, only after desktop value is proven
