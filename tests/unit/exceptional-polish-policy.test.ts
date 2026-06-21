import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("exceptional pre-public polish policy", () => {
  it("documents a demo asset package that uses only the manual test vault", () => {
    const readme = readText("README.md");
    const assetsReadme = readText("docs/assets/README.md");

    expect(readme).toContain("## Demo");
    expect(readme).toContain("docs/assets/README.md");
    expect(assetsReadme).toContain("fixtures/manual-test-vault");
    expect(assetsReadme).toContain("Vault Reader: Start reading current note");
    expect(assetsReadme).toContain("Vault Reader: Restart current note from beginning");
    expect(assetsReadme).toContain("Do not use private notes");
    expect(assetsReadme).toContain("Do not use copyrighted book text");
  });

  it("keeps the manual QA evidence matrix release-review ready", () => {
    const qa = readText("docs/community-plugin-qa.md");

    for (const expected of [
      "## Platform QA Matrix",
      "macOS",
      "Windows",
      "Linux",
      "Not yet verified",
      "Obsidian version",
      "Plugin version",
      "Install method",
      "Tester",
      "Date",
      "Result",
    ]) {
      expect(qa).toContain(expected);
    }
  });

  it("provides a single release verification command for pre-public gates", () => {
    const packageJson = readJson<{ scripts: Record<string, string> }>("package.json");
    const command = packageJson.scripts["verify:release"];

    expect(command).toBeDefined();
    for (const requiredScript of [
      "format:check",
      "lint",
      "test",
      "build:release",
      "package:release",
      "test:e2e:release",
      "audit --audit-level=high",
      "check:secrets",
    ]) {
      expect(command).toContain(requiredScript);
    }

    expect(readText("docs/process.md")).toContain("npm run verify:release");
    expect(readText("docs/PROJECT_STRUCTURE.md")).toContain("npm run verify:release");
  });
});
