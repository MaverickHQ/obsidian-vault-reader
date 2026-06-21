import type { TFile } from "obsidian";

export type ReadingSourceKind = "editor-selection" | "active-note";

export type SourceResolveErrorCode = "NO_ACTIVE_FILE" | "EMPTY_SOURCE_TEXT" | "READ_FAILED";
export type SourceCaptureDiagnosticCode =
  | "SOURCE_SELECTION_EMPTY"
  | "SOURCE_SELECTION_CAPTURE_FAILED"
  | "SOURCE_SELECTION_METADATA_UNAVAILABLE"
  | "SOURCE_READ_FAILED";

export interface SourceCaptureDiagnostic {
  code: SourceCaptureDiagnosticCode;
  message: string;
  context?: Record<string, string | number | boolean>;
}

export interface SourceFileRef {
  path: string;
  name: string;
  basename: string;
}

export interface ReadingSource {
  kind: ReadingSourceKind;
  filePath: string;
  fileName: string;
  fileBaseName: string;
  text: string;
  charLength: number;
  highlightSourceText: string;
  highlightDocumentText: string;
  highlightStartOffset: number;
  selectionRangeKey?: string;
  selectionContextKey?: string;
}

export type SourceResolution =
  | {
      ok: true;
      source: ReadingSource;
      diagnostics: SourceCaptureDiagnostic[];
    }
  | {
      ok: false;
      diagnostics: SourceCaptureDiagnostic[];
      error: {
        code: SourceResolveErrorCode;
        message: string;
      };
    };

export interface SourceResolverEnvironment {
  getActiveFile: () => SourceFileRef | null;
  getActiveSelection: () => string | SelectionCapture | null;
  readFile: (file: SourceFileRef) => Promise<string>;
}

export interface SelectionCapture {
  text: string;
  rangeKey?: string;
  contextKey?: string;
  startOffset?: number;
  documentText?: string;
}

export interface EditorCursorLike {
  line: number;
  ch: number;
}

export interface ObsidianSourceApp {
  workspace: {
    activeEditor: {
      editor?: {
        getSelection: () => string;
        getCursor?: (which?: "from" | "to") => EditorCursorLike;
        getValue?: () => string;
        posToOffset?: (pos: EditorCursorLike) => number;
      };
    } | null;
    getActiveFile: () => TFile | null;
  };
  vault: {
    getFileByPath: (path: string) => TFile | null;
    cachedRead: (file: TFile) => Promise<string>;
  };
}

export async function resolveReadingSource(
  env: SourceResolverEnvironment,
): Promise<SourceResolution> {
  const activeFile = env.getActiveFile();
  if (!activeFile) {
    return {
      ok: false,
      diagnostics: [],
      error: {
        code: "NO_ACTIVE_FILE",
        message: "Open a note before starting a Vault Reader session.",
      },
    };
  }

  const diagnostics: SourceCaptureDiagnostic[] = [];
  const selection = toReadableSelection(readActiveSelection(env, activeFile, diagnostics), {
    activeFile,
    diagnostics,
  });
  if (selection) {
    return {
      ok: true,
      diagnostics,
      source: toReadingSource(
        activeFile,
        "editor-selection",
        selection.text,
        {
          highlightSourceText: selection.text,
          highlightDocumentText: selection.documentText ?? selection.text,
          highlightStartOffset: selection.startOffset ?? 0,
        },
        selection.rangeKey,
        selection.contextKey,
      ),
    };
  }

  let noteText: string;
  try {
    noteText = await env.readFile(activeFile);
  } catch {
    diagnostics.push({
      code: "SOURCE_READ_FAILED",
      message: "Active note read failed while resolving the reader source.",
      context: {
        filePath: activeFile.path,
      },
    });
    return {
      ok: false,
      diagnostics,
      error: {
        code: "READ_FAILED",
        message: "Vault Reader could not read the active note from disk.",
      },
    };
  }

  const readableNote = toReadableTextRange(noteText);
  if (!readableNote) {
    return {
      ok: false,
      diagnostics,
      error: {
        code: "EMPTY_SOURCE_TEXT",
        message: "The active note is empty. Add content or select text before starting a session.",
      },
    };
  }

  return {
    ok: true,
    diagnostics,
    source: toReadingSource(activeFile, "active-note", readableNote.text, {
      highlightSourceText: readableNote.text,
      highlightDocumentText: noteText,
      highlightStartOffset: readableNote.startOffset,
    }),
  };
}

