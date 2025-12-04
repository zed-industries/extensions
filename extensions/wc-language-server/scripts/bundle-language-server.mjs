#!/usr/bin/env node
/* eslint-env node */
import { spawnSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const { console, process } = globalThis;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../../..");
const extensionDir = resolve(__dirname, "..");
const serverDir = resolve(extensionDir, "server");
const bundleSource = resolve(
  repoRoot,
  "packages/language-server/dist/wc-language-server.bundle.cjs"
);
const targetBinary = resolve(serverDir, "bin/wc-language-server.js");
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

console.log("[zed] bundling language server ->", targetBinary);

const buildResult = spawnSync(
  pnpmCmd,
  ["--filter", "@wc-toolkit/language-server", "run", "build"],
  {
    cwd: repoRoot,
    stdio: "inherit",
  }
);

if (buildResult.status !== 0) {
  console.error("[zed] Failed to build language server bundle. See logs above.");
  process.exit(buildResult.status ?? 1);
}

if (!existsSync(bundleSource)) {
  console.error("[zed] Bundle missing:", bundleSource);
  process.exit(1);
}

if (existsSync(serverDir)) {
  rmSync(serverDir, { recursive: true, force: true });
}

mkdirSync(dirname(targetBinary), { recursive: true });
copyFileSync(bundleSource, targetBinary);

console.log("[zed] Language server bundled successfully ->", targetBinary);

const tsSource = resolve(repoRoot, "node_modules", "typescript");
const tsTarget = resolve(serverDir, "node_modules", "typescript");
const serverPackageJson = resolve(serverDir, "package.json");

if (existsSync(tsSource)) {
  console.log("[zed] Copying bundled TypeScript runtime ->", tsTarget);
  rmSync(tsTarget, { recursive: true, force: true });
  mkdirSync(dirname(tsTarget), { recursive: true });
  cpSync(tsSource, tsTarget, { recursive: true });
} else {
  console.warn(
    "[zed] Warning: Could not find TypeScript runtime at",
    tsSource,
    "— language server will need tsdk from the workspace"
  );
}

const serverPackage = {
  name: "@wc-toolkit/zed-language-server-runtime",
  type: "commonjs",
};

writeFileSync(serverPackageJson, `${JSON.stringify(serverPackage, null, 2)}\n`);
console.log("[zed] Wrote server package manifest ->", serverPackageJson);
