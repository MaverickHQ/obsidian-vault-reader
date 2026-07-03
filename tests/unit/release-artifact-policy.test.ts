import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const releaseArtifactScriptPath = path.join(root, "tests", "release-artifacts.sh");

describe("release artifact policy", () => {
  it("checks generated Obsidian release artifacts during release builds", () => {
    expect(packageJson.scripts["check:release-artifacts"]).toBe("bash tests/release-artifacts.sh");
    expect(packageJson.scripts["build:release"]).toContain("npm run check:release-artifacts");
    expect(packageJson.scripts["package:release"]).toBe(
      "npm run build && node scripts/package-release.mjs",
    );
    expect(packageJson.scripts.verify).toContain("npm run build:release");

    const script = fs.readFileSync(releaseArtifactScriptPath, "utf8");
    expect(script).toContain("main.js");
    expect(script).toContain("styles.css");
    expect(script).toContain("manifest.json");
    expect(script).toContain("main.js must not be tracked");
    expect(script).toContain("npm run package:release");
  });
});
