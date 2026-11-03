import fs from "node:fs/promises";
import path from "node:path";
import toml from "@iarna/toml";
import { hasLicenseFileName } from "./license.js";

/**
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function readTomlFile(path) {
  const tomlContents = await fs.readFile(path, "utf-8");

  try {
    return toml.parse(tomlContents);
  } catch (err) {
    throw new Error(`Failed to parse TOML file '${path}': ${err}`);
  }
}

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function fileExists(path) {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ENOENT"
    ) {
      return false;
    }

    throw err;
  }
}

/**
 * Retrieve license candidate file data in an extension directory
 * @param {string} extensionPath
 * @returns {Promise<Array<{name: string, content: string}>>}
 */
export async function retrieveLicenseCandidates(extensionPath) {
  let extensionFiles;

  try {
    extensionFiles = await fs.readdir(extensionPath);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not read directory at '${extensionPath}': ${errorMessage}`,
    );
  }

  const licenseCandidates = [];
  for (const file of extensionFiles) {
    if (!hasLicenseFileName(file)) {
      continue;
    }

    const filePath = path.join(extensionPath, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      licenseCandidates.push({ name: file, content });
    } catch (err) {
      continue;
    }
  }

  return licenseCandidates;
}
