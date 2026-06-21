import { describe, expect, it } from "vitest";
import type { TFile } from "obsidian";

import {
  getActiveEditorSelection,
  resolveObsidianReadingSource,
  type ObsidianSourceApp,
} from "../../src/reader/source-resolver";

function createMockApp(overrides: Partial<ObsidianSourceApp> = {}): ObsidianSourceApp {
  const file = {
    path: "notes/testing.md",
    name: "testing.md",
    basename: "testing",
  } as unknown as TFile;

  const app: ObsidianSourceApp = {
    workspace: {
      activeEditor: null,
      getActiveFile: () => file,
    },
    vault: {
      getFileByPath: (targetPath: string) => (targetPath === file.path ? file : null),
      cachedRead: async () => "File body text",
    },
  };

  return {
    ...app,
    ...overrides,
    workspace: {
      ...app.workspace,
      ...(overrides.workspace ?? {}),
    },
    vault: {
      ...app.vault,
      ...(overrides.vault ?? {}),
    },
  };
}

describe("Obsidian source resolution adapter", () => {
  it("safely returns null when active editor is unavailable", () => {
    const app = createMockApp();
    expect(getActiveEditorSelection(app)).toBeNull();
  });

  it("safely returns null when editor selection access throws", () => {
    const app = createMockApp({
      workspace: {
        activeEditor: {
          editor: {
            getSelection: () => {
              throw new Error("editor detached");
            },
          },
        },
        getActiveFile: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
      },
    });

    expect(getActiveEditorSelection(app)).toBeNull();
  });

  it("records a diagnostic when Obsidian selection capture throws", async () => {
    const app = createMockApp({
      workspace: {
        activeEditor: {
          editor: {
            getSelection: () => {
              throw new Error("editor detached");
            },
          },
        },
        getActiveFile: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
      },
      vault: {
        getFileByPath: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
        cachedRead: async () => "This is the active note body.",
      },
    });

    const result = await resolveObsidianReadingSource(app);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected active-note fallback");
    }

    expect(result.diagnostics).toContainEqual({
      code: "SOURCE_SELECTION_CAPTURE_FAILED",
      message: "Editor selection capture failed; using the active note.",
      context: {
        filePath: "notes/testing.md",
      },
    });
  });

  it("reads from active note when no selection exists", async () => {
    const app = createMockApp({
      workspace: {
        activeEditor: {
          editor: {
            getSelection: () => "   ",
          },
        },
        getActiveFile: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
      },
      vault: {
        getFileByPath: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
        cachedRead: async () => "This is the active note body.",
      },
    });

    const result = await resolveObsidianReadingSource(app);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected successful active note resolution");
    }

    expect(result.source.kind).toBe("active-note");
    expect(result.source.filePath).toBe("notes/testing.md");
    expect(result.source.text).toContain("active note body");
    expect(result.source.highlightDocumentText).toBe("This is the active note body.");
    expect(result.source.highlightStartOffset).toBe(0);
  });

  it("captures selection start offsets from the active editor when available", () => {
    const documentText = "Before\nSelected sentence.\nAfter";
    const selectionText = "Selected sentence.";
    const app = createMockApp({
      workspace: {
        activeEditor: {
          editor: {
            getSelection: () => selectionText,
            getValue: () => documentText,
            getCursor: (which?: "from" | "to") =>
              which === "to" ? { line: 1, ch: selectionText.length } : { line: 1, ch: 0 },
            posToOffset: (position) => (position.line === 1 ? "Before\n".length + position.ch : 0),
          },
        },
        getActiveFile: () =>
          ({
            path: "notes/testing.md",
            name: "testing.md",
            basename: "testing",
          }) as unknown as TFile,
      },
    });

    expect(getActiveEditorSelection(app)).toEqual({
      text: selectionText,
      rangeKey: "from:1:0-to:1:18",
      startOffset: "Before\n".length,
      documentText,
    });
  });
});
