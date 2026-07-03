import { describe, expect, it, vi } from "vitest";

import {
  resolveReadingSource,
  type SourceFileRef,
  type SourceResolverEnvironment,
} from "../../src/reader/source-resolver";

const activeFile: SourceFileRef = {
  path: "inbox/today.md",
  name: "today.md",
  basename: "today",
};

function createEnv(overrides: Partial<SourceResolverEnvironment> = {}): SourceResolverEnvironment {
  return {
    getActiveFile: () => activeFile,
    getActiveSelection: () => null,
    readFile: async () => "default file content",
    ...overrides,
  };
}

describe("resolveReadingSource", () => {
  it("prefers editor selection when available", async () => {
    const readFile = vi.fn(async () => "file body should not be read");
    const env = createEnv({
      getActiveSelection: () => "Selected sentence.",
      readFile,
    });

    const result = await resolveReadingSource(env);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.kind).toBe("editor-selection");
    expect(result.source.text).toBe("Selected sentence.");
    expect(result.source.filePath).toBe("inbox/today.md");
    expect(result.source.highlightSourceText).toBe("Selected sentence.");
    expect(result.source.highlightDocumentText).toBe("Selected sentence.");
    expect(result.source.highlightStartOffset).toBe(0);
    expect(readFile).not.toHaveBeenCalled();
  });

  it("keeps selection range metadata when provided by the editor adapter", async () => {
    const env = createEnv({
      getActiveSelection: () => ({
        text: "Selected sentence.",
        rangeKey: "from:2:1-to:2:19",
      }),
    });

    const result = await resolveReadingSource(env);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.kind).toBe("editor-selection");
    expect(result.source.selectionRangeKey).toBe("from:2:1-to:2:19");
  });

  it("keeps selection context metadata when range metadata is unavailable", async () => {
    const env = createEnv({
      getActiveSelection: () => ({
        text: "Selected sentence.",
        contextKey: "cursor:8:3",
      }),
    });

    const result = await resolveReadingSource(env);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.kind).toBe("editor-selection");
    expect(result.source.selectionContextKey).toBe("cursor:8:3");
  });

  it("falls back to active note content when selection is missing", async () => {
    const env = createEnv({
      getActiveSelection: () => "   ",
      readFile: async () => "# Heading\n\nFull note body",
    });

    const result = await resolveReadingSource(env);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.kind).toBe("active-note");
    expect(result.source.text).toContain("Full note body");
    expect(result.source.charLength).toBe(result.source.text.length);
    expect(result.source.highlightDocumentText).toBe("# Heading\n\nFull note body");
    expect(result.source.highlightStartOffset).toBe(0);
    expect(result.diagnostics).toContainEqual({
      code: "SOURCE_SELECTION_EMPTY",
      message: "No readable editor selection was available; using the active note.",
      context: {
        filePath: "inbox/today.md",
      },
    });
  });

  it("records a diagnostic when selection metadata is unavailable", async () => {
    const env = createEnv({
      getActiveSelection: () => ({
        text: "Selected private sentence.",
      }),
    });

    const result = await resolveReadingSource(env);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.kind).toBe("editor-selection");
    expect(result.source.selectionRangeKey).toBeUndefined();
    expect(result.source.selectionContextKey).toBeUndefined();
    expect(result.diagnostics).toContainEqual({
      code: "SOURCE_SELECTION_METADATA_UNAVAILABLE",
      message: "Selection metadata was unavailable; using an anonymous selection key.",
      context: {
        filePath: "inbox/today.md",
        selectionLength: 26,
      },
    });
    expect(JSON.stringify(result.diagnostics)).not.toContain("Selected private sentence.");
  });

  it("tracks trimmed active-note offsets for in-note highlighting", async () => {
    const env = createEnv({
      readFile: async () => "\n\n  Leading note body  \n",
    });

    const result = await resolveReadingSource(env);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful source resolution");
    }

    expect(result.source.text).toBe("Leading note body");
    expect(result.source.highlightSourceText).toBe("Leading note body");
    expect(result.source.highlightStartOffset).toBe(4);
  });

  it("returns a graceful error when there is no active file", async () => {
    const env = createEnv({
      getActiveFile: () => null,
    });

    const result = await resolveReadingSource(env);

    expect(result).toEqual({
      ok: false,
      diagnostics: [],
      error: {
        code: "NO_ACTIVE_FILE",
        message: "Open a note before starting a Vault Reader session.",
      },
    });
  });

  it("returns a graceful error when the active source text is empty", async () => {
    const env = createEnv({
      readFile: async () => "\n   \n",
    });

    const result = await resolveReadingSource(env);

    expect(result).toEqual({
      ok: false,
      diagnostics: [
        {
          code: "SOURCE_SELECTION_EMPTY",
          message: "No readable editor selection was available; using the active note.",
          context: {
            filePath: "inbox/today.md",
          },
        },
      ],
      error: {
        code: "EMPTY_SOURCE_TEXT",
        message: "The active note is empty. Add content or select text before starting a session.",
      },
    });
  });

  it("returns a read error with structured diagnostics when the vault read fails", async () => {
    const env = createEnv({
      readFile: async () => {
        throw new Error("disk unavailable");
      },
    });

    const result = await resolveReadingSource(env);

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected read failure");
    }

    expect(result.error.code).toBe("READ_FAILED");
    expect(result.error.message).toBe("Vault Reader could not read the active note from disk.");
    expect(result.diagnostics).toContainEqual({
      code: "SOURCE_READ_FAILED",
      message: "Active note read failed while resolving the reader source.",
      context: {
        filePath: "inbox/today.md",
      },
    });
    expect(JSON.stringify(result.diagnostics)).not.toContain("default file content");
  });
});
