import { describe, expect, it } from "vitest";

import {
  createSourceHighlightState,
  markSourceHighlightUnavailableNotified,
  shouldNotifySourceHighlightUnavailable,
  transitionSourceHighlightActive,
  transitionSourceHighlightUnavailable,
} from "../../src/reader/source-highlight-state";
import type { TokenHighlightMap } from "../../src/reader/source-highlight-map";

function createMap(): TokenHighlightMap {
  return {
    ok: true,
    sourceKey: "notes/a.md",
    ranges: [{ index: 0, from: 0, to: 3 }],
  };
}

describe("source highlight state", () => {
  it("models disabled, ready, active, and unavailable highlight states explicitly", () => {
    expect(createSourceHighlightState({ enabled: false, map: createMap() })).toEqual({
      status: "disabled",
    });

    const ready = createSourceHighlightState({ enabled: true, map: createMap() });
    expect(ready).toEqual({ status: "ready" });

    expect(transitionSourceHighlightActive(ready, { from: 0, to: 3, color: "yellow" })).toEqual({
      status: "active",
      range: { from: 0, to: 3, color: "yellow" },
    });

    expect(
      createSourceHighlightState({
        enabled: true,
        map: {
          ok: false,
          sourceKey: "notes/a.md",
          reason: "TOKEN_RANGE_UNRESOLVED",
          unresolvedTokenIndex: 1,
        },
      }),
    ).toEqual({
      status: "unavailable",
      reason: "TOKEN_RANGE_UNRESOLVED",
      notified: false,
    });
  });

  it("keeps unavailable notification state inside the highlight state model", () => {
    const unavailable = transitionSourceHighlightUnavailable({ status: "ready" }, "adapter lost");
    expect(shouldNotifySourceHighlightUnavailable(unavailable)).toBe(true);

    const notified = markSourceHighlightUnavailableNotified(unavailable);
    expect(notified).toEqual({
      status: "unavailable",
      reason: "adapter lost",
      notified: true,
    });
    expect(shouldNotifySourceHighlightUnavailable(notified)).toBe(false);
    expect(transitionSourceHighlightUnavailable(notified, "second error")).toBe(notified);
  });
});
