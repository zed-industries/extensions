import { describe, expect, it } from "vitest";
import { validateManifest } from "./validation.js";

describe("validateManifest", () => {
  describe("given a valid manifest", () => {
    it("does not throw", () => {
      const validManifest = {
        name: "My Valid Extension",
        version: "1.0.0",
        authors: ["Me <me@example.com>"],
        description: "This extension is very cool",
        repository: "https://github.com/zed-extensions/my-extension",
      };

      expect(() => validateManifest(validManifest)).not.toThrow();
    });
  });

  describe('when the name starts with "Zed"', () => {
    it("throws a validation error", () => {
      expect(() =>
        validateManifest({ name: "Zed Something" }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Extension names should not start with "Zed ", as they are all Zed extensions: "Zed Something".]`,
      );
    });
  });
});
