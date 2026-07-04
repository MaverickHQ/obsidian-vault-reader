export const releaseAssetNames = ["main.js", "manifest.json", "styles.css"];

const allowedReleaseEntries = new Set(releaseAssetNames);

export function validateReleaseMetadata({ manifest, packageJson, versions }) {
  assert(/^\d+\.\d+\.\d+$/.test(manifest.version), "manifest version must use x.y.z semver.");
  assert(
    packageJson.version === manifest.version,
    "package.json version must match manifest.json.",
  );
  assert(
    versions[manifest.version] === manifest.minAppVersion,
    "versions.json must map the manifest version to minAppVersion.",
  );
  assert(manifest.id === "vault-reader", "manifest id must be vault-reader.");
  assert(!manifest.id.includes("obsidian"), "manifest id must not contain obsidian.");
  assert(!manifest.id.endsWith("plugin"), "manifest id must not end with plugin.");
}

export function assertReleaseDirectoryEntries(entries) {
  for (const entry of entries) {
    assert(allowedReleaseEntries.has(entry), `Unexpected release artifact: ${entry}`);
  }

  for (const requiredEntry of allowedReleaseEntries) {
    assert(entries.includes(requiredEntry), `Missing release artifact: ${requiredEntry}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
