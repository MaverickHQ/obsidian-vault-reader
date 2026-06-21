import { describe, expect, it, vi } from "vitest";
import type { EditorView } from "@codemirror/view";

import {
  createObsidianSourceHighlightAdapter,
  getActiveObsidianEditorView,
  type ObsidianHighlightApp,
} from "../../src/reader/obsidian-source-highlight-adapter";

describe("Obsidian source highlight adapter", () => {
  it("applies and clears highlights against the captured source editor view", () => {
    const dispatch = vi.fn();
    const sourceEditorView = {
      state: {
        field: vi.fn(() => ({})),
      },
      dispatch,
    } as unknown as EditorView;

    const adapter = createObsidianSourceHighlightAdapter(sourceEditorView);

    adapter.apply({ from: 4, to: 9 });
    adapter.clear();

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0]?.[0]).toHaveProperty("effects");
    expect(dispatch.mock.calls[1]?.[0]).toHaveProperty("effects");
  });

  it("captures the active source editor before focus moves to the reader pane", () => {
    const sourceEditorView = {
      state: {
        field: vi.fn(() => ({})),
      },
      dispatch: vi.fn(),
    } as unknown as EditorView;
    const app: ObsidianHighlightApp = {
      workspace: {
        activeEditor: {
          editor: {
            cm: sourceEditorView,
          },
        },
      },
    };

    const captured = getActiveObsidianEditorView(app);
    if (!captured) {
      throw new Error("expected source editor view");
    }
    app.workspace.activeEditor = {
      editor: {},
    };

    const adapter = createObsidianSourceHighlightAdapter(captured);
    expect(() => adapter.clear()).not.toThrow();
  });

  it("returns null when no source editor view is available", () => {
    expect(
      getActiveObsidianEditorView({
        workspace: {
          activeEditor: null,
        },
      }),
    ).toBeNull();
  });
});
