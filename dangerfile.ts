import { danger, message, warn } from "danger";
const { prHygiene } = require("danger-plugin-pr-hygiene");

prHygiene({
  rules: {
    // Don't enable this rule just yet, as it can have false positives.
    useImperativeMood: "off",
  },
});
