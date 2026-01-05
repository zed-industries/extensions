import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import toml from "@iarna/toml";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { sortExtensionsToml } from "./lib/extensions-toml.js";
import {
  fileExists,
  readTomlFile,
  retrieveLicenseCandidates,
} from "./lib/fs.js";
import {
  checkoutGitSubmodule,
  readGitmodules,
  sortGitmodules,
} from "./lib/git.js";
import { exec } from "./lib/process.js";
import {
  validateExtensionsToml,
  validateGitmodules,
  validateManifest,
  validateLicense,
  validateGitmodulesLocations,
} from "./lib/validation.js";

const {
  REF_NAME,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_BUCKET,
  SHOULD_PUBLISH,
  S3_ENDPOINT,
  S3_REGION,
} = process.env;

const USAGE = `
package-extensions [extensionId]

Package extensions and publish them to the Zed extension blob store.

* If an extension ID is provided, only package that extension.
* Otherwise, if SHOULD_PUBLISH is set to true, package all extensions for
  which there is not already a package in the blob store.
* If SHOULD_PUBLISH is not set to true, then package any extensions that
  have been added or updated on this branch.

ENVIRONMENT VARIABLES
  S3_ACCESS_KEY     Access key for the blob store
  S3_SECRET_KEY     Secret key for the blob store
  S3_BUCKET         Name of the bucket where extensions are published
  SHOULD_PUBLISH    Whether to publish packages to the blob store.
                    Set this to "true" to publish the packages.
  REF_NAME          Name of the branch or tag being built.
`;

let selectedExtensionId;
for (const arg of process.argv.slice(2)) {
  if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  }

  if (arg.startsWith("-")) {
    console.log("no such flag:", arg);
    process.exit(1);
  }

  selectedExtensionId = arg;
}

/** Whether packages should be published to the blob store. */
const shouldPublish = SHOULD_PUBLISH === "true";

const s3 = new S3({
  forcePathStyle: false,
  endpoint: S3_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
  region: S3_REGION || "nyc3",
  credentials: {
    accessKeyId: S3_ACCESS_KEY || "",
    secretAccessKey: S3_SECRET_KEY || "",
  },
});

const EXTENSIONS_PREFIX = "extensions";

// Get the list of extension versions in the repository.
const extensionsToml = await readTomlFile("extensions.toml");

// Package each extension in the repository that has not already
// been packaged.
await fs.mkdir("build", { recursive: true });
try {
  const gitModules = await readGitmodules(".gitmodules");

  validateExtensionsToml(extensionsToml);
  validateGitmodules(gitModules);
  validateGitmodulesLocations(extensionsToml, gitModules);

  await sortExtensionsToml("extensions.toml");
  await sortGitmodules(".gitmodules");

  const extensionIds = shouldPublish
    ? await unpublishedExtensionIds(extensionsToml)
    : await changedExtensionIds(extensionsToml, REF_NAME !== "main");

  for (const extensionId of extensionIds) {
    if (selectedExtensionId && extensionId !== selectedExtensionId) {
      continue;
    }

    const extensionInfo = extensionsToml[extensionId];
    console.log(
      `Packaging '${extensionId}'. Version: ${extensionInfo.version}`,
    );

    const submodulePath = extensionInfo.submodule;
    assert(
      typeof submodulePath === "string",
      "`submodule` must exist and be a string.",
    );

    await checkoutGitSubmodule(submodulePath);

    const extensionPath = extensionInfo.path
      ? path.join(submodulePath, extensionInfo.path)
      : submodulePath;

    await packageExtension(
      extensionId,
      extensionPath,
      extensionInfo.version,
      shouldPublish,
    );
  }
} finally {
  await fs.rm("build", { recursive: true });
}

/**
 * @param {string} extensionId
 * @param {string} extensionPath
 * @param {string} extensionVersion
 * @param {boolean} shouldPublish
 */
