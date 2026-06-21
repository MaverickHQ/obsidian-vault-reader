import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const notesDir = path.join(root, "fixtures", "notes");
const normalizedDir = path.join(root, "fixtures", "expected", "normalized");
const manualVaultDir = path.join(root, "fixtures", "manual-test-vault");

const requiredFixtures = [
  "prose",
  "headings",
  "lists",
  "links",
  "code-blocks",
  "frontmatter",
] as const;

function readNormalizedContent(absolutePath: string): string {
  return fs.readFileSync(absolutePath, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

describe("Normalization fixtures", () => {
  it("includes baseline markdown note fixtures", () => {
    for (const fixture of requiredFixtures) {
      expect(fs.existsSync(path.join(notesDir, `${fixture}.md`))).toBe(true);
    }
  });

  it("includes expected normalized outputs for every note fixture", () => {
    for (const fixture of requiredFixtures) {
      expect(fs.existsSync(path.join(normalizedDir, `${fixture}.txt`))).toBe(true);
    }
  });

  it("includes a dedicated manual test vault scaffold", () => {
    const requiredPaths = [
      "README.md",
      "00-Test-Index.md",
      ".obsidian/community-plugins.json",
      ".obsidian/core-plugins.json",
      ".obsidian/plugins/vault-reader/.gitkeep",
    ];

    for (const relativePath of requiredPaths) {
      expect(fs.existsSync(path.join(manualVaultDir, relativePath))).toBe(true);
    }
  });

  it("locks normalized outputs with an inline snapshot baseline", () => {
    const fixtureMap = Object.fromEntries(
      requiredFixtures.map((fixture) => [
        fixture,
        readNormalizedContent(path.join(normalizedDir, `${fixture}.txt`)),
      ]),
    );

    expect(fixtureMap).toMatchInlineSnapshot(`
      {
        "code-blocks": "Inline code like npm run build:release should read as plain text.

      const token = {
        raw: "reading",
        delayMs: 180,
      };

      npm run test

      After a code block, prose should continue without malformed spacing.",
        "frontmatter": "Frontmatter should not leak YAML markers into reading text.

      The body content should still flow like ordinary prose.",
        "headings": "Reader Calibration

      Open with one clear sentence.

      Why It Matters

      Short headings should become natural pauses during RSVP playback.

      Next Action

      Set an initial pace, then increase speed once comprehension feels stable.",
        "links": "Use Vault Reader for plugin docs.

      Open Daily Reading Queue before starting your session.

      Reference links should stay readable: Device board.

      Raw URLs should remain visible: https://www.waveshare.com/esp32-s3-touch-lcd-3.49.htm

      Device photo",
        "lists": "Capture one core idea.
      Add two supporting points.
      Keep each point concrete.
      Keep each point short.

      Draft the summary.
      Review for clarity.
      Export when ready.

      Confirm the note reads naturally.
      Confirm export target folders exist.",
        "prose": "The vault is where ideas live long enough to become useful.

      Read this passage as plain prose with no formatting noise.

      A steady reading rhythm should make this text feel effortless.",
      }
    `);
  });
});
