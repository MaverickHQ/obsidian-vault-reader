import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import { releaseAssetNames } from "../../scripts/release-package-policy.mjs";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("Obsidian community review policy", () => {
  it("keeps command IDs concise and avoids leaf detaching during unload", () => {
    const mainSource = readText("src/main.ts");

    expect(mainSource).toContain('id: "start-session"');
    expect(mainSource).toContain('id: "restart-current-note"');
    expect(mainSource).toContain('id: "toggle-play-pause"');
    expect(mainSource).not.toContain('id: "vault-reader-');
    expect(mainSource).not.toMatch(/onunload\(\):\s*Promise<void>/);
    expect(mainSource).not.toMatch(/onunload[\s\S]*detachLeavesOfType/);
  });

  it("uses Obsidian-compatible DOM/style APIs in reviewed source files", () => {
    const shellSource = readText("src/reader/view/reader-view-shell.ts");
    const readerViewSource = readText("src/reader/reader-view.ts");
    const settingsTabSource = readText("src/settings/vault-reader-settings-tab.ts");

    expect(shellSource).toContain("activeDocument.createElement");
    expect(shellSource).not.toContain("document.createElement");
    expect(readerViewSource).toContain("setCssProps");
    expect(readerViewSource).not.toContain('style.setProperty("--vault-reader-shell-scale"');
    expect(settingsTabSource).toContain(".setHeading()");
    expect(settingsTabSource).not.toContain('createEl("h2"');
  });

  it("ships only Obsidian-supported release assets and enables provenance attestations", () => {
    const releaseWorkflow = readText(".github/workflows/release.yml");

    expect(releaseAssetNames).toEqual(["main.js", "manifest.json", "styles.css"]);
    expect(releaseWorkflow).toContain("actions/attest-build-provenance");
    expect(releaseWorkflow).toContain("attestations: write");
    expect(packageJson.dependencies).toMatchObject({
      "@codemirror/state": "6.5.0",
      "@codemirror/view": "6.38.6",
    });
  });
});
