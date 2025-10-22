import fs from "node:fs";
import path from "node:path";
import url from "node:url";

export function readMitLicense() {
  return readLicenseFile("test-mit-license");
}

export function readApache2License() {
  return readLicenseFile("test-apache-2-license");
}

export function readGplV3License() {
  return readLicenseFile("test-gpl-v3-license");
}

export function readOtherLicense() {
  return readLicenseFile("other-license");
}

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {Map<string, string>} */
const licenseCache = new Map();

/**
 * Reads a license file from the current directory, using a cache to avoid redundant reads.
 * @param {string} fileName - The name of the license file to read
 * @returns {string} The content of the license file
 */
function readLicenseFile(fileName) {
  let content = licenseCache.get(fileName);

  if (content) {
    return content;
  }

  content = fs.readFileSync(path.join(__dirname, fileName), "utf-8");
  licenseCache.set(fileName, content);

  return content;
}
