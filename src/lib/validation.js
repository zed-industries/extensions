import {
  isApache2License,
  isBsd2ClauseLicense,
  isBsd3ClauseLicense,
  isGplV3License,
  isLgplV3License,
  isMitLicense,
  isZlibLicense,
} from "./license.js";

const EXTENSION_ID_PATTERN = /^[a-z0-9\-]+$/;

/**
 * Exceptions to the rule of extension IDs starting in `zed-`.
 *
 * Only to be edited by Zed staff.
 */
const EXTENSION_ID_STARTS_WITH_EXCEPTIONS = ["zed-legacy-themes"];

/**
 * Exceptions to the rule of extension IDs ending in `-zed`.
 *
 * Only to be edited by Zed staff.
 */
const EXTENSION_ID_ENDS_WITH_EXCEPTIONS = ["xy-zed"];

/**
 * Exceptions to the rule that extension submodules should match the extension ID.
 */
const SUBMODULE_LOCATION_EXCEPTIONS = ["extensions/zed"];

/**
 * @param {Record<string, any>} extensionsToml
 */
export function validateExtensionsToml(extensionsToml) {
  for (const [extensionId, extensionInfo] of Object.entries(extensionsToml)) {
    if (!EXTENSION_ID_PATTERN.test(extensionId)) {
      throw new Error(
        `Extension IDs must only consist of lowercase letters, numbers, and hyphens ('-'): "${extensionId}".`,
      );
    }

    if (
      extensionId.startsWith("zed-") &&
      !EXTENSION_ID_STARTS_WITH_EXCEPTIONS.includes(extensionId)
    ) {
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

    if (!extensionInfo.submodule || !extensionInfo.version) {
      throw new Error(
        `Missing required field "submodule" or "version" for extension "${extensionId}"`,
      );
    }
  }
}

/**
 * @param {Record<string, any>} manifest
 */
export function validateManifest(manifest) {
  if (
    manifest["name"].startsWith("Zed ") &&
    manifest["name"] !== "Zed Legacy Themes"
  ) {
    throw new Error(
      `Extension names should not start with "Zed ", as they are all Zed extensions: "${manifest["name"]}".`,
    );
  }

  if (manifest["name"].endsWith(" Zed")) {
    throw new Error(
      `Extension names should not end with " Zed", as they are all Zed extensions: "${manifest["name"]}".`,
    );
  }

  const schemaVersion = manifest["schema_version"];
  if (typeof schemaVersion !== "undefined") {
    if (schemaVersion !== 1) {
      throw new Error(
        `Invalid \`schema_version\`. Expected \`1\` but got \`${schemaVersion}\`.`,
      );
    }
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

/**
 * @param {Record<string, any>} extensionsToml
 * @param {import('git-submodule-js').Submodule} gitmodules
 */
export function validateGitmodulesLocations(extensionsToml, gitmodules) {
  for (const [extensionId, extensionInfo] of Object.entries(extensionsToml)) {
    let submoduleName = extensionInfo["submodule"];
    let submodule = gitmodules[submoduleName];
    let expectedSubmoduleName = `extensions/${extensionId}`;

    if (!submodule) {
      throw new Error(
        `Could not find submodule "${submoduleName}" for extension ID "${extensionId}".`,
      );
    }

    if (SUBMODULE_LOCATION_EXCEPTIONS.includes(submoduleName)) {
      continue;
    }

    let submodulePath = submodule["path"];

    if (submoduleName !== expectedSubmoduleName) {
      throw new Error(
        `Submodule name ${submoduleName} does not match expected name. Please ensure that the submodule is named and located at "${expectedSubmoduleName}".`,
      );
    }

    if (submoduleName !== submodulePath) {
      throw new Error(
        `Name and path do not match for submodule ${expectedSubmoduleName}. Please ensure that the submodule is named and located at "${expectedSubmoduleName}".`,
      );
    }

    if (submoduleName !== expectedSubmoduleName) {
      throw new Error(
        `Extension with ID "${extensionId}" does not use the proper submodule. Please ensure that the submodule is named and located at "${expectedSubmoduleName}".`,
      );
    }
  }
}

const LICENSE_REQUIREMENT_TEXT = `Extension repositories must have a valid license:
  - Apache 2.0
  - BSD 2-Clause
  - BSD 3-Clause
  - GNU GPLv3
  - GNU LGPLv3
  - MIT
  - zlib`;

const LICENSE_DOCUMENTATION_URL =
  "https://zed.dev/docs/extensions/developing-extensions#extension-license-requirements";

const MISSING_LICENSE_ERROR = `${LICENSE_REQUIREMENT_TEXT}\nSee: ${LICENSE_DOCUMENTATION_URL}`;

/**
 * Validates that a collection of files contains a valid MIT or Apache 2.0 license
 * @param {Array<{name: string, content: string}>} licenseCandidates
 */
export function validateLicense(licenseCandidates) {
  if (licenseCandidates.length === 0) {
    throw new Error(
      ["No license was found.", `${MISSING_LICENSE_ERROR}`].join("\n"),
    );
  }

  for (const license_data of licenseCandidates) {
    const isValidLicense =
      isApache2License(license_data.content) ||
      isBsd2ClauseLicense(license_data.content) ||
      isBsd3ClauseLicense(license_data.content) ||
      isGplV3License(license_data.content) ||
      isLgplV3License(license_data.content) ||
      isMitLicense(license_data.content) ||
      isZlibLicense(license_data.content);

    if (isValidLicense) {
      return;
    }
  }

  const licenseNames = licenseCandidates
    .map((licenseData) => `"${licenseData.name}"`)
    .join(", ");

  throw new Error(
    [
      `No valid license found in the following files: ${licenseNames}.`,
      `${MISSING_LICENSE_ERROR}`,
    ].join("\n"),
  );
}

/**
 * Validates that extension IDs have not changed between two versions of extensions.toml.
 *
 * @param {Record<string, any>} currentExtensionsToml - The current extensions.toml
 * @param {Record<string, any>} previousExtensionsToml - The previous extensions.toml to compare against
 * @throws {Error} If extension IDs were both added and removed (indicating renames)
 */
export function validateExtensionIdsNotChanged(
  currentExtensionsToml,
  previousExtensionsToml,
) {
  const currentIds = new Set(Object.keys(currentExtensionsToml));
  const previousIds = new Set(Object.keys(previousExtensionsToml));

  const addedIds = [...currentIds].filter((id) => !previousIds.has(id));
  const removedIds = [...previousIds].filter((id) => !currentIds.has(id));

  if (addedIds.length > 0 && removedIds.length > 0) {
    throw new Error(
      [
        "Extension IDs must not change between versions.",
        `${removedIds.length} ID(s) were removed: ${removedIds.join(", ")}`,
        `${addedIds.length} ID(s) were added: ${addedIds.join(", ")}`,
        "",
        "If you need to rename an extension, update the display name in the extension's manifest instead.",
      ].join("\n"),
    );
  }
}
