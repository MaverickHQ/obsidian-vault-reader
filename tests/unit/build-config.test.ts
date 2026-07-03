import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readJson<T>(absolutePath: string): T {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8")) as T;
}

describe("Build configuration", () => {
  it("defines required scripts for dev, build, lint, format, and tests", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>(path.join(root, "package.json"));

    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts["deploy:local"]).toBeDefined();
    expect(pkg.scripts["build:local"]).toContain("deploy:local");
    expect(pkg.scripts["dev:local"]).toBeDefined();
    expect(pkg.scripts["build:release"]).toContain("check:secrets");
    expect(pkg.scripts["package:release"]).toContain("scripts/package-release.mjs");
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.format).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  it("has core config files present", () => {
    const requiredPaths = [
      "tsconfig.json",
      "esbuild.config.mjs",
      "eslint.config.mjs",
      "vitest.config.ts",
      ".prettierrc.json",
      "scripts/deploy-local-vault.mjs",
      "scripts/dev-local-vault.mjs",
      "scripts/package-release.mjs",
    ];

    for (const filePath of requiredPaths) {
      expect(fs.existsSync(path.join(root, filePath))).toBe(true);
    }
  });

  it("externalizes Obsidian-owned CodeMirror packages from the production bundle", () => {
    const config = fs.readFileSync(path.join(root, "esbuild.config.mjs"), "utf8");

    expect(config).toContain('"@codemirror/state"');
    expect(config).toContain('"@codemirror/view"');
    expect(config).toContain("obsidianRuntimeExternals");
  });
});
