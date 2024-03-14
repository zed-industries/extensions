import { describe, expect, it } from "vitest";
import { validateManifest, validateTheme } from "./validation.js";

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

  describe("when the `authors` field is missing", () => {
    it("throws a validation error", () => {
      expect(() =>
        validateManifest({ name: "My Cool Extension", version: "1.0.0" }),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Missing "authors" field.]`);
    });
  });

  describe("when the `authors` field has a string value", () => {
    it("throws a validation error", () => {
      expect(() =>
        validateManifest({
          name: "My Cool Extension",
          version: "1.0.0",
          authors: "Me",
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: "authors" field must be an array of strings.]`,
      );
    });
  });

  describe("when the `authors` field is an array with non-string values", () => {
    it("throws a validation error", () => {
      expect(() =>
        validateManifest({
          name: "My Cool Extension",
          version: "1.0.0",
          authors: ["Me", 1, { name: "Me" }],
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: "authors" field must be an array of strings.]`,
      );
    });
  });
});

describe("validateTheme", () => {
  describe("given a valid theme", () => {
    it("does not throw", () => {
      const minimalValidTheme = {
        name: "My Valid Theme",
        author: "Me",
        themes: [],
      };

      expect(() => validateTheme(minimalValidTheme)).not.toThrow();
    });
  });

  describe("given an invalid theme", () => {
    it("throws a validation error", () => {
      expect(() =>
        validateTheme({
          name: "My Invalid Theme",
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: data must have required property 'author']`,
      );
    });
  });
});
