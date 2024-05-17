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
