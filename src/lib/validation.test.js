import { describe, expect, it } from "vitest";
import { validateManifest, validateTheme } from "./validation.js";

describe("validateManifest", () => {
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
