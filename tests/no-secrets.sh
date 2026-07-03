#!/usr/bin/env bash
set -euo pipefail

# Search tracked files for high-confidence credential signatures.
# This intentionally avoids generic words like "token" to reduce noise.
pattern='(ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN (RSA|OPENSSH|EC|DSA|PRIVATE) KEY-----)'

matches="$(
  git ls-files -z | while IFS= read -r -d '' file; do
    if [[ -f "$file" ]]; then
      rg -n --no-heading --color never -e "$pattern" "$file" || true
    fi
  done
)"

if [[ -n "$matches" ]]; then
  echo "Potential secrets detected in tracked files:" >&2
  echo "$matches" >&2
  exit 1
fi

echo "No high-confidence secret signatures found in tracked files."
