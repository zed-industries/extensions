import fs from "node:fs";
import path from "node:path";
import url from "node:url";

export function readApache2License() {
  return readLicenseFile("test-apache-2-license");
}

export function readBsd2ClauseLicense() {
  return readLicenseFile("test-bsd-2-clause");
}

export function readBsd3ClauseLicense() {
  return readLicenseFile("test-bsd-3-clause");
}

export function readBsd3ClauseAlternativeLicense() {
  return readLicenseFile("test-bsd-3-clause-alternative");
}

export function readGplV3License() {
  return readLicenseFile("test-gpl-v3-license");
}

export function readLgplV3License() {
  return readLicenseFile("test-lgpl-v3-license");
}

export function readMitLicense() {
  return readLicenseFile("test-mit-license");
}

export function readZlibLicense() {
  return readLicenseFile("test-zlib-license");
}

export function readOtherLicense() {
  return "Some other license that we do not currently accept (yet).";
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
export function readLicenseFile(fileName) {
  let content = licenseCache.get(fileName);

  if (content) {
    return content;
  }

  content = fs.readFileSync(path.join(__dirname, fileName), "utf-8");
  licenseCache.set(fileName, content);

  return content;
}
