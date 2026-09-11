import toml from "@iarna/toml";
import fs from "node:fs/promises";
import { readTomlFile } from "./fs.js";

/** @param {string} path */
export async function sortExtensionsToml(path) {
  const extensionsToml = await readTomlFile(path);

  await writeExtensionsToml(path, extensionsToml);
}

/**
 * Removes the entry for `extensionId` from the `extensions.toml` at `path`.
 *
 * @param {string} path
 * @param {string} extensionId
 * @returns {Promise<Record<string, any>>} The removed entry.
 * @throws {Error} If there is no entry for `extensionId`.
 */
export async function removeExtensionFromToml(path, extensionId) {
  const extensionsToml = await readTomlFile(path);

  const extensionInfo = extensionsToml[extensionId];
  if (!extensionInfo) {
    throw new Error(
      `No extension with ID "${extensionId}" found in '${path}'.`,
    );
  }

  delete extensionsToml[extensionId];
  await writeExtensionsToml(path, extensionsToml);

  return extensionInfo;
}

/**
 * Computes which extension IDs were added and removed between two versions of
 * `extensions.toml`.
 *
 * @param {Record<string, any>} currentExtensionsToml
 * @param {Record<string, any>} previousExtensionsToml
 * @returns {{ added: string[], removed: string[] }}
 */
export function diffExtensionIds(
  currentExtensionsToml,
  previousExtensionsToml,
) {
  const currentIds = new Set(Object.keys(currentExtensionsToml));
  const previousIds = new Set(Object.keys(previousExtensionsToml));

  return {
    added: [...currentIds].filter((id) => !previousIds.has(id)),
    removed: [...previousIds].filter((id) => !currentIds.has(id)),
  };
}

/**
 * Writes the given extensions to `path`, sorted by extension ID.
 *
 * @param {string} path
 * @param {Record<string, any>} extensionsToml
 */
async function writeExtensionsToml(path, extensionsToml) {
  const extensionNames = Object.keys(extensionsToml);
  extensionNames.sort();

  /** @type {Record<string, any>} */
  const sortedExtensionsToml = {};

  for (const name of extensionNames) {
    const entry = extensionsToml[name];
    sortedExtensionsToml[name] = entry;
  }

  await fs.writeFile(
    path,
    toml.stringify(sortedExtensionsToml).trimEnd() + "\n",
    "utf-8",
  );
}
