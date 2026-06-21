import { describe, expect, it } from "vitest";

import {
  setDisabledIfChanged,
  setTextContentIfChanged,
  setValueIfChanged,
} from "../../src/reader/dom-writes";

describe("dom write guards", () => {
  it("avoids redundant textContent writes in playback-like loops", () => {
    let writes = 0;
    let textContent: string | null = null;

    const target = {
      get textContent() {
        return textContent;
      },
      set textContent(value: string | null) {
        writes += 1;
        textContent = value;
      },
    };

    for (let index = 0; index < 200; index += 1) {
      setTextContentIfChanged(target, "PLAYING at 300 WPM");
    }

    expect(writes).toBe(1);
  });

  it("avoids redundant input value writes", () => {
    let writes = 0;
    let value = "";

    const target = {
      get value() {
        return value;
      },
      set value(next: string) {
        writes += 1;
        value = next;
      },
    };

    setValueIfChanged(target, "300");
    setValueIfChanged(target, "300");
    setValueIfChanged(target, "320");
    expect(writes).toBe(2);
  });

  it("avoids redundant disabled flag writes", () => {
    let writes = 0;
    let disabled = false;

    const target = {
      get disabled() {
        return disabled;
      },
      set disabled(next: boolean) {
        writes += 1;
        disabled = next;
      },
    };

    setDisabledIfChanged(target, true);
    setDisabledIfChanged(target, true);
    setDisabledIfChanged(target, false);
    expect(writes).toBe(2);
  });
});
