export interface ReleaseCandidateValidationSummary {
  assetNames: string[];
}

export interface ReleaseCandidateInstallInput {
  releaseDir: string;
  vaultRoot: string;
  pluginId: string;
}

export function validateReleaseCandidateDirectory(
  releaseDir: string,
): Promise<ReleaseCandidateValidationSummary>;

export function installReleaseCandidateToVault(
  input: ReleaseCandidateInstallInput,
): Promise<string>;
