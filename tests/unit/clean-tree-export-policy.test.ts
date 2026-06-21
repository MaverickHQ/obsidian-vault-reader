import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import {
  cleanTreeRequiredEntries,
  cleanTreeValidationCommand,
  cleanTreeForbiddenPathPatterns,
  validateCleanTreeEntries,
} from "../../scripts/clean-tree-policy.mjs";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("clean tree export policy", () => {
  it("provides npm scripts for exporting and validating a clean public tree", () => {
    expect(packageJson.scripts["export:clean-tree"]).toBe("node scripts/export-clean-tree.mjs");
    expect(packageJson.scripts["verify:clean-tree"]).toContain("export:clean-tree");
    expect(packageJson.scripts["verify:clean-tree"]).toContain(cleanTreeValidationCommand);
    expect(fs.readFileSync(path.join(root, "scripts/verify-clean-tree.mjs"), "utf8")).toContain(
      '"verify"',
    );
  });

  it("requires public project files needed for review and release", () => {
    expect(cleanTreeRequiredEntries).toEqual(
      expect.arrayContaining([
        ".github/workflows/ci.yml",
        "README.md",
        "LICENSE",
        "SECURITY.md",
        "CONTRIBUTING.md",
        "manifest.json",
        "versions.json",
        "package.json",
        "package-lock.json",
        "src/main.ts",
        "scripts/verify-clean-tree.mjs",
        "tests/repo-shape.sh",
        "fixtures/manual-test-vault/README.md",
        "docs/public-history-review.md",
      ]),
    );

    for (const entry of cleanTreeRequiredEntries) {
      expect(fs.existsSync(path.join(root, entry))).toBe(true);
    }
  });

  it("rejects generated, ignored, local-only, and private-history artifacts", () => {
    const forbiddenEntries = [
      ".git/config",
      "node_modules/obsidian/index.js",
      "coverage/index.html",
      "release/0.1.0/main.js",
      "main.js",
      ".DS_Store",
      ".env.local",
      "fixtures/manual-test-vault/.obsidian/plugins/vault-reader/main.js",
      "fixtures/archive/scratch.md",
    ];

    expect(cleanTreeForbiddenPathPatterns.length).toBeGreaterThan(0);
    expect(() => validateCleanTreeEntries(forbiddenEntries)).toThrow(
      "Clean export contains forbidden path",
    );
  });

  it("accepts a minimal public source tree shape", () => {
    expect(() => validateCleanTreeEntries(cleanTreeRequiredEntries)).not.toThrow();
  });
});
