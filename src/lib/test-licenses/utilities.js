import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readMitLicense() {
  return fs.readFileSync(path.join(__dirname, "test-mit-license"), "utf-8");
}

export function readApache2License() {
  return fs.readFileSync(
    path.join(__dirname, "test-apache-2-license"),
    "utf-8",
  );
}

export function readGplV3License() {
  return fs.readFileSync(path.join(__dirname, "test-gpl-v3-license"), "utf-8");
}
