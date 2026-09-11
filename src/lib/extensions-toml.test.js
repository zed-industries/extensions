import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  diffExtensionIds,
  removeExtensionFromToml,
} from "./extensions-toml.js";

describe("diffExtensionIds", () => {
  it("reports added and removed extension IDs", () => {
    const current = { a: {}, c: {}, d: {} };
    const previous = { a: {}, b: {}, c: {} };

    expect(diffExtensionIds(current, previous)).toEqual({
      added: ["d"],
      removed: ["b"],
    });
  });

  it("reports nothing when the IDs are unchanged", () => {
    const current = { a: { version: "1.0.0" } };
    const previous = { a: { version: "0.9.0" } };

    expect(diffExtensionIds(current, previous)).toEqual({
      added: [],
      removed: [],
    });
  });
});

describe("removeExtensionFromToml", () => {
  /** @type {string} */
  let tempDir;
  /** @type {string} */
  let tomlPath;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "extensions-toml-"));
    tomlPath = path.join(tempDir, "extensions.toml");
    await fs.writeFile(
      tomlPath,
      [
        "[b-ext]",
        'submodule = "extensions/b-ext"',
        'version = "2.0.0"',
        "",
        "[a-ext]",
        'submodule = "extensions/a-ext"',
        'version = "1.0.0"',
        "",
      ].join("\n"),
    );
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("removes the entry, returns it, and writes the rest sorted", async () => {
    const removed = await removeExtensionFromToml(tomlPath, "b-ext");

    expect(removed).toEqual({
      submodule: "extensions/b-ext",
      version: "2.0.0",
    });
    expect(await fs.readFile(tomlPath, "utf-8")).toMatchInlineSnapshot(`
      "[a-ext]
      submodule = "extensions/a-ext"
      version = "1.0.0"
      "
    `);
  });

  it("throws when the extension does not exist", async () => {
    await expect(
      removeExtensionFromToml(tomlPath, "missing"),
    ).rejects.toThrowError(
      /No extension with ID "missing" found in '.*extensions\.toml'\./,
    );
  });
});
