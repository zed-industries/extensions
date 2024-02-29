import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import toml from "toml";
import {
  isDirectory,
  readExtensionManifest,
  readJsonFile,
  readTomlFile,
} from "./lib/fs.js";
import { exec } from "./lib/process.js";
import {
  validateExtensionsToml,
  validateLanguageConfig,
  validateManifest,
  validateTheme,
} from "./lib/validation.js";

const {
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

const treeSitterPath = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  "tree-sitter",
);

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
  validateExtensionsToml(extensionsToml);

  const extensionIds = shouldPublish
    ? await unpublishedExtensionIds(extensionsToml)
    : await changedExtensionIds(extensionsToml);

  for (const extensionId of extensionIds) {
    if (selectedExtensionId && extensionId !== selectedExtensionId) {
      continue;
    }

    const extensionInfo = extensionsToml[extensionId];
    console.log(
      `Packaging '${extensionId}'. Version: ${extensionInfo.version}`,
    );

    await checkoutGitSubmodule(extensionInfo.path);

    await packageExtension(
      extensionId,
      extensionInfo.path,
      extensionInfo.version,
      shouldPublish,
    );
  }
} finally {
  await fs.rm("build", { recursive: true });
}

/**
 * @typedef {Object} PackageManifest
 * @property {string} name
 * @property {string} version
 * @property {string[]} authors
 * @property {string} description
 * @property {string} repository
 * @property {Record<string, string>} [themes]
 * @property {Record<string, string>} [languages]
 * @property {Record<string, string>} [grammars]
 */

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
  const { manifest: metadata } = await readExtensionManifest(extensionPath);

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

  /** @type {PackageManifest} */
  const packageManifest = {
    name: metadata.name,
    version: metadata.version,
    authors: metadata.authors,
    description: metadata.description,
    repository: metadata.repository,
  };

  const packageDir = await fs.mkdtemp(
    path.join("build", extensionId + ".extension"),
  );
  const archiveName = path.join(
    "build",
    `${extensionId}-${packageManifest.version}.tar.gz`,
  );
  /** @type {Record<string, string>} */
  const grammarRepoPaths = {};

  const grammarsSrcDir = path.join(extensionPath, "grammars");
  const languagesSrcDir = path.join(extensionPath, "languages");
  const themesSrcDir = path.join(extensionPath, "themes");

  const grammarsPkgDir = path.join(packageDir, "grammars");
  const languagesPkgDir = path.join(packageDir, "languages");
  const themesPkgDir = path.join(packageDir, "themes");

  if (await isDirectory(themesSrcDir)) {
    await fs.mkdir(themesPkgDir);
    packageManifest.themes = {};

    for (const themeFilename of await fs.readdir(themesSrcDir)) {
      if (!themeFilename.endsWith(".json")) {
        continue;
      }

      const themeFullPath = path.join(themesSrcDir, themeFilename);
      const theme = await readJsonFile(themeFullPath);

      validateTheme(theme);

      const themeDestinationPath = path.join(themesPkgDir, themeFilename);
      await fs.copyFile(themeFullPath, themeDestinationPath);
      packageManifest.themes[theme.name] = `themes/${themeFilename}`;
    }
  }

  if (await isDirectory(languagesSrcDir)) {
    await fs.mkdir(languagesPkgDir);
    packageManifest.languages = {};

    for (const languageDirname of await fs.readdir(languagesSrcDir)) {
      const languageFullPath = path.join(languagesSrcDir, languageDirname);
      if (!(await isDirectory(languageFullPath))) {
        continue;
      }

      const config = await readTomlFile(
        path.join(languageFullPath, "config.toml"),
      );

      validateLanguageConfig(config);

      const languageDestinationPath = path.join(
        languagesPkgDir,
        languageDirname,
      );
      await fs.cp(languageFullPath, languageDestinationPath, {
        recursive: true,
      });
      packageManifest.languages[config.name] = `languages/${languageDirname}`;
    }
  }

  if (await isDirectory(grammarsSrcDir)) {
    await fs.mkdir(grammarsPkgDir);
    packageManifest.grammars = {};

    for (const grammarFilename of await fs.readdir(grammarsSrcDir)) {
      const grammarConfigPath = path.join(grammarsSrcDir, grammarFilename);
      const config = await readTomlFile(grammarConfigPath);

      const grammarName = grammarFilename.replace(/\.toml$/, "");
      const grammarRepoKey = `${config.repository}/${config.commit}`;
      /** @type {string} */
      let grammarRepoPath;
      const existingGrammarRepoPath = grammarRepoPaths[grammarRepoKey];
      if (existingGrammarRepoPath) {
        grammarRepoPath = existingGrammarRepoPath;
      } else {
        grammarRepoPath = await checkoutGitRepo(
          grammarName,
          config.repository,
          config.commit,
        );
        grammarRepoPaths[grammarRepoKey] = grammarRepoPath;
      }

      const grammarFullPath = config.path
        ? path.join(grammarRepoPath, config.path)
        : grammarRepoPath;

      await exec(treeSitterPath, ["build-wasm"], {
        cwd: grammarFullPath,
      });

      const wasmSourcePath = path.join(
        grammarRepoPath,
        `tree-sitter-${grammarName}.wasm`,
      );

      const wasmDestinationPath = path.join(
        grammarsPkgDir,
        `${grammarName}.wasm`,
      );
      await fs.copyFile(wasmSourcePath, wasmDestinationPath);
      packageManifest.grammars[grammarName] = `grammars/${grammarName}.wasm`;
    }
  }

  validateManifest(packageManifest);

  await fs.writeFile(
    path.join(packageDir, "extension.json"),
    JSON.stringify(packageManifest, null, 2),
  );

  const tarOutput = await exec("tar", [
    "-czvf",
    archiveName,
    "-C",
    packageDir,
    ".",
  ]);
  console.log(tarOutput.stderr);

  if (shouldPublish) {
    console.log(`Uploading ${extensionId} version ${extensionVersion}`);
    const archiveData = await fs.readFile(archiveName);

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `${EXTENSIONS_PREFIX}/${extensionId}/${packageManifest.version}/archive.tar.gz`,
        Body: archiveData,
      }),
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `${EXTENSIONS_PREFIX}/${extensionId}/${packageManifest.version}/manifest.json`,
        Body: JSON.stringify(packageManifest),
      }),
    );
  }
}

