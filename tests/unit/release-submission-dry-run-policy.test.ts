import fs from "node:fs";
import path from "node:path";
import manifest from "../../manifest.json";
import packageJson from "../../package.json";
import versions from "../../versions.json";
import { releaseAssetNames } from "../../scripts/release-package-policy.mjs";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("release submission dry-run policy", () => {
  it("documents the clean-tree source and exact GitHub Release tag contract", () => {
    const dryRun = readText("docs/release-submission-dry-run.md");

    expect(dryRun).toContain("# Release Submission Dry Run");
    expect(dryRun).toContain("Dry-run source: release/clean-public-tree");
    expect(dryRun).toContain(`GitHub Release tag: ${manifest.version}`);
    expect(dryRun).toContain("The release tag must match manifest.json exactly.");
    expect(packageJson.version).toBe(manifest.version);
    expect(versions[manifest.version as keyof typeof versions]).toBe(manifest.minAppVersion);
  });

  it("documents installable Obsidian assets and excluded public-release artifacts", () => {
    const dryRun = readText("docs/release-submission-dry-run.md");

    expect(dryRun).toContain(`Required assets: ${releaseAssetNames.join(", ")}`);
    expect(dryRun).toContain("Artifact attestations: main.js, manifest.json, styles.css");

    for (const excluded of [
      "tests",
      "fixtures",
      "source maps",
      "dotenv files",
      "private keys",
      "generated scratch output",
    ]) {
      expect(dryRun).toContain(excluded);
    }
  });

  it("links the dry run to clean-vault install smoke validation", () => {
    const dryRun = readText("docs/release-submission-dry-run.md");

    expect(dryRun).toContain("npm run package:release");
    expect(dryRun).toContain("npm run test:e2e:release");
    expect(dryRun).toContain("GitHub release workflow");
    expect(dryRun).toContain("clean-vault install smoke validation");
    expect(dryRun).toContain(".obsidian/plugins/vault-reader");
  });
});
