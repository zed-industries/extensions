import { sortExtensionsToml } from "./lib/extensions-toml.js";
import { sortGitmodules } from "./lib/git.js";

await sortExtensionsToml("extensions.toml");
await sortGitmodules(".gitmodules");
