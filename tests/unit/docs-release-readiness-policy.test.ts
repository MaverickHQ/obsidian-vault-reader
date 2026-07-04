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

type Manifest = {
  description: string;
  isDesktopOnly: boolean;
  minAppVersion: string;
  version: string;
};

type PackageJson = {
  description: string;
  version: string;
};

describe("docs release readiness policy", () => {
  it("keeps public release metadata aligned and searchable", () => {
    const manifest = readJson<Manifest>("manifest.json");
    const packageJson = readJson<PackageJson>("package.json");
    const versions = readJson<Record<string, string>>("versions.json");

    expect(packageJson.version).toBe(manifest.version);
    expect(packageJson.description).toBe(manifest.description);
    expect(versions[manifest.version]).toBe(manifest.minAppVersion);
    expect(manifest.description).toContain("speed reading");
    expect(manifest.description).toContain("notes");
    expect(manifest.description).not.toMatch(/\bObsidian\b/);
    expect(manifest.description).not.toMatch(/\bRSVP\b/i);
    expect(manifest.description).not.toMatch(/\b(device|AI|paid|backend|telemetry)\b/i);
    expect(manifest.description.length).toBeLessThanOrEqual(90);
  });

  it("documents the first community release contract", () => {
    const releaseNotes = readText("docs/release-notes.md");
    const manifest = readJson<Manifest>("manifest.json");

    expect(releaseNotes).toContain(`## ${manifest.version}`);
    expect(releaseNotes).toContain(
      "Focused speed reading for notes, local-first, with optional in-note follow-along highlight.",
    );
    expect(releaseNotes).toContain("### Included Scope");
    expect(releaseNotes).toContain("### Deferred Scope");
    expect(releaseNotes).toContain("### Privacy And Security Contract");
    expect(releaseNotes).toContain("### Release And Install Contract");
    expect(releaseNotes).toContain("RSVP Nano export");
    expect(releaseNotes).toContain("BYOK AI");
    expect(releaseNotes).toContain("Paid licensing");
    expect(releaseNotes).toContain("no telemetry");
    expect(releaseNotes).toContain("no network requests");
    expect(releaseNotes).toContain("starts a reader session from the active note");
    expect(releaseNotes).toContain("GitHub release tag must match");
  });

  it("makes the desktop-only boundary explicit before public review", () => {
    const manifest = readJson<Manifest>("manifest.json");
    const releaseNotes = readText("docs/release-notes.md");

    expect(manifest.isDesktopOnly).toBe(true);
    expect(releaseNotes).toContain("Desktop-only");
    expect(releaseNotes).toContain("mobile support is not part of this release");
  });
});
