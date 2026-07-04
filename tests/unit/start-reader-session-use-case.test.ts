import { describe, expect, it, vi } from "vitest";

import { startReaderSession } from "../../src/reader/start-reader-session-use-case";
import type { SourceResolution } from "../../src/reader/source-resolver";
import type { VaultReaderSessionView } from "../../src/reader/reader-view";

function createSourceResolution(text: string): SourceResolution {
  return {
    ok: true,
    diagnostics: [],
    source: {
      kind: "active-note",
      filePath: "notes/source.md",
      fileName: "source.md",
      fileBaseName: "source",
      text,
      charLength: text.length,
      highlightSourceText: text,
      highlightDocumentText: text,
      highlightStartOffset: 0,
    },
  };
}

describe("startReaderSession", () => {
  it("returns source errors without opening the reader view", async () => {
    const activateReaderView = vi.fn();

    const result = await startReaderSession({
      resolveSource: async () => ({
        ok: false,
        diagnostics: [],
        error: {
          code: "NO_ACTIVE_FILE",
          message: "Open a note before starting a Vault Reader session.",
        },
      }),
      captureSourceHighlighter: vi.fn(),
      activateReaderView,
      getDefaultWpm: () => 300,
    });

    expect(result).toEqual({
      ok: false,
      code: "NO_ACTIVE_FILE",
      message: "Open a note before starting a Vault Reader session.",
    });
    expect(activateReaderView).not.toHaveBeenCalled();
  });

  it("returns TOKENIZATION_EMPTY without opening the reader view", async () => {
    const activateReaderView = vi.fn();

    const result = await startReaderSession({
      resolveSource: async () => createSourceResolution("----"),
      captureSourceHighlighter: vi.fn(),
      activateReaderView,
      getDefaultWpm: () => 300,
    });

    expect(result).toEqual({
      ok: false,
      code: "TOKENIZATION_EMPTY",
      message:
        "Vault Reader could not create tokens from this source. Try a different note or selection.",
    });
    expect(activateReaderView).not.toHaveBeenCalled();
  });

  it("builds the session payload and captures the source highlighter before activation", async () => {
    const callOrder: string[] = [];
    const setSession = vi.fn<VaultReaderSessionView["setSession"]>(async () => undefined);
    const view: VaultReaderSessionView = {
      vaultReaderRuntimeId: "vault-reader-view-runtime/v2.6-highlight-safe",
      setSession,
    };
    const sourceHighlighter = {
      apply: vi.fn(),
      clear: vi.fn(),
    };

    const result = await startReaderSession({
      resolveSource: async () => {
        callOrder.push("resolve");
        return createSourceResolution("One two");
      },
      captureSourceHighlighter: () => {
        callOrder.push("capture");
        return sourceHighlighter;
      },
      activateReaderView: async () => {
        callOrder.push("activate");
        return view;
      },
      getDefaultWpm: () => 420,
    });

    expect(callOrder).toEqual(["capture", "resolve", "activate"]);
    expect(result).toEqual({
      ok: true,
      code: "SESSION_STARTED",
      tokenCount: 2,
      title: "source",
    });
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKey: "notes/source.md",
        title: "source",
        sourceHighlighter,
        wpm: 420,
      }),
    );
    const sessionPayload = setSession.mock.calls[0]?.[0];
    expect(sessionPayload).toBeDefined();
    if (!sessionPayload) {
      throw new Error("expected setSession payload");
    }

    expect(sessionPayload.tokens).toHaveLength(2);
    expect(sessionPayload.highlightMap).toEqual(
      expect.objectContaining({
        ok: true,
        sourceKey: "notes/source.md",
      }),
    );
  });

  it("captures the source highlighter before async source resolution can yield focus", async () => {
    const callOrder: string[] = [];
    const setSession = vi.fn<VaultReaderSessionView["setSession"]>(async () => undefined);
    const view: VaultReaderSessionView = {
      vaultReaderRuntimeId: "vault-reader-view-runtime/v2.6-highlight-safe",
      setSession,
    };
    const sourceHighlighter = {
      apply: vi.fn(),
      clear: vi.fn(),
    };

    await startReaderSession({
      resolveSource: async () => {
        callOrder.push("resolve-start");
        await Promise.resolve();
        callOrder.push("resolve-finish");
        return createSourceResolution("One two");
      },
      captureSourceHighlighter: () => {
        callOrder.push("capture");
        return sourceHighlighter;
      },
      activateReaderView: async () => {
        callOrder.push("activate");
        return view;
      },
      getDefaultWpm: () => 300,
    });

    expect(callOrder).toEqual(["capture", "resolve-start", "resolve-finish", "activate"]);
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceHighlighter,
      }),
    );
  });
});
