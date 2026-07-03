import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("launch plan policy", () => {
  it("defines promotion copy, tester flow, feedback loop, and non-telemetry metrics", () => {
    const launchPlan = fs.readFileSync(path.join(root, "docs", "launch-plan.md"), "utf8");

    for (const section of [
      "# Launch Plan",
      "## Tester Install Flow",
      "## Demo Asset Plan",
      "## Launch Copy",
      "## Feedback Loop",
      "## Success Metrics Without Telemetry",
      "## GitHub Topics",
    ]) {
      expect(launchPlan).toContain(section);
    }

    for (const requiredCopy of [
      "fixtures/manual-test-vault",
      "Obsidian Forum",
      "Obsidian Discord",
      "Reddit",
      "GitHub release",
      "obsidian-plugin",
      "speed-reading",
      "release downloads",
      "GitHub stars",
      "RSVP Nano",
      "BYOK AI",
      "future exploration",
    ]) {
      expect(launchPlan).toContain(requiredCopy);
    }
  });
});
