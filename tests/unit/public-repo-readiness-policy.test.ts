import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const cleanRepoUrl = "https://github.com/MaverickHQ/obsidian-vault-reader-clean-public";

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("public repository readiness policy", () => {
  it("documents the private clean-staging repository and one-commit history strategy", () => {
    const readiness = readText("docs/public-repo-readiness.md");

    expect(readiness).toContain("# Public Repository Readiness");
    expect(readiness).toContain(`Staging repository: ${cleanRepoUrl}`);
    expect(readiness).toContain("Visibility: private until final public-release approval.");
    expect(readiness).toContain(
      "History strategy: one clean initial commit from release/clean-public-tree.",
    );
    expect(readiness).toContain("Current build-lab repository remains private.");
  });

  it("records public repository metadata and safety settings", () => {
    const readiness = readText("docs/public-repo-readiness.md");

    for (const requiredText of [
      "Description: Focused speed reading for Obsidian notes.",
      "Topics: obsidian-plugin, speed-reading, rsvp, markdown, reading, typescript",
      "Issues enabled",
      "Dependabot enabled",
      "Private vulnerability reporting enabled when available",
      "Branch protection planned for main",
    ]) {
      expect(readiness).toContain(requiredText);
    }
  });

  it("points package support metadata at the clean public-staging repository", () => {
    expect(packageJson.repository.url).toBe(
      "git+https://github.com/MaverickHQ/obsidian-vault-reader-clean-public.git",
    );
    expect(packageJson.bugs.url).toBe(`${cleanRepoUrl}/issues`);
    expect(packageJson.homepage).toBe(`${cleanRepoUrl}#readme`);
  });
});
