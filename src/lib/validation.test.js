import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, expect, it } from "vitest";
import {
  hasLicenseName,
  isApache2License,
  isMitLicense,
  validateExtensionsToml,
  validateGitmodules,
  validateLicense,
  validateManifest,
} from "./validation.js";

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

describe("hasLicenseName", () => {
  it("returns true for various license names", () => {
    expect(hasLicenseName("license")).toBe(true);
    expect(hasLicenseName("LICENSE")).toBe(true);

    expect(hasLicenseName("license-apache")).toBe(true);
    expect(hasLicenseName("LICENSE-APACHE")).toBe(true);

    expect(hasLicenseName("license-mit")).toBe(true);
    expect(hasLicenseName("LICENSE-MIT")).toBe(true);

    expect(hasLicenseName("license.txt")).toBe(true);
    expect(hasLicenseName("LICENSE.txt")).toBe(true);

    expect(hasLicenseName("license.md")).toBe(true);
    expect(hasLicenseName("LICENSE.md")).toBe(true);

    expect(hasLicenseName("licence")).toBe(true);
    expect(hasLicenseName("LICENCE")).toBe(true);

    expect(hasLicenseName("licence-apache")).toBe(true);
    expect(hasLicenseName("LICENCE-APACHE")).toBe(true);

    expect(hasLicenseName("licence-mit")).toBe(true);
    expect(hasLicenseName("LICENCE-MIT")).toBe(true);

    expect(hasLicenseName("licence.txt")).toBe(true);
    expect(hasLicenseName("LICENCE.txt")).toBe(true);

    expect(hasLicenseName("licence.md")).toBe(true);
    expect(hasLicenseName("LICENCE.md")).toBe(true);
  });

  it("returns false for non-license files", () => {
    expect(hasLicenseName("README.md")).toBe(false);
    expect(hasLicenseName("Cargo.toml")).toBe(false);
  });
});

describe("isMitLicense", () => {
  it("returns true for valid MIT license text", () => {
    expect(isMitLicense(readMitLicense())).toBe(true);
  });

  it("returns false for GPL V3 license text", () => {
    expect(isMitLicense(readGplV3License())).toBe(false);
  });

  it("returns false for Apache 2.0 license text", () => {
    expect(isMitLicense(readApache2License())).toBe(false);
  });
});

describe("isApache2License", () => {
  it("returns true for valid Apache 2.0 license text", () => {
    expect(isApache2License(readApache2License())).toBe(true);
  });

  it("returns false for MIT license text", () => {
    expect(isApache2License(readMitLicense())).toBe(false);
  });

  it("returns false for GPL V3 license text", () => {
    expect(isApache2License(readGplV3License())).toBe(false);
  });
});

describe("validateLicense", () => {
  it("throws when no license file is present", () => {
    const files = [
      { name: "README.md", content: "# My Extension" },
      { name: "Cargo.toml", content: "[package]\nname = 'my-extension'" },
    ];

    expect(() => validateLicense(files)).toThrow(
      "Files do not contain a valid MIT or Apache 2.0 license",
    );
  });

  it("throws when GPL license is present (not MIT or Apache 2.0)", () => {
    const files = [
      { name: "README.md", content: "# My Extension" },
      { name: "Cargo.toml", content: "[package]\nname = 'my-extension'" },
      { name: "LICENSE", content: readGplV3License() },
    ];

    expect(() => validateLicense(files)).toThrow(
      "Files do not contain a valid MIT or Apache 2.0 license",
    );
  });

  it("does not throw when Apache 2.0 license is present", () => {
    const files = [
      { name: "README.md", content: "# My Extension" },
      { name: "Cargo.toml", content: "[package]\nname = 'my-extension'" },
      { name: "LICENSE", content: readApache2License() },
    ];

    expect(() => validateLicense(files)).not.toThrow();
  });

  it("does not throw when MIT license is present", () => {
    const files = [
      { name: "README.md", content: "# My Extension" },
      { name: "Cargo.toml", content: "[package]\nname = 'my-extension'" },
      { name: "LICENSE", content: readMitLicense() },
    ];

    expect(() => validateLicense(files)).not.toThrow();
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readMitLicense() {
  return readFileSync(
    join(__dirname, "test_licenses", "test_mit_license"),
    "utf-8",
  );
}

function readApache2License() {
  return readFileSync(
    join(__dirname, "test_licenses", "test_apache_2_license"),
    "utf-8",
  );
}

function readGplV3License() {
  return readFileSync(
    join(__dirname, "test_licenses", "test_gpl_v3_license"),
    "utf-8",
  );
}
