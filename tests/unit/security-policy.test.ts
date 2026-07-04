import fs from "node:fs";
import path from "node:path";
import packageJson from "../../package.json";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const runtimeSourceDir = path.join(root, "src");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(fullPath);
    }
    return entry.isFile() ? [fullPath] : [];
  });
}

function readRuntimeSources(): Array<{ relativePath: string; source: string }> {
  return listFiles(runtimeSourceDir)
    .filter((filePath) => /\.(ts|tsx)$/.test(filePath))
    .map((filePath) => ({
      relativePath: path.relative(root, filePath),
      source: fs.readFileSync(filePath, "utf8"),
    }));
}

describe("security policy", () => {
  it("documents the public-review threat model and data-handling contract", () => {
    const securityReview = readText("docs/security-review.md");
    const securityPolicy = readText("SECURITY.md");

    for (const expectedSection of [
      "# Security Review",
      "## Threat Model",
      "## Data Handling",
      "## Rendering Safety",
      "## Release And Supply Chain Controls",
      "## Public Review Checklist",
    ]) {
      expect(securityReview).toContain(expectedSection);
    }

    for (const expectedPromise of [
      "no network requests",
      "no backend",
      "no telemetry",
      "no credentials",
      "Obsidian plugin data",
      "textContent",
      "artifact attestations",
    ]) {
      expect(securityReview).toContain(expectedPromise);
    }

    expect(securityPolicy).toContain("docs/security-review.md");
    expect(securityPolicy).toContain("private vulnerability reporting");
  });

  it("rejects runtime network APIs for the local-first release", () => {
    const forbiddenNetworkApis = [
      /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/,
      /\bWebSocket\b/,
      /\bEventSource\b/,
      /\bnavigator\.sendBeacon\b/,
    ];

    const violations = readRuntimeSources().flatMap(({ relativePath, source }) =>
      forbiddenNetworkApis
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relativePath}: ${pattern}`),
    );

    expect(violations).toEqual([]);
  });

  it("keeps reader rendering on text-safe APIs instead of unsafe HTML insertion", () => {
    const forbiddenHtmlWrites = [
      /\.insertAdjacentHTML\s*\(/,
      /\.outerHTML\s*=/,
      /\beval\s*\(/,
      /\bnew Function\s*\(/,
    ];
    const unsafeInnerHtmlWrites = /\.innerHTML\s*=\s*(?!["']{2})/;

    const violations = readRuntimeSources().flatMap(({ relativePath, source }) => {
      const staticViolations = forbiddenHtmlWrites
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relativePath}: ${pattern}`);
      const innerHtmlViolations = unsafeInnerHtmlWrites.test(source)
        ? [`${relativePath}: unsafe innerHTML assignment`]
        : [];
      return [...staticViolations, ...innerHtmlViolations];
    });

    expect(violations).toEqual([]);
  });

  it("keeps release security checks in the default release gate", () => {
    expect(packageJson.scripts["check:secrets"]).toBe("bash tests/no-secrets.sh");
    expect(packageJson.scripts["build:release"]).toContain("npm run check:secrets");
    expect(packageJson.scripts["build:release"]).toContain("npm run check:release-artifacts");
    expect(packageJson.scripts["build:release"]).toContain("npm run check:repo-shape");
  });
});
