import { normalizeMarkdownToReadingText } from "./markdown-normalizer";
import type { VaultReaderSessionView } from "./reader-view";
import { buildTokenHighlightMap } from "./source-highlight-map";
import type { SourceResolution, SourceResolveErrorCode } from "./source-resolver";
import { buildReadingSourceKey } from "./source-key";
import type { SourceHighlightAdapter } from "./source-highlighter";
import { tokenizeReadingText } from "./tokenizer";

export type StartReaderSessionErrorCode =
  | SourceResolveErrorCode
  | "TOKENIZATION_EMPTY"
  | "VIEW_UNAVAILABLE";

export type StartReaderSessionResult =
  | {
      ok: true;
      code: "SESSION_STARTED";
      tokenCount: number;
      title: string;
    }
  | {
      ok: false;
      code: StartReaderSessionErrorCode;
      message: string;
    };

export interface StartReaderSessionDependencies {
  resolveSource: () => Promise<SourceResolution>;
  captureSourceHighlighter: () => SourceHighlightAdapter | undefined;
  activateReaderView: () => Promise<VaultReaderSessionView | null>;
  getDefaultWpm: () => number;
}

export async function startReaderSession(
  dependencies: StartReaderSessionDependencies,
): Promise<StartReaderSessionResult> {
  const sourceHighlighter = dependencies.captureSourceHighlighter();
  const resolvedSource = await dependencies.resolveSource();
  if (!resolvedSource.ok) {
    return {
      ok: false,
      code: resolvedSource.error.code,
      message: resolvedSource.error.message,
    };
  }

  const { source } = resolvedSource;
  const sourceKey = buildReadingSourceKey(source);
  const normalizedText = normalizeMarkdownToReadingText(source.text);
  const tokens = tokenizeReadingText(normalizedText);

  if (tokens.length === 0) {
    return {
      ok: false,
      code: "TOKENIZATION_EMPTY",
      message:
        "Vault Reader could not create tokens from this source. Try a different note or selection.",
    };
  }

  const view = await dependencies.activateReaderView();
  if (!view) {
    return {
      ok: false,
      code: "VIEW_UNAVAILABLE",
      message: "Vault Reader could not open the reader view.",
    };
  }

  await view.setSession({
    sourceKey,
    title: source.fileBaseName,
    tokens,
    sourceHighlighter,
    highlightMap: buildTokenHighlightMap({
      sourceKey,
      sourceText: source.highlightSourceText,
      documentText: source.highlightDocumentText,
      sourceStartOffset: source.highlightStartOffset,
      tokens,
    }),
    wpm: dependencies.getDefaultWpm(),
  });

  return {
    ok: true,
    code: "SESSION_STARTED",
    tokenCount: tokens.length,
    title: source.fileBaseName,
  };
}
