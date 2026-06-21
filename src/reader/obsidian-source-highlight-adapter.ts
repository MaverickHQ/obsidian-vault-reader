import type { EditorView } from "@codemirror/view";

import { applyVaultReaderEditorHighlight } from "./source-highlight-extension";
import type { SourceHighlightAdapter } from "./source-highlighter";
import type { EditorHighlightRange } from "./source-highlight-map";

export interface ObsidianHighlightApp {
  workspace: {
    activeEditor: {
      editor?: unknown;
    } | null;
  };
}

export function createObsidianSourceHighlightAdapter(
  editorView: EditorView,
): SourceHighlightAdapter {
  return {
    apply: (range: EditorHighlightRange) => {
      applyVaultReaderEditorHighlight(editorView, range);
    },
    clear: () => {
      applyVaultReaderEditorHighlight(editorView, null);
    },
  };
}

export function getActiveObsidianEditorView(app: ObsidianHighlightApp): EditorView | null {
  const editor = app.workspace.activeEditor?.editor as { cm?: EditorView } | undefined;
  const editorView = editor?.cm;
  if (!editorView) {
    return null;
  }

  return editorView;
}
