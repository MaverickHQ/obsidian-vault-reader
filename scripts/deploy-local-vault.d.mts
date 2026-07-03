export const localDeployAssetNames: readonly ["main.js", "manifest.json", "styles.css"];

export interface LocalDeployResult {
  targetDir: string;
  copied: string[];
}

export function deployLocalVaultBuild(targetDir?: string): Promise<LocalDeployResult>;
