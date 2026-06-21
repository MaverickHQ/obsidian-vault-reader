import { describe, expect, it } from "vitest";

import { localDeployAssetNames } from "../../scripts/deploy-local-vault.mjs";
import { releaseAssetNames } from "../../scripts/release-package-policy.mjs";

describe("local deploy policy", () => {
  it("uses the same Obsidian plugin asset list as release packaging", () => {
    expect(localDeployAssetNames).toEqual(releaseAssetNames);
  });
});
