import { danger, fail } from "danger";
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

// Label to use when a PR does not update an extension.
const ALLOW_NO_EXTENSION_CHANGES_LABEL_NAME = "allow-no-extension";

const hasNoExtensionChangesLabel = danger.github.issue.labels.some(
  (label) => label.name === ALLOW_NO_EXTENSION_CHANGES_LABEL_NAME,
);

if (!wasExtensionsTomlModified && !hasNoExtensionChangesLabel) {
  fail(
    [
      "This PR doesn't include changes to `extensions.toml`.",
      "",
      "If you are creating a new extension, add a new entry to it.",
      "",
      "If you are updating an existing extension, update the version number in the corresponding entry.",
      "",
      "If your PR is not supposed to update or add an extension, state it explicitly and wait for a maintainer to add the `other` label.",
    ].join("\n"),
  );
}
