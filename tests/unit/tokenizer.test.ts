import { describe, expect, it } from "vitest";

import { tokenizeReadingText } from "../../src/reader/tokenizer";

describe("tokenizeReadingText", () => {
  it("returns stable token order for punctuation-rich prose", () => {
    const tokens = tokenizeReadingText("Hello, world!");
    expect(tokens.map((token) => token.raw)).toEqual(["Hello,", "world!"]);
  });

  it("is deterministic for repeated calls with the same input", () => {
    const input = "One, two, three.";
    expect(tokenizeReadingText(input)).toEqual(tokenizeReadingText(input));
  });

  it("exposes metadata independent of UI rendering", () => {
    const [token] = tokenizeReadingText("Reading.");

    expect(token).toMatchObject({
      index: 0,
      raw: "Reading.",
      spoken: "Reading",
      trailingPunctuation: ".",
      pauseClass: "sentence",
    });
    expect(token.orpIndex).toBeGreaterThanOrEqual(0);
    expect(token.orpIndex).toBeLessThan(token.spoken.length);
  });

  it("uses punctuation metadata for timing-relevant pause classes", () => {
    const tokens = tokenizeReadingText('Wait, what? "Now!"');
    expect(tokens.map((token) => token.pauseClass)).toEqual(["clause", "sentence", "sentence"]);
  });

  it("elevates a token pause to paragraph when followed by blank lines", () => {
    const tokens = tokenizeReadingText("First line.\n\nSecond line");
    expect(tokens[1]?.raw).toBe("line.");
    expect(tokens[1]?.pauseClass).toBe("paragraph");
  });

  it("returns no tokens for empty or whitespace-only input", () => {
    expect(tokenizeReadingText("")).toEqual([]);
    expect(tokenizeReadingText(" \n\t  ")).toEqual([]);
  });
});
