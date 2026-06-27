#!/usr/bin/env bash
set -euo pipefail

release_artifacts=(
  main.js
  manifest.json
  styles.css
)

if git ls-files --error-unmatch main.js >/dev/null 2>&1; then
  echo "main.js must not be tracked. Generate it for GitHub releases instead." >&2
  git diff --name-only -- "${release_artifacts[@]}"
  exit 1
fi

release_version="$(node -p "require('./manifest.json').version")"
release_dir="release/${release_version}"

npm run package:release

for artifact in "${release_artifacts[@]}"; do
  if [[ ! -s "${release_dir}/${artifact}" ]]; then
    echo "Missing or empty release artifact: ${release_dir}/${artifact}" >&2
    exit 1
  fi
done

if [[ ! -s "${release_dir}/SHA256SUMS" ]]; then
  echo "Missing or empty release checksum file: ${release_dir}/SHA256SUMS" >&2
  exit 1
fi

cmp --silent manifest.json "${release_dir}/manifest.json"
cmp --silent styles.css "${release_dir}/styles.css"

echo "Release artifacts packaged in ${release_dir}."
