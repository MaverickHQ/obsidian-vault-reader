// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { VaultReaderView } from "../../src/reader/reader-view";
import { ReaderSourceHighlighter } from "../../src/reader/source-highlighter";
import { tokenizeReadingText } from "../../src/reader/tokenizer";
import type { VaultReaderSettings } from "../../src/settings/vault-reader-data-store";
import { VAULT_READER_COPY } from "../../src/ui/copy";
import {
  createHighlightMap,
  createPositionStore,
  createReaderViewHarness,
  createRect,
  createSettingsStore,
  flushReaderViewPromises,
} from "../helpers/reader-view-harness";

describe("VaultReaderView runtime behavior", () => {
  it("can be exercised through the public reader view harness", async () => {
    const harness = createReaderViewHarness();
    await harness.open();
    await harness.setTextSession("One two three");

    harness.pressKey(" ");
    await flushReaderViewPromises();

    expect(harness.query(".vault-reader-state").textContent).toContain("PLAYING");

    harness.clickButton("Stop");
    await flushReaderViewPromises();

    expect(harness.query(".vault-reader-state").textContent).toContain("IDLE");
    expect(harness.notices).toEqual([]);

    await harness.close();
  });

  it("renders a framed shell panel with structured header/body controls", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
    });

    await view.onOpen();

    expect(view.contentEl.querySelector(".vault-reader-shell")).toBeTruthy();
    expect(view.contentEl.querySelector(".vault-reader-shell-header")).toBeTruthy();
    expect(view.contentEl.querySelector(".vault-reader-shell-body")).toBeTruthy();
    expect(view.contentEl.querySelector(".vault-reader-shell-controls")).toBeTruthy();
    expect(view.contentEl.textContent).toContain("Text");
    expect(view.contentEl.textContent).toContain("Zoom");
    expect(view.contentEl.querySelector(".vault-reader-typography-slider")).toBeTruthy();
    expect(view.contentEl.querySelector(".vault-reader-panel-zoom-slider")).toBeTruthy();
  });

  it("renders a usable UI even if setSession runs before onOpen", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
    });

    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two three"),
      wpm: 300,
    });

    expect(view.contentEl.querySelector(".vault-reader-title")?.textContent).toContain("a");
    expect(view.contentEl.querySelectorAll("button").length).toBeGreaterThan(0);
  });

  it("renders and controls a session through UI events", async () => {
    const notices: string[] = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      notify: (message) => {
        notices.push(message);
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two three"),
      wpm: 300,
    });

    const keyboardPlay = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
    });
    view.contentEl.dispatchEvent(keyboardPlay);
    await Promise.resolve();

    const stateEl = view.contentEl.querySelector(".vault-reader-state");
    expect(stateEl?.textContent).toContain("PLAYING");

    const stopButton = Array.from(view.contentEl.querySelectorAll("button")).find(
      (button) => button.textContent === "Stop",
    );
    expect(stopButton).toBeDefined();
    stopButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushReaderViewPromises();

    expect(stateEl?.textContent).toContain("IDLE");
    expect(notices).toEqual([]);

    await view.onClose();
  });

  it("keeps the loaded session when the active note changes and play is pressed", async () => {
    let activeSourceKey = "notes/original.md";
    const startCurrentNoteSession = vi.fn(async () => undefined);
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      getActiveSourceKey: () => activeSourceKey,
      startCurrentNoteSession,
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/original.md",
      title: "original",
      tokens: tokenizeReadingText("Original note words"),
      wpm: 300,
    });

    expect(view.contentEl.querySelector(".vault-reader-source-label")?.textContent).toBe(
      "Reading: original",
    );
    expect(view.contentEl.querySelector<HTMLElement>(".vault-reader-source-mismatch")?.hidden).toBe(
      true,
    );

    activeSourceKey = "notes/new-note.md";
    const playButton = Array.from(view.contentEl.querySelectorAll("button")).find(
      (button) => button.textContent === "Play",
    );
    playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushReaderViewPromises();

    expect(view.contentEl.querySelector(".vault-reader-state")?.textContent).toContain("PLAYING");
    expect(view.contentEl.querySelector(".vault-reader-token")?.textContent).toContain("Original");
    expect(view.contentEl.querySelector<HTMLElement>(".vault-reader-source-mismatch")?.hidden).toBe(
      false,
    );
    expect(view.contentEl.textContent).toContain("Active note changed.");
    expect(startCurrentNoteSession).not.toHaveBeenCalled();

    await view.onClose();
  });

  it("reloads the active note only when the explicit read-current-note action is clicked", async () => {
    let activeSourceKey = "notes/new-note.md";
    const startCurrentNoteSession = vi.fn(async () => undefined);
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      getActiveSourceKey: () => activeSourceKey,
      startCurrentNoteSession,
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/original.md",
      title: "original",
      tokens: tokenizeReadingText("Original note words"),
      wpm: 300,
    });

    expect(view.contentEl.querySelector<HTMLElement>(".vault-reader-source-mismatch")?.hidden).toBe(
      false,
    );
    const readCurrentNoteButton = Array.from(view.contentEl.querySelectorAll("button")).find(
      (button) => button.textContent === "Read current note",
    );
    readCurrentNoteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushReaderViewPromises();

    expect(startCurrentNoteSession).toHaveBeenCalledTimes(1);

    activeSourceKey = "notes/original.md";
    await view.setSession({
      sourceKey: "notes/original.md",
      title: "original",
      tokens: tokenizeReadingText("Original note words"),
      wpm: 300,
    });
    expect(view.contentEl.querySelector<HTMLElement>(".vault-reader-source-mismatch")?.hidden).toBe(
      true,
    );

    await view.onClose();
  });

  it("updates source highlighting as the reader session advances and clears on stop", async () => {
    vi.useFakeTimers();

    const applyHighlight = vi.fn();
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      sourceHighlighter: {
        apply: applyHighlight,
        clear: () => applyHighlight(null),
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/highlight.md",
      title: "highlight",
      tokens: tokenizeReadingText("One two three"),
      highlightMap: createHighlightMap(),
      wpm: 600,
    });

    expect(applyHighlight).toHaveBeenLastCalledWith({ from: 0, to: 3, color: "yellow" });

    view.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await vi.advanceTimersByTimeAsync(120);
    await Promise.resolve();

    expect(applyHighlight).toHaveBeenLastCalledWith({ from: 4, to: 7, color: "yellow" });

    const stopButton = Array.from(view.contentEl.querySelectorAll("button")).find(
      (button) => button.textContent === "Stop",
    );
    stopButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushReaderViewPromises();

    expect(applyHighlight).toHaveBeenLastCalledWith(null);

    await view.onClose();
    vi.useRealTimers();
  });

  it("restarts the current session from the first token and persists position zero", async () => {
    vi.useFakeTimers();

    const savedPositions = new Map<string, number>();
    const applyHighlight = vi.fn();
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: {
        load: (sourceKey) => savedPositions.get(sourceKey) ?? null,
        save: (sourceKey, tokenIndex) => {
          savedPositions.set(sourceKey, tokenIndex);
        },
      },
      sourceHighlighter: {
        apply: applyHighlight,
        clear: () => applyHighlight(null),
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/highlight.md",
      title: "highlight",
      tokens: tokenizeReadingText("One two three"),
      highlightMap: createHighlightMap(),
      wpm: 600,
    });

    view.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await vi.advanceTimersByTimeAsync(120);
    await flushReaderViewPromises();
    expect(view.contentEl.querySelector(".vault-reader-progress")?.textContent).toContain("2 / 3");
    expect(applyHighlight).toHaveBeenLastCalledWith({ from: 4, to: 7, color: "yellow" });

    const restartButton = Array.from(view.contentEl.querySelectorAll("button")).find(
      (button) => button.textContent === "Restart",
    );
    expect(restartButton).toBeDefined();
    restartButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushReaderViewPromises();

    expect(view.contentEl.querySelector(".vault-reader-progress")?.textContent).toContain("1 / 3");
    expect(view.contentEl.querySelector(".vault-reader-state")?.textContent).toContain("READY");
    expect(view.contentEl.querySelector(".vault-reader-token")?.textContent).toBe("One");
    expect(savedPositions.get("notes/highlight.md")).toBe(0);
    expect(applyHighlight).toHaveBeenLastCalledWith({ from: 0, to: 3, color: "yellow" });

    await view.onClose();
    vi.useRealTimers();
  });

  it("does not update source highlighting when the persisted toggle is disabled", async () => {
    const applyHighlight = vi.fn();
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      sourceHighlighter: {
        apply: applyHighlight,
        clear: () => applyHighlight(null),
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/highlight.md",
      title: "highlight",
      tokens: tokenizeReadingText("One two"),
      highlightMap: createHighlightMap(),
      wpm: 300,
    });

    const highlightButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Note Highlight"),
    );
    expect(highlightButton).toBeDefined();
    highlightButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    applyHighlight.mockClear();
    view.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await Promise.resolve();

    expect(applyHighlight).not.toHaveBeenCalled();
  });

  it("shows in-note highlight as unavailable when enabled without a captured source editor", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/highlight.md",
      title: "highlight",
      tokens: tokenizeReadingText("One two"),
      highlightMap: createHighlightMap(),
      wpm: 300,
    });

    expect(view.contentEl.textContent).toContain("Note Highlight Unavailable");

    await view.onClose();
  });

  it("cycles and persists the in-note highlight color while re-applying the current word", async () => {
    const applyHighlight = vi.fn();
    const updateCalls: Array<Record<string, unknown>> = [];
    let settings: VaultReaderSettings = {
      defaultWpm: 300,
      orpEnabled: true,
      typographyScale: 100,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    };
    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({ ...settings }),
        update: async (patch) => {
          updateCalls.push(patch as Record<string, unknown>);
          settings = {
            ...settings,
            ...patch,
          };
          return { ...settings };
        },
      },
      positionStore: createPositionStore(),
      sourceHighlighter: {
        apply: applyHighlight,
        clear: () => applyHighlight(null),
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/highlight.md",
      title: "highlight",
      tokens: tokenizeReadingText("One two"),
      highlightMap: createHighlightMap(),
      wpm: 300,
    });

    const colorButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Highlight Yellow"),
    );
    expect(colorButton).toBeDefined();
    colorButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(updateCalls.at(-1)).toEqual({ inNoteHighlightColor: "orange" });
    expect(colorButton?.textContent).toBe("Highlight Orange");
    expect(applyHighlight).toHaveBeenLastCalledWith({ from: 0, to: 3, color: "orange" });
  });

  it("keeps play controls functional if source highlighting crashes during playback render", async () => {
    const notices: string[] = [];
    const updateSpy = vi
      .spyOn(ReaderSourceHighlighter.prototype, "update")
      .mockImplementation((snapshot) => {
        if (snapshot.state === "PLAYING") {
          throw new Error("highlight renderer failed");
        }
      });
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
      sourceHighlighter: {
        apply: vi.fn(),
        clear: vi.fn(),
      },
      notify: (message) => {
        notices.push(message);
      },
    });

    try {
      await view.onOpen();
      await view.setSession({
        sourceKey: "notes/highlight.md",
        title: "highlight",
        tokens: tokenizeReadingText("One two three"),
        highlightMap: createHighlightMap(),
        wpm: 300,
      });

      const playButton = Array.from(view.contentEl.querySelectorAll("button")).find(
        (button) => button.textContent === "Play",
      );
      expect(playButton).toBeDefined();
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();

      expect(view.contentEl.querySelector(".vault-reader-state")?.textContent).toContain("PLAYING");
      expect(playButton?.textContent).toBe("Pause");
      expect(view.contentEl.textContent).toContain("Note Highlight Unavailable");
      expect(notices).toEqual([VAULT_READER_COPY.reader.highlightUnavailable]);
    } finally {
      updateSpy.mockRestore();
      await view.onClose();
    }
  });

  it("reports settings persistence failures through a single user-visible error notice", async () => {
    const notices: string[] = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore({ failUpdate: true }),
      positionStore: createPositionStore(),
      notify: (message) => {
        notices.push(message);
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const orpButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("ORP"),
    );
    orpButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    const stateEl = view.contentEl.querySelector(".vault-reader-state");
    expect(stateEl?.textContent).toContain("ERROR:");
    expect(notices).toEqual(["settings write failed"]);
  });

  it("renders token text with textContent and does not inject markup", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/injection.md",
      title: "injection",
      tokens: tokenizeReadingText("safe<em>word</em>safe"),
      wpm: 300,
    });

    const tokenEl = view.contentEl.querySelector(".vault-reader-token");
    expect(tokenEl?.innerHTML).not.toContain("<em>");
    expect(tokenEl?.textContent).toContain("safe<em>word</em>safe");
  });

  it("sanitizes unsafe error markup before notifying users", async () => {
    const notices: string[] = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({
          defaultWpm: 300,
          orpEnabled: true,
          typographyScale: 100,
          panelZoom: 100,
          presentationMode: "split-right",
          accentTheme: "blue",
          inNoteHighlightEnabled: true,
          inNoteHighlightColor: "yellow",
          onboardingDismissed: false,
        }),
        update: async () => {
          throw new Error("<script>alert(1)</script> boom");
        },
      },
      positionStore: createPositionStore(),
      notify: (message) => {
        notices.push(message);
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const orpButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("ORP"),
    );
    orpButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(notices).toEqual(["scriptalert(1)/script boom"]);

    const stateEl = view.contentEl.querySelector(".vault-reader-state");
    expect(stateEl?.innerHTML).not.toContain("<script>");
  });

  it("batches default WPM persistence for rapid adjustment bursts", async () => {
    vi.useFakeTimers();

    let updateCalls = 0;
    let settings: VaultReaderSettings = {
      defaultWpm: 300,
      orpEnabled: true,
      typographyScale: 100,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    };

    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({ ...settings }),
        update: async (patch) => {
          updateCalls += 1;
          settings = {
            ...settings,
            ...patch,
          };
          return { ...settings };
        },
      },
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two three"),
      wpm: 300,
    });

    for (let index = 0; index < 5; index += 1) {
      const fasterEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        bubbles: true,
      });
      view.contentEl.dispatchEvent(fasterEvent);
    }

    expect(updateCalls).toBe(0);
    await vi.advanceTimersByTimeAsync(300);
    await Promise.resolve();

    expect(updateCalls).toBe(1);
    expect(settings.defaultWpm).toBe(350);

    vi.useRealTimers();
  });

  it("does not emit duplicate notices when a playback timer ticks after a settings failure", async () => {
    vi.useFakeTimers();

    const notices: string[] = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore({ failUpdate: true }),
      positionStore: createPositionStore(),
      notify: (message) => {
        notices.push(message);
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two three"),
      wpm: 300,
    });

    view.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await Promise.resolve();

    const orpButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("ORP"),
    );
    orpButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(notices).toEqual(["settings write failed"]);

    await vi.advanceTimersByTimeAsync(1_000);
    await Promise.resolve();
    await Promise.resolve();
    expect(notices).toEqual(["settings write failed"]);

    vi.useRealTimers();
  });

  it("resets notice dedupe when a new session is loaded", async () => {
    const notices: string[] = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore({ failUpdate: true }),
      positionStore: createPositionStore(),
      notify: (message) => {
        notices.push(message);
      },
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const getOrpButton = () =>
      Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("ORP"),
      );

    getOrpButton()?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(notices).toEqual(["settings write failed"]);

    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    getOrpButton()?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(notices).toEqual(["settings write failed", "settings write failed"]);
  });

  it("toggles accent theme at runtime and persists the selected theme", async () => {
    let settings: VaultReaderSettings = {
      defaultWpm: 300,
      orpEnabled: true,
      typographyScale: 100,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    };
    const updateCalls: Array<Record<string, unknown>> = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({ ...settings }),
        update: async (patch) => {
          updateCalls.push(patch as Record<string, unknown>);
          settings = {
            ...settings,
            ...patch,
          };
          return { ...settings };
        },
      },
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const accentButton = Array.from(view.contentEl.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Accent"),
    );
    expect(accentButton).toBeDefined();
    accentButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(updateCalls.at(-1)).toEqual({ accentTheme: "claude-orange" });
    expect(view.contentEl.getAttribute("data-accent-theme")).toBe("claude-orange");
    expect(view.contentEl.style.getPropertyValue("--vault-reader-focus-color")).toBe("#D97757");
  });

  it("updates panel zoom at runtime and persists reader shell scaling", async () => {
    let settings: VaultReaderSettings = {
      defaultWpm: 300,
      orpEnabled: true,
      typographyScale: 100,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    };
    const updates: Array<Record<string, unknown>> = [];
    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({ ...settings }),
        update: async (patch) => {
          updates.push(patch as Record<string, unknown>);
          settings = {
            ...settings,
            ...patch,
          };
          return { ...settings };
        },
      },
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/zoom.md",
      title: "zoom",
      tokens: tokenizeReadingText("One two three"),
      wpm: 300,
    });

    const panelZoomInput = view.contentEl.querySelector(
      ".vault-reader-panel-zoom",
    ) as HTMLInputElement | null;
    expect(panelZoomInput).toBeTruthy();
    panelZoomInput!.value = "125";
    panelZoomInput!.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(updates.at(-1)).toEqual({ panelZoom: 125 });
    expect(view.contentEl.style.getPropertyValue("--vault-reader-shell-scale")).toBe("1.25");
  });

  it("recomputes dynamic panel zoom bounds on resize to keep controls visible", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: {
        get: () => ({
          defaultWpm: 300,
          orpEnabled: true,
          typographyScale: 100,
          panelZoom: 140,
          presentationMode: "split-right",
          accentTheme: "blue",
          inNoteHighlightEnabled: true,
          inNoteHighlightColor: "yellow",
          onboardingDismissed: false,
        }),
        update: async (patch) => ({
          defaultWpm: 300,
          orpEnabled: true,
          typographyScale: 100,
          panelZoom: typeof patch.panelZoom === "number" ? patch.panelZoom : 140,
          presentationMode: "split-right",
          accentTheme: "blue",
          inNoteHighlightEnabled: true,
          inNoteHighlightColor: "yellow",
          onboardingDismissed: false,
        }),
      },
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/zoom-fit.md",
      title: "zoom fit",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const shell = view.contentEl.querySelector(".vault-reader-shell") as HTMLElement | null;
    const numberInput = view.contentEl.querySelector(
      ".vault-reader-panel-zoom",
    ) as HTMLInputElement | null;
    const sliderInput = view.contentEl.querySelector(
      ".vault-reader-panel-zoom-slider",
    ) as HTMLInputElement | null;
    if (!shell || !numberInput || !sliderInput) {
      throw new Error("Expected zoom controls to render");
    }

    Object.defineProperty(view.contentEl, "clientWidth", {
      configurable: true,
      get: () => 420,
    });
    Object.defineProperty(view.contentEl, "clientHeight", {
      configurable: true,
      get: () => 260,
    });
    vi.spyOn(shell, "getBoundingClientRect").mockImplementation(() => createRect(600, 420));

    view.onResize();

    expect(numberInput.min).toBe("60");
    expect(numberInput.max).toBe("60");
    expect(numberInput.value).toBe("60");
    expect(sliderInput.min).toBe("60");
    expect(sliderInput.max).toBe("60");
    expect(sliderInput.value).toBe("60");
    expect(view.contentEl.style.getPropertyValue("--vault-reader-shell-scale")).toBe("0.6");
  });

  it("keeps number input in sync while dragging panel zoom slider", async () => {
    const view = new VaultReaderView({} as never, {
      settingsStore: createSettingsStore(),
      positionStore: createPositionStore(),
    });

    await view.onOpen();
    await view.setSession({
      sourceKey: "notes/zoom-sync.md",
      title: "zoom sync",
      tokens: tokenizeReadingText("One two"),
      wpm: 300,
    });

    const slider = view.contentEl.querySelector(
      ".vault-reader-panel-zoom-slider",
    ) as HTMLInputElement | null;
    const number = view.contentEl.querySelector(
      ".vault-reader-panel-zoom",
    ) as HTMLInputElement | null;

    expect(slider).toBeTruthy();
    expect(number).toBeTruthy();
    slider!.value = "130";
    slider!.dispatchEvent(new Event("input", { bubbles: true }));

    expect(number!.value).toBe("130");
  });
});
