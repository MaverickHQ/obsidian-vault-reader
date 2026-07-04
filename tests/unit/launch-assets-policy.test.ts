import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("launch assets policy", () => {
  it("defines a post-submission launch asset package and manual capture gate", () => {
    const tasks = readText("docs/tasks.md");
    const launchPlan = readText("docs/launch-plan.md");
    const assetsReadme = readText("docs/assets/README.md");

    for (const expected of [
      "### 3.6 Launch Asset Package",
      "3.6.1 Screenshot Capture Spec",
      "3.6.2 Short GIF Or Video Capture Spec",
      "3.6.3 README And Launch Copy Integration",
      "3.6.4 Asset QA And Review Gate",
      "Manual capture gate",
    ]) {
      expect(tasks).toContain(expected);
    }

    for (const expected of [
      "docs/assets/vault-reader-main-panel.png",
      "docs/assets/vault-reader-highlight.png",
      "docs/assets/vault-reader-review-ready.png",
      "GitHub Release media",
      "automated review is in progress",
    ]) {
      expect(launchPlan).toContain(expected);
      expect(assetsReadme).toContain(expected);
    }

    expect(assetsReadme).toContain("Capture source: `fixtures/manual-test-vault`");
    expect(assetsReadme).toContain(
      "No private notes, personal data, client material, or copyrighted book text",
    );
  });
});
