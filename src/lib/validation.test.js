import { describe, expect, it } from "vitest";
import {
  validateExtensionsToml,
  validateGitmodules,
  validateLicense,
  validateManifest,
} from "./validation.js";
import {
  readApache2License,
  readBsd3ClauseLicense,
  readGplV3License,
  readMitLicense,
  readOtherLicense,
} from "./test-licenses/utilities.js";

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

describe("validateExtensionsToml", () => {
  describe("when `extensions.toml` only contains extensions with valid IDs", () => {
    it.each(["my-cool-extension", "base16"])(
      'does not throw for "%s"',
      (extensionId) => {
        const extensionsToml = {
          [extensionId]: {},
        };

        expect(() => validateExtensionsToml(extensionsToml)).not.toThrow();
      },
    );
  });

  describe("when `extensions.toml` contains an extension ID with invalid characters", () => {
    it.each(["BadExtension", "bad_extension"])(
      'throws a validation error for "%s"',
      (extensionId) => {
        const extensionsToml = {
          [extensionId]: {},
        };

        expect(() => validateExtensionsToml(extensionsToml)).toThrowError(
          `Extension IDs must only consist of lowercase letters, numbers, and hyphens ('-'): "${extensionId}".`,
        );
      },
    );
  });
});

describe("validateGitmodules", () => {
  describe("when an entry contains a non-HTTPS URL", () => {
    it("throws a validation error", () => {
      const gitmodules = {
        "extensions/my-extension": {
          path: "extensions/my-extension",
          url: "git@github.com:me/my-extension.git",
        },
      };

      expect(() =>
        validateGitmodules(gitmodules),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Submodules must use "https://" scheme.]`,
      );
    });
  });
});

describe("validateLicense", () => {
  it("throws when no license file is present", () => {
    const licenseCandidates =
      /** @type {Array<{name: string, content: string}>} */ ([]);

    expect(() => validateLicense(licenseCandidates))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: No license was found.
        Extension repositories must have a valid license:
          - Apache 2.0
          - BSD 3-Clause
          - GNU GPLv3
          - MIT
        See: https://zed.dev/docs/extensions/developing-extensions#extension-license-requirements]
      `);
  });

  it("throws when incorrect license contents are found (not Apache 2.0, BSD 3-Clause, MIT, or GNU GPLv3)", () => {
    const licenseCandidates = [
      { name: "LICENSE.txt", content: readOtherLicense() },
      { name: "LICENSE.md", content: readOtherLicense() },
    ];

    expect(() => validateLicense(licenseCandidates))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: No valid license found in the following files: "LICENSE.txt", "LICENSE.md".
        Extension repositories must have a valid license:
          - Apache 2.0
          - BSD 3-Clause
          - GNU GPLv3
          - MIT
        See: https://zed.dev/docs/extensions/developing-extensions#extension-license-requirements]
      `);
  });

  it("does not throw when Apache 2.0 license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readApache2License() },
    ];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when BSD 3-Clause license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readBsd3ClauseLicense() },
    ];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when GPL v3 license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readGplV3License() },
    ];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when MIT license is present", () => {
    const licenseCandidates = [{ name: "LICENSE", content: readMitLicense() }];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });
});