function readActiveSelection(
  env: SourceResolverEnvironment,
  activeFile: SourceFileRef,
  diagnostics: SourceCaptureDiagnostic[],
): string | SelectionCapture | null {
  try {
    return env.getActiveSelection();
  } catch {
    diagnostics.push({
      code: "SOURCE_SELECTION_CAPTURE_FAILED",
      message: "Editor selection capture failed; using the active note.",
      context: {
        filePath: activeFile.path,
      },
    });
    return null;
  }
}

export function getActiveEditorSelection(app: ObsidianSourceApp): SelectionCapture | null {
  try {
    return captureActiveEditorSelection(app);
  } catch {
    return null;
  }
}

function captureActiveEditorSelection(app: ObsidianSourceApp): SelectionCapture | null {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) {
    return null;
  }

  const rawSelection = editor.getSelection();
  if (!toReadableText(rawSelection)) {
    return null;
  }

  const selectionKeys = toSelectionKeys(editor);
  const selectionOffsets = toSelectionOffsets(editor);
  return selectionKeys.rangeKey
    ? {
        text: rawSelection,
        rangeKey: selectionKeys.rangeKey,
        ...selectionOffsets,
      }
    : {
        text: rawSelection,
        contextKey: selectionKeys.contextKey,
        ...selectionOffsets,
      };
}

export function createObsidianSourceEnvironment(app: ObsidianSourceApp): SourceResolverEnvironment {
  return {
    getActiveFile: () => {
      const file = app.workspace.getActiveFile();
      return file ? toSourceFileRef(file) : null;
    },
    getActiveSelection: () => captureActiveEditorSelection(app),
    readFile: async (fileRef: SourceFileRef) => {
      const file = app.vault.getFileByPath(fileRef.path);
      if (!file) {
        throw new Error(`File not found in vault: ${fileRef.path}`);
      }
      return app.vault.cachedRead(file);
    },
  };
}

export async function resolveObsidianReadingSource(
  app: ObsidianSourceApp,
): Promise<SourceResolution> {
  return resolveReadingSource(createObsidianSourceEnvironment(app));
}

function toSourceFileRef(file: TFile | SourceFileRef): SourceFileRef {
  return {
    path: file.path,
    name: file.name,
    basename: file.basename,
  };
}

function toReadableText(candidate: string | null): string | null {
  return toReadableTextRange(candidate)?.text ?? null;
}

function toReadableTextRange(
  candidate: string | null,
): { text: string; startOffset: number } | null {
  if (!candidate) {
    return null;
  }

  const leadingTrimLength = candidate.length - candidate.trimStart().length;
  const normalizedCandidate = candidate.replace(/\r\n/g, "\n").trim();
  return normalizedCandidate.length > 0
    ? {
        text: normalizedCandidate,
        startOffset: leadingTrimLength,
      }
    : null;
}

