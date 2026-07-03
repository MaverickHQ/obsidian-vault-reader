export const defaultCleanTreeExportDir = "release/clean-public-tree";

export const cleanTreeValidationCommand = "node scripts/verify-clean-tree.mjs";

export const cleanTreeRequiredEntries = [
  ".github/workflows/ci.yml",
  ".gitignore",
  ".prettierignore",
  ".prettierrc.json",
  "CONTRIBUTING.md",
  "CONTEXT.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "docs/PROJECT_STRUCTURE.md",
  "docs/community-plugin-qa.md",
  "docs/design.md",
  "docs/launch-plan.md",
  "docs/process.md",
  "docs/public-history-review.md",
  "docs/release-notes.md",
  "docs/requirements.md",
  "docs/roadmap.md",
  "docs/tasks.md",
  "eslint.config.mjs",
  "fixtures/manual-test-vault/README.md",
  "manifest.json",
  "package-lock.json",
  "package.json",
  "scripts/export-clean-tree.mjs",
  "scripts/verify-clean-tree.mjs",
  "scripts/clean-tree-policy.mjs",
  "src/main.ts",
  "styles.css",
  "tests/no-secrets.sh",
  "tests/repo-shape.sh",
  "tests/release-artifacts.sh",
  "tsconfig.json",
  "versions.json",
  "vitest.config.ts",
];

export const cleanTreeForbiddenPathPatterns = [
  /^\.git(?:\/|$)/,
  /^\.DS_Store$/,
  /^\.env(?:\.|$)/,
  /^\.git-broken-backup-/,
  /^build(?:\/|$)/,
  /^coverage(?:\/|$)/,
  /^dist(?:\/|$)/,
  /^main\.js$/,
  /^node_modules(?:\/|$)/,
  /^release(?:\/|$)/,
  /^fixtures\/archive(?:\/|$)/,
  /^fixtures\/manual-test-vault\/\.obsidian\/plugins\/vault-reader\/(?:main\.js|manifest\.json|styles\.css)$/,
];

export function validateCleanTreeEntries(entries) {
  const normalizedEntries = entries.map((entry) => normalizeEntry(entry));
  for (const entry of normalizedEntries) {
    const forbiddenPattern = cleanTreeForbiddenPathPatterns.find((pattern) => pattern.test(entry));
    if (forbiddenPattern) {
      throw new Error(`Clean export contains forbidden path: ${entry}`);
    }
  }

  for (const requiredEntry of cleanTreeRequiredEntries) {
    if (!normalizedEntries.includes(requiredEntry)) {
      throw new Error(`Clean export missing required path: ${requiredEntry}`);
    }
  }
}

function normalizeEntry(entry) {
  return entry.replaceAll("\\", "/").replace(/^\.\/+/, "");
}
