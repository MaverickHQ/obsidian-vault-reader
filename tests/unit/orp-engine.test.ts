import { describe, expect, it } from "vitest";

import { getOrpIndex } from "../../src/reader/orp-engine";

describe("getOrpIndex", () => {
  it("handles single-character tokens", () => {
    expect(getOrpIndex("a")).toBe(0);
  });

  it("returns expected focus index for common word lengths", () => {
    expect(getOrpIndex("go")).toBe(1);
    expect(getOrpIndex("quick")).toBe(1);
    expect(getOrpIndex("reading")).toBe(2);
    expect(getOrpIndex("normalize")).toBe(2);
    expect(getOrpIndex("extraordinary")).toBe(3);
    expect(getOrpIndex("characteristically")).toBe(4);
  });

  it("ignores edge punctuation around the token", () => {
    expect(getOrpIndex('"quick,"')).toBe(1);
    expect(getOrpIndex("(reading)")).toBe(2);
  });

  it("never returns an index outside the token bounds", () => {
    const token = "hi";
    const orp = getOrpIndex(token);

    expect(orp).toBeGreaterThanOrEqual(0);
    expect(orp).toBeLessThan(token.length);
  });
});
