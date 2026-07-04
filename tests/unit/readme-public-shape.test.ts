import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("README public shape", () => {
  it("uses the public product name and portable documentation links", () => {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

    expect(readme).toMatch(/^# Vault Reader for Obsidian$/m);
    expect(readme).not.toContain("/Users/");
    expect(readme).toContain("[requirements.md](docs/requirements.md)");
    expect(readme).toContain("[release-notes.md](docs/release-notes.md)");
    expect(readme).toContain("[launch-plan.md](docs/launch-plan.md)");
  });

  it("discloses privacy and external-service behavior for community review", () => {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

    expect(readme).toContain("## Privacy And Security");
    expect(readme).toContain("does not collect telemetry");
    expect(readme).toContain("does not make network requests");
    expect(readme).toContain("does not require an account");
    expect(readme).toContain("stores settings and reading progress locally");
  });

  it("frames the public README around user value, install paths, and release limits", () => {
    const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

    for (const section of [
      "## Why Use It",
      "## Who It Is For",
      "## Install For Testing",
      "## Install After Community Approval",
      "## How To Use",
      "## Known Limitations",
    ]) {
      expect(readme).toContain(section);
    }

    expect(readme).toContain("fixtures/manual-test-vault");
    expect(readme).toContain("Vault Reader: Start reading current note");
    expect(readme).toContain("Obsidian Community Plugins");
    expect(readme).not.toContain("## Roadmap");
    expect(readme).not.toContain("future exploration");
  });
});
