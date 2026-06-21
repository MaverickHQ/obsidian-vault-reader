import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("public review hygiene policy", () => {
  it("keeps Dependabot configured for npm and GitHub Actions", () => {
    const dependabot = readText(".github/dependabot.yml");

    expect(dependabot).toContain("package-ecosystem: npm");
    expect(dependabot).toContain("package-ecosystem: github-actions");
    expect(dependabot).toContain('directory: "/"');
    expect(dependabot).toContain("open-pull-requests-limit");
  });

  it("provides issue templates with enough support triage detail", () => {
    const bugTemplate = readText(".github/ISSUE_TEMPLATE/bug_report.yml");
    const featureTemplate = readText(".github/ISSUE_TEMPLATE/feature_request.yml");

    for (const requiredField of [
      "Obsidian version",
      "Vault Reader version",
      "Operating system",
      "Steps to reproduce",
      "Expected behavior",
      "Actual behavior",
    ]) {
      expect(bugTemplate).toContain(requiredField);
    }

    expect(featureTemplate).toContain("Problem or use case");
    expect(featureTemplate).toContain("Proposed solution");
    expect(featureTemplate).toContain("Local-first impact");
  });

  it("documents public branch protection and vulnerability reporting expectations", () => {
    const contributing = readText("CONTRIBUTING.md");
    const securityReview = readText("docs/security-review.md");

    expect(contributing).toContain("TDD-first");
    expect(contributing).toContain("branch protection");
    expect(contributing).toContain("no force-push");
    expect(contributing).toContain("npm audit --audit-level=high");
    expect(securityReview).toContain("private vulnerability reporting");
    expect(securityReview).toContain("Dependabot");
    expect(securityReview).toContain("branch protection");
  });
});
