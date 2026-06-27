import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const productionRepoUrl = "https://github.com/MaverickHQ/obsidian-vault-reader";
const buildLabRepoUrl = "https://github.com/MaverickHQ/obsidian-vault-reader-build-lab";

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("public repository readiness policy", () => {
  it("documents the private production-facing repository and one-commit history strategy", () => {
    const readiness = readText("docs/public-repo-readiness.md");

    expect(readiness).toContain("# Public Repository Readiness");
    expect(readiness).toContain(`Production-facing repository: ${productionRepoUrl}`);
    expect(readiness).toContain("Visibility: private until final public-release approval.");
    expect(readiness).toContain(
      "History strategy: one clean initial commit from release/clean-public-tree.",
    );
    expect(readiness).toContain(`Current build-lab repository: ${buildLabRepoUrl}`);
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

  it("documents local build-lab and production-facing remotes separately", () => {
    const readiness = readText("docs/public-repo-readiness.md");

    expect(readiness).toContain(
      "Main working copy remote: `origin` points to `https://github.com/MaverickHQ/obsidian-vault-reader-build-lab.git`.",
    );
    expect(readiness).toContain(
      "Clean export remote: `release/clean-public-tree` `origin` points to `https://github.com/MaverickHQ/obsidian-vault-reader.git`.",
    );
  });

  it("points package support metadata at the production-facing repository", () => {
    expect(packageJson.repository.url).toBe(
      "git+https://github.com/MaverickHQ/obsidian-vault-reader.git",
    );
    expect(packageJson.bugs.url).toBe(`${productionRepoUrl}/issues`);
    expect(packageJson.homepage).toBe(`${productionRepoUrl}#readme`);
  });
});
