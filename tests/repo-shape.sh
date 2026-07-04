#!/usr/bin/env bash
set -euo pipefail

required_paths=(
  ".github/workflows/ci.yml"
  ".github/workflows/release.yml"
  ".gitignore"
  ".prettierignore"
  ".prettierrc.json"
  "CONTRIBUTING.md"
  "README.md"
  "LICENSE"
  "SECURITY.md"
  "manifest.json"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "vitest.config.ts"
  "eslint.config.mjs"
  "versions.json"
  "CONTEXT.md"
  "docs/requirements.md"
  "docs/design.md"
  "docs/PROJECT_STRUCTURE.md"
  "docs/tasks.md"
  "docs/community-plugin-submission.md"
  "docs/release-notes.md"
  "docs/release-submission-dry-run.md"
  "docs/public-history-review.md"
  "docs/public-repo-readiness.md"
  "docs/adr/0001-plugin-first-and-upstream-device-interop.md"
  "docs/adr/0002-community-plugin-first-release.md"
  "docs/archive/pre-community-release/README.md"
  "docs/archive/pre-community-release/requirements-2026-05-22.md"
  "docs/archive/pre-community-release/design-2026-05-22.md"
  "docs/archive/pre-community-release/paid-readiness-baseline-2026-06.md"
  "docs/archive/pre-community-release/phase-2-qa-checklist-2026-06.md"
  "docs/archive/pre-community-release/export-layout.fixture.test.ts.md"
  "docs/archive/pre-community-release/export-layout/article.json"
  "docs/archive/pre-community-release/export-layout/book.json"
  "scripts/deploy-local-vault.mjs"
  "scripts/dev-local-vault.mjs"
  "scripts/clean-tree-policy.mjs"
  "scripts/export-clean-tree.mjs"
  "scripts/verify-clean-tree.mjs"
  "src/main.ts"
  "tests/no-secrets.sh"
  "tests/repo-shape.sh"
  "tests/release-artifacts.sh"
)

required_ignore_patterns=(
  ".git-broken-backup-*"
  "release/"
)

for pattern in "${required_ignore_patterns[@]}"; do
  if ! grep -Fxq "$pattern" .gitignore; then
    echo "Missing required .gitignore pattern: $pattern" >&2
    exit 1
  fi
done

for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "Missing required path: $path" >&2
    exit 1
  fi
done

tracked_files="$(
  git ls-files | while IFS= read -r file; do
    if [[ -e "$file" ]]; then
      printf '%s\n' "$file"
    fi
  done
)"
forbidden_tracked_patterns=(
  '^\.DS_Store$'
  '^\.env'
  '^\.git-broken-backup-'
  '^build/'
  '^coverage/'
  '^dist/'
  '^docs/paid-readiness-baseline\.md$'
  '^docs/phase-2-qa-checklist\.md$'
  '^fixtures/archive/'
  '^fixtures/expected/export-layout/'
  '^fixtures/manual-test-vault/\.obsidian/plugins/vault-reader/(main\.js|manifest\.json|styles\.css)$'
  '^main\.js$'
  '^node_modules/'
  '^release/'
  '^tests/fixtures/export-layout\.fixture\.test\.ts$'
)

for pattern in "${forbidden_tracked_patterns[@]}"; do
  if printf '%s\n' "$tracked_files" | grep -Eq "$pattern"; then
    echo "Forbidden tracked repo artifact matches pattern: $pattern" >&2
    printf '%s\n' "$tracked_files" | grep -E "$pattern" >&2
    exit 1
  fi
done

echo "Repo shape check passed."
