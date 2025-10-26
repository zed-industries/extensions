import {
  isApache2License,
  isBsd3ClauseLicense,
  isGplV3License,
  isMitLicense,
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
 * @param {Record<string, any>} extensionsToml
 */
export function validateExtensionsToml(extensionsToml) {
  for (const [extensionId, _extensionInfo] of Object.entries(extensionsToml)) {
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

const LICENSE_REQUIREMENT_TEXT = `Extension repositories must have a valid license:
  - Apache 2.0
  - BSD 3-Clause
  - GNU GPLv3
  - MIT`;

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
      isBsd3ClauseLicense(license_data.content) ||
      isGplV3License(license_data.content) ||
      isMitLicense(license_data.content);

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
