# Security Policy

Vault Reader is currently pre-1.0 and local-first. The plugin does not use a hosted backend, and current functionality is designed to run inside the user's Obsidian vault.

The current public-review security contract is documented in [`docs/security-review.md`](docs/security-review.md).

## Supported Versions

The `main` branch is the supported development line until public release versioning is established.

## Reporting Security Issues

For non-sensitive bugs, use GitHub Issues. For potential vulnerabilities, secret exposure, or privacy-impacting behavior, avoid posting sensitive details publicly. Use GitHub private vulnerability reporting if it is enabled for the repository, or contact the maintainer through the MaverickHQ GitHub profile.

## Security Expectations

- No API keys, tokens, credentials, or private vault content should be committed to the repository.
- The current release should make no network requests, use no backend, send no telemetry, and store no credentials.
- Note-derived content should be rendered through text-safe DOM APIs such as `textContent`.
- Optional future BYOK or device-export features must remain explicit opt-in behavior.
- Local plugin settings and reading progress should remain local to Obsidian unless a future design document explicitly changes that model.
