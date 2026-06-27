export const releaseAssetNames: readonly ["main.js", "manifest.json", "styles.css"];
export const releaseChecksumFileName: "SHA256SUMS";

export interface ReleaseMetadataInput {
  manifest: {
    id: string;
    version: string;
    minAppVersion: string;
  };
  packageJson: {
    version: string;
  };
  versions: Record<string, string>;
}

export interface ReleaseChecksum {
  assetName: string;
  sha256: string;
}

export function validateReleaseMetadata(input: ReleaseMetadataInput): void;
export function assertReleaseDirectoryEntries(entries: string[]): void;
export function formatChecksumLines(checksums: ReleaseChecksum[]): string;