async function getPublishedVersionsByExtensionId() {
  const bucketList = await s3.listObjects({
    Bucket: S3_BUCKET,
    Prefix: `${EXTENSIONS_PREFIX}/`,
  });

  /** @type {Record<string, string[]>} */
  const publishedVersionsByExtensionId = {};
  bucketList.Contents?.forEach((object) => {
    const [_prefix, extensionId, version, _filename] =
      object.Key?.split("/") ?? [];
    assert.ok(extensionId, "No extension ID in blob store key.");
    assert.ok(version, "No version in blob store key.");

    const publishedVersions = publishedVersionsByExtensionId[extensionId] ?? [];
    publishedVersions.push(version);
    publishedVersionsByExtensionId[extensionId] = publishedVersions;
  });

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
 */
async function changedExtensionIds(extensionsToml) {
  const { stdout: extensionsContents } = await exec("git", [
    "show",
    "origin/main:extensions.toml",
  ]);
  const mainExtensionsToml = toml.parse(extensionsContents);

  const result = [];
  for (const [extensionId, extensionInfo] of Object.entries(extensionsToml)) {
    if (mainExtensionsToml[extensionId]?.version === extensionInfo.version) {
      continue;
    }
    result.push(extensionId);
  }

  console.log("Extensions changed from main:", result.join(", "));
  return result;
}

/** @param {string} path */
async function checkoutGitSubmodule(path) {
  await exec("git", ["submodule", "update", path]);
}

/**
 * @param {string} name
 * @param {string} repositoryUrl
 * @param {string} commitSha
 */
async function checkoutGitRepo(name, repositoryUrl, commitSha) {
  const repoPath = await fs.mkdtemp(
    path.join("build", `${name}-${commitSha}.repo`),
  );
  const processOptions = {
    cwd: repoPath,
  };

  await exec("git", ["init"], processOptions);
  await exec("git", ["remote", "add", "origin", repositoryUrl], processOptions);
  await exec(
    "git",
    ["fetch", "--depth", "1", "origin", commitSha],
    processOptions,
  );
  await exec("git", ["checkout", commitSha], processOptions);
  return repoPath;
}
