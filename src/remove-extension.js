import { removeExtensionFromToml } from "./lib/extensions-toml.js";
import { removeGitSubmodule, stageGitPaths } from "./lib/git.js";

const USAGE = `
remove-extension <extensionId>

Remove an extension from the repository.

* Removes the extension's entry from \`extensions.toml\`.
* Removes the extension's Git submodule, unless it is still used by another
  extension.

The resulting changes are staged but not committed.
`;

/** @type {string | undefined} */
let extensionId;
for (const arg of process.argv.slice(2)) {
  if (arg === "-h" || arg === "--help") {
    console.log(USAGE);
    process.exit(0);
  }

  if (arg.startsWith("-")) {
    console.log("no such flag:", arg);
    process.exit(1);
  }

  if (extensionId) {
    console.log("expected exactly one extension ID");
    process.exit(1);
  }

  extensionId = arg;
}

if (!extensionId) {
  console.log(USAGE);
  process.exit(1);
}

const EXTENSIONS_TOML = "extensions.toml";

/** @type {Awaited<ReturnType<typeof removeExtensionFromToml>>} */
let removal;
try {
  removal = await removeExtensionFromToml(EXTENSIONS_TOML, extensionId);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
console.log(`Removed '${extensionId}' from '${EXTENSIONS_TOML}'`);

const { removed, remaining } = removal;

const submodulePath = removed["submodule"];

const submoduleStillInUse = Object.values(remaining).some(
  (extensionInfo) => extensionInfo.submodule === submodulePath,
);

if (submoduleStillInUse) {
  console.log(
    `Keeping submodule '${submodulePath}' as it is still used by other extensions`,
  );
} else {
  await removeGitSubmodule(submodulePath);
}

await stageGitPaths([EXTENSIONS_TOML]);
