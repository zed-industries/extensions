import fs from "node:fs/promises";
import toml from "@iarna/toml";

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
