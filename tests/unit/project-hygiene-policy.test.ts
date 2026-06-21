import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

describe("project hygiene policy", () => {
  it("keeps active requirements focused on the community plugin release", () => {
    const requirements = readText("docs/requirements.md");

    expect(requirements).toContain("Community Plugin Release Scope");
    expect(requirements).toContain("Deferred Scope");
    expect(requirements).toContain("RSVP Nano export");
    expect(requirements).toContain("BYOK AI");
    expect(requirements).toContain(
      "No account, backend, telemetry, or network request is required",
    );
    expect(requirements).not.toMatch(/\bmust export\b/i);
    expect(requirements).not.toMatch(/\bmust support writing exports\b/i);
    expect(requirements).not.toMatch(/\bdevice validation flow must\b/i);
    expect(requirements).not.toMatch(/\bBYOK AI Workflow\b/);
  });

  it("keeps active design free of deferred device and AI architecture", () => {
    const design = readText("docs/design.md");

    expect(design).toContain("Community Plugin Architecture");
    expect(design).toContain("Deferred Architecture");
    expect(design).toContain("docs/adr/0002-community-plugin-first-release.md");
    expect(design).not.toContain("ExportAdapter");
    expect(design).not.toContain("TargetWriter");
    expect(design).not.toContain("AIAdapter");
    expect(design).not.toContain("Device Validation Loop");
  });

  it("archives historical scope artifacts instead of leaving them active", () => {
    for (const archivedPath of [
      "docs/archive/pre-community-release/requirements-2026-05-22.md",
      "docs/archive/pre-community-release/design-2026-05-22.md",
      "docs/archive/pre-community-release/paid-readiness-baseline-2026-06.md",
      "docs/archive/pre-community-release/phase-2-qa-checklist-2026-06.md",
      "docs/archive/pre-community-release/export-layout.fixture.test.ts.md",
      "docs/archive/pre-community-release/export-layout/article.json",
      "docs/archive/pre-community-release/export-layout/book.json",
    ]) {
      expect(exists(archivedPath)).toBe(true);
    }

    expect(exists("docs/paid-readiness-baseline.md")).toBe(false);
    expect(exists("docs/phase-2-qa-checklist.md")).toBe(false);
    expect(exists("tests/fixtures/export-layout.fixture.test.ts")).toBe(false);
    expect(exists("fixtures/expected/export-layout/article.json")).toBe(false);
    expect(exists("fixtures/expected/export-layout/book.json")).toBe(false);
  });

  it("documents the professional project structure for public reviewers", () => {
    const projectStructure = readText("docs/PROJECT_STRUCTURE.md");

    for (const requiredSection of [
      "# Project Structure",
      "Release-Critical Root Files",
      "Source Code",
      "Tests",
      "Fixtures",
      "Documentation",
      "Generated And Local-Only Files",
      "Archive Policy",
    ]) {
      expect(projectStructure).toContain(requiredSection);
    }

    expect(projectStructure).toContain("main.js");
    expect(projectStructure).toContain("release/");
    expect(projectStructure).toContain("docs/archive/pre-community-release");
  });

  it("keeps ignore and formatting policy intentional", () => {
    const gitignore = readText(".gitignore");
    const prettierignore = readText(".prettierignore");

    expect(gitignore).toContain("node_modules/");
    expect(gitignore).toContain("coverage/");
    expect(gitignore).toContain("release/");
    expect(gitignore).toContain("fixtures/archive/");
    expect(gitignore).not.toContain("docs/archive/");

    expect(prettierignore).not.toContain("docs/*.md");
    expect(prettierignore).not.toContain("legacy");
    expect(prettierignore).not.toContain(".git-broken-backup-2026-05-22");
    expect(prettierignore).toContain("docs/archive");
    expect(prettierignore).toContain(".git-broken-backup-*");
  });
});
