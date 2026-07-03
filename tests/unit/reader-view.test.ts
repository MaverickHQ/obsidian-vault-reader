import { describe, expect, it } from "vitest";

import {
  buildReplaySessionPayload,
  buildOrpRenderParts,
  buildReaderProgress,
  resolvePanelZoomBounds,
  resolveReaderKeyAction,
  shouldHandleReaderKeyEvent,
} from "../../src/reader/reader-view-model";

describe("reader-view behavior helpers", () => {
  it("builds ORP render parts from spoken token and index", () => {
    expect(buildOrpRenderParts("quick", 1)).toEqual({
      prefix: "q",
      focus: "u",
      suffix: "ick",
    });
  });

  it("gracefully handles empty spoken tokens", () => {
    expect(buildOrpRenderParts("", 0)).toEqual({
      prefix: "",
      focus: "",
      suffix: "",
    });
  });

  it("computes progress label and percent for zero-based token index", () => {
    expect(buildReaderProgress(1, 5)).toEqual({
      label: "2 / 5",
      percent: 40,
    });
  });

  it("maps keyboard shortcuts to reader actions", () => {
    expect(resolveReaderKeyAction(" ")).toBe("toggle-play-pause");
    expect(resolveReaderKeyAction("k")).toBe("toggle-play-pause");
    expect(resolveReaderKeyAction("Escape")).toBe("stop");
    expect(resolveReaderKeyAction("ArrowUp")).toBe("faster");
    expect(resolveReaderKeyAction("ArrowDown")).toBe("slower");
    expect(resolveReaderKeyAction("x")).toBeNull();
  });

  it("ignores reader shortcuts when an editable control has focus", () => {
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "INPUT",
        isContentEditable: false,
      }),
    ).toBe(false);
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "TEXTAREA",
        isContentEditable: false,
      }),
    ).toBe(false);
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "SELECT",
        isContentEditable: false,
      }),
    ).toBe(false);
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "DIV",
        isContentEditable: true,
      }),
    ).toBe(false);
  });

  it("ignores reader shortcuts when modifier keys are pressed", () => {
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "DIV",
        isContentEditable: false,
        metaKey: true,
      }),
    ).toBe(false);
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "DIV",
        isContentEditable: false,
        ctrlKey: true,
      }),
    ).toBe(false);
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "DIV",
        isContentEditable: false,
        altKey: true,
      }),
    ).toBe(false);
  });

  it("builds replay payload with reset index and current WPM", () => {
    const replay = buildReplaySessionPayload(
      {
        sourceKey: "notes/a.md",
        title: "a",
        tokens: [],
        startIndex: 12,
        wpm: 320,
      },
      450,
    );

    expect(replay.startIndex).toBe(0);
    expect(replay.wpm).toBe(450);
  });

  it("caps panel zoom max to the viewport fit ratio", () => {
    const bounds = resolvePanelZoomBounds({
      desiredZoom: 140,
      minZoom: 80,
      maxZoom: 140,
      step: 5,
      containerWidth: 900,
      containerHeight: 600,
      shellBaseWidth: 800,
      shellBaseHeight: 700,
    });

    expect(bounds).toEqual({
      min: 80,
      max: 85,
      value: 85,
    });
  });

  it("keeps zoom controls valid when fit max falls below static minimum", () => {
    const bounds = resolvePanelZoomBounds({
      desiredZoom: 100,
      minZoom: 80,
      maxZoom: 140,
      step: 5,
      containerWidth: 280,
      containerHeight: 200,
      shellBaseWidth: 700,
      shellBaseHeight: 700,
    });

    expect(bounds).toEqual({
      min: 25,
      max: 25,
      value: 25,
    });
  });

  it("falls back to static zoom limits when dimensions are unavailable", () => {
    const bounds = resolvePanelZoomBounds({
      desiredZoom: 200,
      minZoom: 80,
      maxZoom: 140,
      step: 5,
      containerWidth: 0,
      containerHeight: 0,
      shellBaseWidth: 0,
      shellBaseHeight: 0,
    });

    expect(bounds).toEqual({
      min: 80,
      max: 140,
      value: 140,
    });
  });
});
