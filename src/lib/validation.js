/**
 * Exceptions to the rule of extension IDs ending in `-zed`.
 *
 * Only to be edited by Zed staff.
 */
const EXTENSION_ID_ENDS_WITH_EXCEPTIONS = ["xy-zed"];

/**
 * @param {Record<string, any>} extensionsToml
 */
export function validateExtensionsToml(extensionsToml) {
  for (const [extensionId, _extensionInfo] of Object.entries(extensionsToml)) {
    if (extensionId.startsWith("zed-")) {
      throw new Error(
        `Extension IDs should not start with "zed-", as they are all Zed extensions: "${extensionId}".`,
      );
    }

    if (
      extensionId.endsWith("-zed") &&
      !EXTENSION_ID_ENDS_WITH_EXCEPTIONS.includes(extensionId)
    ) {
      throw new Error(
        `Extension IDs should not end with "-zed", as they are all Zed extensions: "${extensionId}".`,
      );
    }
  }
}

/**
 * @param {Record<string, any>} manifest
 */
export function validateManifest(manifest) {
  if (manifest["name"].startsWith("Zed ")) {
    throw new Error(
      `Extension names should not start with "Zed ", as they are all Zed extensions: "${manifest["name"]}".`,
    );
  }

  if (manifest["name"].endsWith(" Zed")) {
    throw new Error(
      `Extension names should not end with " Zed", as they are all Zed extensions: "${manifest["name"]}".`,
    );
  }
}

/**
 * @param {import('git-submodule-js').Submodule} gitmodules
 */
export function validateGitmodules(gitmodules) {
  for (const [name, entry] of Object.entries(gitmodules)) {
    const url = entry["url"];
    if (!url) {
      throw new Error(`Missing URL for "${name}".`);
    }

    if (!url.startsWith("https://")) {
      throw new Error(`Submodules must use "https://" scheme.`);
    }
  }
}
