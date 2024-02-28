import fs from "node:fs/promises";
import path from "node:path";
import stripJsonComments from "strip-json-comments";
import toml from "toml";

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function isDirectory(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * @param {string} extensionPath
 * @returns {Promise<{ manifest: any, manifestFormat: "toml" | "json"}>}
 */
export async function readExtensionManifest(extensionPath) {
  try {
    const extensionToml = await readTomlFile(
      path.join(extensionPath, "extension.toml"),
    );
    return { manifest: extensionToml, manifestFormat: "toml" };
  } catch {
    const extensionJson = await readJsonFile(
      path.join(extensionPath, "extension.json"),
    );
    return { manifest: extensionJson, manifestFormat: "json" };
  }
}

/**
 * @param {string} path
 */
export async function readJsonFile(path) {
  const json = await fs.readFile(path, "utf-8");

  try {
    return JSON.parse(stripJsonComments(json));
  } catch (err) {
    throw new Error(`Failed to parse JSON file '${path}': ${err}`);
  }
}

/**
 * @param {string} path
 */
export async function readTomlFile(path) {
  const tomlContents = await fs.readFile(path, "utf-8");

  try {
    return toml.parse(tomlContents);
  } catch (err) {
    throw new Error(`Failed to parse TOML file '${path}': ${err}`);
  }
}
