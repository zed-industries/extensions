import ajvModule from "ajv";
import { readJsonFile } from "./fs.js";

const Ajv = ajvModule.default;

const ajv = new Ajv({});
const themeValidator = ajv.compile(
  await readJsonFile("schemas/theme-family.json"),
);
const languageConfigValidator = ajv.compile(
  await readJsonFile("schemas/language-config.json"),
);

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

  const authors = manifest["authors"];
  if (!authors) {
    throw new Error(`Missing "authors" field.`);
  }

  if (!Array.isArray(authors)) {
    throw new Error(`"authors" field must be an array of strings.`);
  }

  if (authors.some((author) => typeof author !== "string")) {
    throw new Error(`"authors" field must be an array of strings.`);
  }
}

/**
 * @param {Record<string, any>} config
 */
export function validateLanguageConfig(config) {
  languageConfigValidator(config);
  if (languageConfigValidator.errors) {
    throw new Error(ajv.errorsText(languageConfigValidator.errors));
  }
}

/**
 * @param {Record<string, any>} theme
 */
export function validateTheme(theme) {
  themeValidator(theme);
  if (themeValidator.errors) {
    throw new Error(ajv.errorsText(themeValidator.errors));
  }
}
