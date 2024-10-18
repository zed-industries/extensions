import { danger, warn } from "danger";
const { prHygiene } = require("danger-plugin-pr-hygiene");

prHygiene({
  rules: {
    // Don't enable this rule just yet, as it can have false positives.
    useImperativeMood: "off",
  },
});

const wasExtensionsTomlModified = danger.git.modified_files.some((file) =>
  file.includes("extensions.toml"),
);

if (!wasExtensionsTomlModified) {
  warn(
    [
      "This PR doesn't include changes to `extensions.toml`.",
      "",
      "If you are creating a new extension, add a new entry to it.",
      "",
      "If you are updating an existing extension, update the version number in the corresponding entry.",
    ].join("\n"),
  );
}
