// @vitest-environment jsdom

import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";

import {
  applyVaultReaderEditorHighlight,
  hasVaultReaderEditorHighlightExtension,
} from "../../src/reader/source-highlight-extension";

describe("Vault Reader CodeMirror highlight extension", () => {
  it("lazily installs the highlight extension into an existing editor before applying a range", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const editorView = new EditorView({
      state: EditorState.create({
        doc: "One two three",
      }),
      parent,
    });

    try {
      expect(hasVaultReaderEditorHighlightExtension(editorView)).toBe(false);

      applyVaultReaderEditorHighlight(editorView, { from: 4, to: 7, color: "orange" });

      expect(hasVaultReaderEditorHighlightExtension(editorView)).toBe(true);
      const highlight = parent.querySelector(".vault-reader-editor-highlight");
      expect(highlight?.textContent).toBe("two");
      expect(highlight?.classList.contains("vault-reader-editor-highlight-orange")).toBe(true);

      applyVaultReaderEditorHighlight(editorView, null);

      expect(parent.querySelector(".vault-reader-editor-highlight")).toBeNull();
    } finally {
      editorView.destroy();
      parent.remove();
    }
  });

  it("treats clear as a no-op when the highlight extension is not installed", () => {
    const editorView = new EditorView({
      state: EditorState.create({
        doc: "One two",
      }),
    });

    try {
      expect(() => applyVaultReaderEditorHighlight(editorView, null)).not.toThrow();
      expect(hasVaultReaderEditorHighlightExtension(editorView)).toBe(false);
    } finally {
      editorView.destroy();
    }
  });
});
