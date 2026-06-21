import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeMarkdownToReadingText } from "../../src/reader/markdown-normalizer";

const root = path.resolve(import.meta.dirname, "../..");
const notesDir = path.join(root, "fixtures", "notes");
const normalizedDir = path.join(root, "fixtures", "expected", "normalized");

const fixtures = [
  "prose",
  "headings",
  "lists",
  "links",
  "code-blocks",
  "frontmatter",
  "stars",
] as const;

function readText(absolutePath: string): string {
  return fs.readFileSync(absolutePath, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

describe("normalization regression fixtures", () => {
  it("matches expected normalized outputs for every canonical fixture", () => {
    for (const fixture of fixtures) {
      const markdownInput = readText(path.join(notesDir, `${fixture}.md`));
      const expected = readText(path.join(normalizedDir, `${fixture}.txt`));

      expect(normalizeMarkdownToReadingText(markdownInput)).toBe(expected);
    }
  });
});
