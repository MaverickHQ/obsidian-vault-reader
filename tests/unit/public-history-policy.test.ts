import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("public history policy", () => {
  it("documents no-history publication as the default public release path", () => {
    const policy = readText("docs/public-history-review.md");

    expect(policy).toContain("# Public History Review");
    expect(policy).toContain(
      "Default decision: publish from a new public repo with one clean initial commit.",
    );
    expect(policy).toContain("Do not make the private working repository public.");
    expect(policy).toContain(
      "Current private remote is not the public Obsidian submission source.",
    );
  });

  it("requires tracked-file and history-aware secret scans before public release", () => {
    const policy = readText("docs/public-history-review.md");

    expect(policy).toContain("Tracked-file secret scan");
    expect(policy).toContain("History-aware secret scan");
    expect(policy).toContain("paid strategy");
    expect(policy).toContain("local filesystem paths");
    expect(policy).toContain("copied or copyrighted content");
    expect(policy).toContain("abandoned device or AI implementation details");
  });

  it("keeps private provenance out of public-facing docs", () => {
    const policy = readText("docs/public-history-review.md");

    expect(policy).not.toMatch(/\b[0-9a-f]{7,40}\b/);
    expect(policy).not.toContain("/Users/");
    expect(policy).not.toContain("ghp_");
    expect(policy).not.toContain("github_pat_");
  });
});