async function packageExtension(
  extensionId,
  extensionPath,
  extensionVersion,
  shouldPublish,
) {
  const outputDir = "output";

  const SCRATCH_DIR = "./scratch";
  await fs.mkdir(SCRATCH_DIR, { recursive: true });

  if (await fileExists(path.join(extensionPath, "extension.json"))) {
    throw new Error(
      "The `extension.json` manifest format has been superseded by `extension.toml`",
    );
  }

  const pathToExtensionToml = path.join(extensionPath, "extension.toml");
  if (await fileExists(pathToExtensionToml)) {
    const extensionToml = await readTomlFile(pathToExtensionToml);

    if (extensionToml.id !== extensionId) {
      throw new Error(
        [
          "IDs in `extensions.toml` and `extension.toml` do not match:",
          "",
          `extensions.toml: ${extensionId}`,
          ` extension.toml: ${extensionToml.id}`,
        ].join("\n"),
      );
    }
  }

  const licenseCandidates = await retrieveLicenseCandidates(extensionPath);
  validateLicense(licenseCandidates);

  const zedExtensionOutput = await exec(
    "./zed-extension",
    [
      "--scratch-dir",
      SCRATCH_DIR,
      "--source-dir",
      extensionPath,
      "--output-dir",
      outputDir,
    ],
    {
      env: {
        PATH: process.env["PATH"],
        RUST_LOG: "info",
      },
    },
  );
  console.log(zedExtensionOutput.stdout);

  const warnings = zedExtensionOutput.stderr
    .split("\n")
    .filter((line) => line.includes("WARN"));
  for (const warning of warnings) {
    console.log(warning);
  }

  const manifestJson = await fs.readFile(
    path.join(outputDir, "manifest.json"),
    "utf-8",
  );
  const metadata = JSON.parse(manifestJson);

  if (metadata.version !== extensionVersion) {
    throw new Error(
      [
        `Incorrect version for extension ${extensionId} (${metadata.name})`,
        "",
        `Expected version: ${extensionVersion}`,
        `Actual version: ${metadata.version}`,
      ].join("\n"),
    );
  }

  validateManifest(metadata);

  if (shouldPublish) {
    console.log(`Uploading ${extensionId} version ${extensionVersion}`);
    const entries = await fs.readdir(outputDir);
    for (const filename of entries) {
      const data = await fs.readFile(path.join(outputDir, filename));
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: `${EXTENSIONS_PREFIX}/${extensionId}/${extensionVersion}/${filename}`,
          Body: data,
        }),
      );
    }
  }
}

async function getPublishedVersionsByExtensionId() {
  /** @type {string | undefined} */
  let nextMarker;

  /** @type {Record<string, string[]>} */
  const publishedVersionsByExtensionId = {};

  do {
    const bucketList = await s3.listObjects({
      Bucket: S3_BUCKET,
      Prefix: `${EXTENSIONS_PREFIX}/`,
      ...(nextMarker ? { Marker: nextMarker } : {}),
    });

    console.log(
      `Retrieved ${bucketList.Contents?.length} object(s) from bucket.`,
    );
    for (const object of bucketList.Contents ?? []) {
      const [_prefix, extensionId, version, _filename] =
        object.Key?.split("/") ?? [];
      assert.ok(extensionId, "No extension ID in blob store key.");
      assert.ok(version, "No version in blob store key.");

      const publishedVersions =
        publishedVersionsByExtensionId[extensionId] ?? [];
      publishedVersions.push(version);
      publishedVersionsByExtensionId[extensionId] = publishedVersions;
    }

    if (bucketList.Contents && bucketList.IsTruncated) {
      const lastObject = bucketList.Contents[bucketList.Contents.length - 1];
      nextMarker = lastObject?.Key;
    } else {
      nextMarker = undefined;
    }
  } while (nextMarker);

  return publishedVersionsByExtensionId;
}

/**
 * @param {Record<string, any>} extensionsToml
 */
async function unpublishedExtensionIds(extensionsToml) {
  const publishedExtensionVersions = await getPublishedVersionsByExtensionId();

  const result = [];
  for (const [extensionId, extensionInfo] of Object.entries(extensionsToml)) {
    if (
      !publishedExtensionVersions[extensionId]?.includes(extensionInfo.version)
    ) {
      result.push(extensionId);
    }
  }

  console.log("Extensions needing to be published:", result.join(", "));
  return result;
}

/**
 * @param {Record<string, any>} extensionsToml
 * @param {boolean} useMergeBase
 */
async function changedExtensionIds(extensionsToml, useMergeBase) {
  let compareTarget;
  if (useMergeBase) {
    const { stdout: forkPoint } = await exec("git", [
      "merge-base",
      "HEAD",
      "origin/main",
    ]);
    compareTarget = forkPoint.trim();
  } else {
    compareTarget = "origin/main";
  }

  const { stdout: extensionsContents } = await exec("git", [
    "show",
    `${compareTarget}:extensions.toml`,
  ]);
  /** @type {any} */
  const mainExtensionsToml = toml.parse(extensionsContents);

  const result = [];
  for (const [extensionId, extensionInfo] of Object.entries(extensionsToml)) {
    if (mainExtensionsToml[extensionId]?.version === extensionInfo.version) {
      continue;
    }
    result.push(extensionId);
  }

  console.log(
    "Extensions changed from main:",
    result.length !== 0 ? result.join(", ") : "No changed extensions detected.",
  );
  return result;
}
