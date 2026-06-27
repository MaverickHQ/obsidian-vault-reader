import { VaultReaderView, type ReaderViewSessionPayload } from "../../src/reader/reader-view";
import type { ReadingPositionStore } from "../../src/reader/reader-controller";
import type { TokenHighlightMap } from "../../src/reader/source-highlight-map";
import type { SourceHighlightAdapter } from "../../src/reader/source-highlighter";
import { tokenizeReadingText } from "../../src/reader/tokenizer";
import type { ReaderSettingsStore } from "../../src/settings/settings-store";
import type { VaultReaderSettings } from "../../src/settings/vault-reader-data-store";

export const DEFAULT_TEST_READER_SETTINGS: VaultReaderSettings = {
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

export interface TestSettingsStoreOptions {
  failUpdate?: boolean;
  initialSettings?: Partial<VaultReaderSettings>;
  onUpdate?: (patch: Partial<VaultReaderSettings>, next: VaultReaderSettings) => void;
}

export function createSettingsStore(options: TestSettingsStoreOptions = {}): ReaderSettingsStore {
  let settings: VaultReaderSettings = {
    ...DEFAULT_TEST_READER_SETTINGS,
    ...options.initialSettings,
  };

  return {
    get: () => ({ ...settings }),
    update: async (patch) => {
      if (options.failUpdate) {
        throw new Error("settings write failed");
      }

      settings = {
        ...settings,
        ...patch,
      };
      options.onUpdate?.(patch, settings);
      return { ...settings };
    },
  };
}

export function createPositionStore(): ReadingPositionStore {
  const positions = new Map<string, number>();
  return {
    load: (sourceKey: string) => positions.get(sourceKey) ?? null,
    save: (sourceKey: string, tokenIndex: number) => {
      positions.set(sourceKey, tokenIndex);
    },
  };
}

export function createRect(width: number, height: number): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => ({}),
  } as DOMRect;
}

export function createHighlightMap(
  sourceKey = "notes/highlight.md",
): Extract<TokenHighlightMap, { ok: true }> {
  return {
    ok: true,
    sourceKey,
    ranges: [
      { index: 0, from: 0, to: 3 },
      { index: 1, from: 4, to: 7 },
      { index: 2, from: 8, to: 13 },
    ],
  };
}

export interface ReaderViewHarnessOptions {
  settingsStore?: ReaderSettingsStore;
  positionStore?: ReadingPositionStore;
  sourceHighlighter?: SourceHighlightAdapter;
  notify?: (message: string) => void;
}

export function createReaderViewHarness(options: ReaderViewHarnessOptions = {}) {
  const notices: string[] = [];
  const view = new VaultReaderView({} as never, {
    settingsStore: options.settingsStore ?? createSettingsStore(),
    positionStore: options.positionStore ?? createPositionStore(),
    sourceHighlighter: options.sourceHighlighter,
    notify: (message) => {
      notices.push(message);
      options.notify?.(message);
    },
  });

  return {
    view,
    notices,
    async open() {
      await view.onOpen();
      return this;
    },
    async close() {
      await view.onClose();
    },
    async setTextSession(text: string, overrides: Partial<ReaderViewSessionPayload> = {}) {
      await view.setSession({
        sourceKey: "notes/a.md",
        title: "a",
        tokens: tokenizeReadingText(text),
        wpm: 300,
        ...overrides,
      });
      return this;
    },
    button(label: string): HTMLButtonElement {
      const button = Array.from(view.contentEl.querySelectorAll("button")).find(
        (candidate) => candidate.textContent === label,
      );
      if (!button) {
        throw new Error(`Expected button with label: ${label}`);
      }
      return button;
    },
    buttonContaining(labelPart: string): HTMLButtonElement {
      const button = Array.from(view.contentEl.querySelectorAll("button")).find((candidate) =>
        candidate.textContent?.includes(labelPart),
      );
      if (!button) {
        throw new Error(`Expected button containing label: ${labelPart}`);
      }
      return button;
    },
    query<T extends Element = Element>(selector: string): T {
      const element = view.contentEl.querySelector<T>(selector);
      if (!element) {
        throw new Error(`Expected element matching selector: ${selector}`);
      }
      return element;
    },
    pressKey(key: string) {
      view.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    },
    clickButton(label: string) {
      this.button(label).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    },
  };
}

export async function flushReaderViewPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