function toReadableSelection(
  candidate: string | SelectionCapture | null,
  options: {
    activeFile: SourceFileRef;
    diagnostics: SourceCaptureDiagnostic[];
  },
): SelectionCapture | null {
  if (typeof candidate === "string") {
    const readable = toReadableTextRange(candidate);
    if (!readable) {
      pushSelectionEmptyDiagnostic(options);
      return null;
    }

    pushSelectionMetadataUnavailableDiagnostic(options, readable.text.length);
    return {
      text: readable.text,
      startOffset: readable.startOffset,
      documentText: candidate,
    };
  }

  if (!candidate || typeof candidate.text !== "string") {
    pushSelectionEmptyDiagnostic(options);
    return null;
  }

  const readable = toReadableTextRange(candidate.text);
  if (!readable) {
    pushSelectionEmptyDiagnostic(options);
    return null;
  }

  if (!candidate.rangeKey && !candidate.contextKey) {
    pushSelectionMetadataUnavailableDiagnostic(options, readable.text.length);
  }

  return {
    text: readable.text,
    rangeKey: candidate.rangeKey,
    contextKey: candidate.contextKey,
    startOffset:
      typeof candidate.startOffset === "number" && Number.isFinite(candidate.startOffset)
        ? candidate.startOffset + readable.startOffset
        : readable.startOffset,
    documentText: candidate.documentText ?? candidate.text,
  };
}

function pushSelectionEmptyDiagnostic(options: {
  activeFile: SourceFileRef;
  diagnostics: SourceCaptureDiagnostic[];
}): void {
  options.diagnostics.push({
    code: "SOURCE_SELECTION_EMPTY",
    message: "No readable editor selection was available; using the active note.",
    context: {
      filePath: options.activeFile.path,
    },
  });
}

function pushSelectionMetadataUnavailableDiagnostic(
  options: {
    activeFile: SourceFileRef;
    diagnostics: SourceCaptureDiagnostic[];
  },
  selectionLength: number,
): void {
  options.diagnostics.push({
    code: "SOURCE_SELECTION_METADATA_UNAVAILABLE",
    message: "Selection metadata was unavailable; using an anonymous selection key.",
    context: {
      filePath: options.activeFile.path,
      selectionLength,
    },
  });
}

function toReadingSource(
  file: SourceFileRef,
  kind: ReadingSourceKind,
  text: string,
  highlight: {
    highlightSourceText: string;
    highlightDocumentText: string;
    highlightStartOffset: number;
  },
  selectionRangeKey?: string,
  selectionContextKey?: string,
): ReadingSource {
  return {
    kind,
    filePath: file.path,
    fileName: file.name,
    fileBaseName: file.basename,
    text,
    charLength: text.length,
    ...highlight,
    selectionRangeKey,
    selectionContextKey,
  };
}

function toSelectionKeys(editor: { getCursor?: (which?: "from" | "to") => EditorCursorLike }): {
  rangeKey?: string;
  contextKey?: string;
} {
  if (!editor.getCursor) {
    return {};
  }

  try {
    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    if (isCursorLike(from) && isCursorLike(to)) {
      return {
        rangeKey: `from:${from.line}:${from.ch}-to:${to.line}:${to.ch}`,
      };
    }

    const cursor = editor.getCursor();
    if (!isCursorLike(cursor)) {
      return {};
    }

    return {
      contextKey: `cursor:${cursor.line}:${cursor.ch}`,
    };
  } catch {
    return {};
  }
}

function toSelectionOffsets(editor: {
  getCursor?: (which?: "from" | "to") => EditorCursorLike;
  getValue?: () => string;
  posToOffset?: (pos: EditorCursorLike) => number;
}): { startOffset?: number; documentText?: string } {
  if (!editor.getCursor || !editor.getValue || !editor.posToOffset) {
    return {};
  }

  try {
    const from = editor.getCursor("from");
    if (!isCursorLike(from)) {
      return {};
    }

    const startOffset = editor.posToOffset(from);
    if (!Number.isFinite(startOffset)) {
      return {};
    }

    return {
      startOffset,
      documentText: editor.getValue(),
    };
  } catch {
    return {};
  }
}

function isCursorLike(cursor: unknown): cursor is EditorCursorLike {
  if (typeof cursor !== "object" || cursor === null) {
    return false;
  }

  const record = cursor as Record<string, unknown>;
  return (
    typeof record.line === "number" && Number.isFinite(record.line) && typeof record.ch === "number"
  );
}
