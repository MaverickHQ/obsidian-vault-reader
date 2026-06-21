export type VaultReaderErrorCode =
  | "STARTUP_LOAD_FAILED"
  | "SESSION_STATE_ERROR"
  | "SESSION_PLAYBACK_UNEXPECTED"
  | "VIEW_ACTION_FAILED"
  | "SETTINGS_PERSIST_FAILED";

export interface VaultReaderError {
  code: VaultReaderErrorCode;
  message: string;
  context?: Record<string, unknown>;
}

export function createVaultReaderError(
  code: VaultReaderErrorCode,
  message: string,
  context?: Record<string, unknown>,
): VaultReaderError {
  return {
    code,
    message,
    context,
  };
}

export function fingerprintVaultReaderError(error: VaultReaderError): string {
  return `${error.code}::${error.message}`;
}

const MAX_NOTICE_ERROR_LENGTH = 180;
const STACK_TRACE_PATTERN = /\bat\s+\S+\s+\(.+:\d+:\d+\)|\bat\s+.+:\d+:\d+/;
const ABSOLUTE_PATH_PATTERN = /(?:^|\s)\/(?:Users|home|private|var|tmp|Volumes)\/\S+/;

export function sanitizeErrorMessageForNotice(
  rawMessage: unknown,
  fallbackMessage: string,
): string {
  if (typeof rawMessage !== "string") {
    return fallbackMessage;
  }

  const sanitized = rawMessage
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if ((code >= 0 && code <= 31) || code === 127) {
        return " ";
      }

      return char;
    })
    .join("")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    sanitized.length === 0 ||
    STACK_TRACE_PATTERN.test(rawMessage) ||
    ABSOLUTE_PATH_PATTERN.test(rawMessage)
  ) {
    return fallbackMessage;
  }

  return sanitized.slice(0, MAX_NOTICE_ERROR_LENGTH);
}
