export const releaseAssetNames: readonly ["main.js", "manifest.json", "styles.css"];

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

export function validateReleaseMetadata(input: ReleaseMetadataInput): void;
export function assertReleaseDirectoryEntries(entries: string[]): void;
