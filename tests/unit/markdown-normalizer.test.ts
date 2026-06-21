import { describe, expect, it } from "vitest";

import { normalizeMarkdownToReadingText } from "../../src/reader/markdown-normalizer";

describe("normalizeMarkdownToReadingText", () => {
  it("removes emphasis markers while preserving readable text", () => {
    expect(normalizeMarkdownToReadingText("**bold** _text_ ~~only~~")).toBe("bold text only");
  });

  it("preserves plain-text underscores inside identifiers", () => {
    const input = "Use snake_case identifiers and mid_word_values.";
    expect(normalizeMarkdownToReadingText(input)).toBe(
      "Use snake_case identifiers and mid_word_values.",
    );
  });

  it("preserves plain-text star-delimited expressions", () => {
    const input = "Equation: a * b * c.";
    expect(normalizeMarkdownToReadingText(input)).toBe("Equation: a * b * c.");
  });

  it("preserves star-delimited plain text while stripping valid emphasis", () => {
    const input = "Use *focus* here and keep a * b in plain text.";
    expect(normalizeMarkdownToReadingText(input)).toBe(
      "Use focus here and keep a * b in plain text.",
    );
  });

  it("flattens markdown links and wiki links into readable text", () => {
    const input =
      "Use [Vault Reader](https://example.com) and open [[Daily Queue]] plus [[doc|Alias]].";
    expect(normalizeMarkdownToReadingText(input)).toBe(
      "Use Vault Reader and open Daily Queue plus Alias.",
    );
  });

  it("removes heading and list syntax while preserving sentence order", () => {
    const input = "# Top\n\n- first\n- [x] second\n1. third";
    expect(normalizeMarkdownToReadingText(input)).toBe("Top\n\nfirst\nsecond\nthird");
  });

  it("strips frontmatter fence and keeps body text", () => {
    const input = "---\ntitle: Test\nstatus: draft\n---\n\nBody paragraph.";
    expect(normalizeMarkdownToReadingText(input)).toBe("Body paragraph.");
  });

  it("keeps code-block contents and does not emit malformed spacing", () => {
    const input = "```ts\nconst speed = 300;\n```\n\nAfter code.";
    expect(normalizeMarkdownToReadingText(input)).toBe("const speed = 300;\n\nAfter code.");
  });

  it("handles quotes and callouts deterministically", () => {
    const input = "> [!note] Reminder\n> Keep momentum.\n> Stay focused.";
    expect(normalizeMarkdownToReadingText(input)).toBe("Reminder\nKeep momentum.\nStay focused.");
  });
});
