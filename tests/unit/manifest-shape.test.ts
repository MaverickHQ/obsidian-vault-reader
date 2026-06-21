import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type Manifest = {
  id: string;
  name: string;
  version: string;
  minAppVersion: string;
  description: string;
  author: string;
  isDesktopOnly: boolean;
};

const root = path.resolve(import.meta.dirname, "../..");

describe("Manifest shape", () => {
  it("contains required Obsidian plugin fields", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
    ) as Manifest;

    expect(manifest.id).toBe("vault-reader");
    expect(manifest.id).not.toContain("obsidian");
    expect(manifest.name).toBe("Vault Reader");
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.minAppVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description.length).toBeGreaterThan(10);
    expect(manifest.author).toBe("MaverickHQ");
    expect(manifest.isDesktopOnly).toBe(true);
  });

  it("keeps versions.json in sync with manifest version", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
    ) as Manifest;
    const versions = JSON.parse(
      fs.readFileSync(path.join(root, "versions.json"), "utf8"),
    ) as Record<string, string>;

    expect(versions[manifest.version]).toBe(manifest.minAppVersion);
  });

  it("keeps command discoverability and release-notes links visible in README", () => {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

    expect(readme).toContain("`Vault Reader: Start reading current note`");
    expect(readme).toContain("docs/release-notes.md");
  });
});
