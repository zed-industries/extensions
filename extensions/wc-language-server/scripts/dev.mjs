#!/usr/bin/env node
/* eslint-env node */
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const { console, process } = globalThis;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const extensionDir = resolve(__dirname, "..");
const repoRoot = resolve(extensionDir, "../..");
const defaultWorkspace = resolve(repoRoot, "demos/html");
const zedBinary = process.env.ZED_BIN ?? "zed";
const nodeCmd = process.platform === "win32" ? "node.exe" : "node";

function runStep(label, command, args, options = {}) {
  console.log(`\n[zed dev] ${label}`);
  const result = spawnSync(command, args, {
    cwd: extensionDir,
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    console.error(`\n[zed dev] Failed while executing: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

function resolveWorkspaceDir() {
  if (process.env.ZED_WORKSPACE_DIR) {
    const candidate = resolve(process.env.ZED_WORKSPACE_DIR);
    if (existsSync(candidate)) {
      return candidate;
    }
    console.warn(
      `[zed dev] Provided ZED_WORKSPACE_DIR does not exist: ${candidate}. Falling back to default.`,
    );
  }

  if (existsSync(defaultWorkspace)) {
    return defaultWorkspace;
  }

  return repoRoot;
}

runStep(
  "Build extension artifacts",
  nodeCmd,
  [resolve(__dirname, "build-extension.mjs")]
);

const workspaceDir = resolveWorkspaceDir();
console.log("\n[zed dev] Build complete. Launching Zed with workspace", workspaceDir);
runStep("Launch Zed", zedBinary, ["--foreground", workspaceDir], { cwd: workspaceDir });
