import { describe, expect, it } from "vitest";
import {
  validateExtensionsToml,
  validateGitmodules,
  validateLicense,
  validateManifest,
  validateExtensionIdsNotChanged,
} from "./validation.js";
import {
  readApache2License,
  readBsd2ClauseLicense,
  readBsd3ClauseLicense,
  readGplV3License,
  readLgplV3License,
  readMitLicense,
  readOtherLicense,
  readZlibLicense,
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
  describe("when `extensions.toml` only contains extensions with valid IDs and entries", () => {
    it.each(["my-cool-extension", "base16"])(
      'does not throw for "%s"',
      (extensionId) => {
        const extensionsToml = {
          [extensionId]: {
            submodule: "https://github.com/zed-extensions/my-extension",
            version: "0.1.0",
          },
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

  describe("when `extensions.toml` contains an entry with missing submodule", () => {
    it.each(["my-cool-extension"])('does not throw for "%s"', (extensionId) => {
      const extensionsToml = {
        [extensionId]: {
          version: "0.1.0",
        },
      };

      expect(() => validateExtensionsToml(extensionsToml)).toThrowError(
        `Missing required field "submodule" or "version" for extension "${extensionId}"`,
      );
    });
  });

  describe("when `extensions.toml` contains an entry with missing version", () => {
    it.each(["my-cool-extension"])('does not throw for "%s"', (extensionId) => {
      const extensionsToml = {
        [extensionId]: {
          submodule: "https://github.com/zed-extensions/my-extension",
        },
      };

      expect(() => validateExtensionsToml(extensionsToml)).toThrowError(
        `Missing required field "submodule" or "version" for extension "${extensionId}"`,
      );
    });
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
          - BSD 2-Clause
          - BSD 3-Clause
          - GNU GPLv3
          - GNU LGPLv3
          - MIT
          - zlib
        See: https://zed.dev/docs/extensions/developing-extensions#extension-license-requirements]
      `);
  });

  it("throws when incorrect license contents are found (not Apache 2.0, BSD 2-Clause, BSD 3-Clause, MIT, GNU GPLv3, GNU LGPLv3 or zlib)", () => {
    const licenseCandidates = [
      { name: "LICENSE.txt", content: readOtherLicense() },
      { name: "LICENSE.md", content: readOtherLicense() },
    ];

    expect(() => validateLicense(licenseCandidates))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: No valid license found in the following files: "LICENSE.txt", "LICENSE.md".
        Extension repositories must have a valid license:
          - Apache 2.0
          - BSD 2-Clause
          - BSD 3-Clause
          - GNU GPLv3
          - GNU LGPLv3
          - MIT
          - zlib
        See: https://zed.dev/docs/extensions/developing-extensions#extension-license-requirements]
      `);
  });

  it("does not throw when Apache 2.0 license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readApache2License() },
    ];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when BSD 2-Clause license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readBsd2ClauseLicense() },
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

  it("does not throw when LGPL v3 license is present", () => {
    const licenseCandidates = [
      { name: "LICENSE", content: readLgplV3License() },
    ];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when MIT license is present", () => {
    const licenseCandidates = [{ name: "LICENSE", content: readMitLicense() }];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });

  it("does not throw when zlib license is present", () => {
    const licenseCandidates = [{ name: "LICENSE", content: readZlibLicense() }];

    expect(() => validateLicense(licenseCandidates)).not.toThrow();
  });
});

describe("validateExtensionIdsNotChanged", () => {
  describe("when only additions or only removals occur", () => {
    it("does not throw when extensions are identical", () => {
      const currentExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
      };

      const previousExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).not.toThrow();
    });

    it("does not throw when only adding extensions", () => {
      const currentExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
        "new-extension": {
          submodule: "extensions/new-extension",
          version: "1.0.0",
        },
      };

      const previousExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).not.toThrow();
    });

    it("does not throw when only removing extensions", () => {
      const currentExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
      };

      const previousExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
        "removed-extension": {
          submodule: "extensions/removed-extension",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).not.toThrow();
    });

    it("does not throw when versions change but IDs remain the same", () => {
      const currentExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "2.0.0",
        },
      };

      const previousExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).not.toThrow();
    });
  });

  describe("when both additions and removals occur", () => {
    it("throws when IDs are both added and removed", () => {
      const currentExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
        "new-extension": {
          submodule: "extensions/new-extension",
          version: "1.0.0",
        },
      };

      const previousExtensionsToml = {
        "my-extension": {
          submodule: "extensions/my-extension",
          version: "1.0.0",
        },
        "old-extension": {
          submodule: "extensions/old-extension",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: Extension IDs must not change between versions.
        1 ID(s) were removed: old-extension
        1 ID(s) were added: new-extension

        If you need to rename an extension, update the display name in the extension's manifest instead.]
      `);
    });

    it("throws when multiple IDs are both added and removed", () => {
      const currentExtensionsToml = {
        "unchanged-extension": {
          submodule: "extensions/unchanged-extension",
          version: "1.0.0",
        },
        "new-extension-1": {
          submodule: "extensions/new-extension-1",
          version: "1.0.0",
        },
        "new-extension-2": {
          submodule: "extensions/new-extension-2",
          version: "1.0.0",
        },
      };

      const previousExtensionsToml = {
        "unchanged-extension": {
          submodule: "extensions/unchanged-extension",
          version: "1.0.0",
        },
        "old-extension-1": {
          submodule: "extensions/old-extension-1",
          version: "1.0.0",
        },
        "old-extension-2": {
          submodule: "extensions/old-extension-2",
          version: "1.0.0",
        },
      };

      expect(() =>
        validateExtensionIdsNotChanged(
          currentExtensionsToml,
          previousExtensionsToml,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: Extension IDs must not change between versions.
        2 ID(s) were removed: old-extension-1, old-extension-2
        2 ID(s) were added: new-extension-1, new-extension-2

        If you need to rename an extension, update the display name in the extension's manifest instead.]
      `);
    });
  });
});
