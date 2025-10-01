import fsSync from "node:fs";
import path from "node:path";

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

/**
 * Checks if a collection of files contains a valid MIT or Apache 2.0 license
 * @param {Array<{name: string, content: string}>} files
 * @returns {boolean}
 */
export function hasValidLicense(files) {
  for (const file of files) {
    if (!hasLicenseName(file.name)) {
      continue;
    }

    if (isMitLicense(file.content)) {
      return true;
    }

    if (isApache2License(file.content)) {
      return true;
    }
  }

  return false;
}

/**
 * @param {string} extensionPath
 */
export function validateLicense(extensionPath) {
  let files;

  try {
    files = fsSync.readdirSync(extensionPath);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not read directory at '${extensionPath}': ${errorMessage}`,
    );
  }

  const licenseFiles = [];
  for (const file of files) {
    if (hasLicenseName(file)) {
      const licensePath = path.join(extensionPath, file);
      try {
        const content = fsSync.readFileSync(licensePath, "utf-8");
        licenseFiles.push({ name: file, content });
      } catch (err) {
        continue;
      }
    }
  }

  if (!hasValidLicense(licenseFiles)) {
    throw new Error(
      `Extension at '${extensionPath}' does not contain a valid MIT or Apache 2.0 license.`,
    );
  }
}

/**
 * @param {string} fileName
 * @returns {boolean}
 */
export function hasLicenseName(fileName) {
  const nameWithoutExt = path.parse(fileName).name.toLowerCase();

  if (nameWithoutExt.startsWith("licence")) {
    return true;
  }

  if (nameWithoutExt.startsWith("license")) {
    return true;
  }

  return false;
}

const MIT_REQUIRED_PATTERNS = [
  /MIT License/i,
  /Copyright \(c\)/i,
  /Permission is hereby granted, free of charge, to any person obtaining a copy/i,
  /The above copyright notice and this permission notice shall be included in all/i,
  /THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isMitLicense(licenseContent) {
  return MIT_REQUIRED_PATTERNS.every((pattern) => pattern.test(licenseContent));
}

const APACHE_2_REQUIRED_PATTERNS = [
  /Apache License/i,
  /Version 2\.0, January 2004/i,
  /http:\/\/www.apache.org\/licenses\//i,
  /TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION/i,
  /1\. Definitions\./i,
  /2\. Grant of Copyright License\./i,
  /3\. Grant of Patent License\./i,
  /4\. Redistribution\./i,
  /5\. Submission of Contributions\./i,
  /6\. Trademarks\./i,
  /7\. Disclaimer of Warranty\./i,
  /8\. Limitation of Liability\./i,
  /9\. Accepting Warranty or Additional Liability\./i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isApache2License(licenseContent) {
  return APACHE_2_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}
