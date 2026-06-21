export const defaultCleanTreeExportDir: "release/clean-public-tree";
export const cleanTreeValidationCommand: "node scripts/verify-clean-tree.mjs";
export const cleanTreeRequiredEntries: readonly string[];
export const cleanTreeForbiddenPathPatterns: readonly RegExp[];
export function validateCleanTreeEntries(entries: readonly string[]): void;
