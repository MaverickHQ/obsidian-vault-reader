import fs from "node:fs";
import path from "node:path";
import manifest from "../../manifest.json";
import packageJson from "../../package.json";
import versions from "../../versions.json";
import {
  releaseAssetNames,
  releaseChecksumFileName,
} from "../../scripts/release-package-policy.mjs";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const repo = "MaverickHQ/obsidian-vault-reader";

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("community plugin submission policy", () => {
  it("defines the exact Obsidian community plugin listing metadata", () => {
    const submission = readText("docs/community-plugin-submission.md");

    expect(submission).toContain("# Obsidian Community Plugin Submission");
    expect(submission).toContain(`"id": "${manifest.id}"`);
    expect(submission).toContain(`"name": "${manifest.name}"`);
    expect(submission).toContain(`"author": "${manifest.author}"`);
    expect(submission).toContain(`"description": "${manifest.description}"`);
    expect(submission).toContain(`"repo": "${repo}"`);
    expect(manifest.description).toContain("speed reading");
    expect(manifest.description).not.toMatch(/\bRSVP\b/i);
  });

  it("captures release tag, version, and asset requirements for Obsidian install", () => {
    const submission = readText("docs/community-plugin-submission.md");

    expect(packageJson.version).toBe(manifest.version);
    expect(versions[manifest.version as keyof typeof versions]).toBe(manifest.minAppVersion);
    expect(submission).toContain(`Release tag: ${manifest.version}`);
    expect(submission).toContain("tagged identically to the version inside `manifest.json`");
    expect(submission).toContain(`Assets: ${releaseAssetNames.join(", ")}`);
    expect(submission).toContain(`Checksum evidence: ${releaseChecksumFileName}`);
  });

  it("keeps final submission blocked until public visibility and manual QA are complete", () => {
    const submission = readText("docs/community-plugin-submission.md");

    expect(submission).toContain("Repository visibility must be public before the PR is opened.");
    expect(submission).toContain("Manual clean-vault Obsidian QA must pass before submission.");
    expect(submission).toContain(
      "No `obsidianmd/obsidian-releases` PR is opened during this phase.",
    );
    expect(submission).toContain(
      "BRAT/public beta is optional and deferred unless manual QA finds risk.",
    );
  });
});
