import { describe, expect, it } from "vitest";
import {
  hasLicenseFileName,
  isApache2License,
  isBsd3ClauseLicense,
  isGplV3License,
  isMitLicense,
} from "./license.js";
import {
  readApache2License,
  readBsd3ClauseLicense,
  readGplV3License,
  readMitLicense,
  readOtherLicense,
} from "./test-licenses/utilities.js";

describe("hasLicenseFileName", () => {
  it("returns true for various license names", () => {
    const validLicenseFileNames = [
      // Generic (no extension)
      "LICENSE",
      "LICENCE",
      "license",
      "licence",
      // Generic with .txt extension
      "LICENSE.txt",
      "LICENCE.txt",
      "license.txt",
      "licence.txt",
      // Generic with .md extension
      "LICENSE.md",
      "LICENCE.md",
      "license.md",
      "licence.md",
      // Apache 2.0
      "LICENSE-APACHE",
      "LICENCE-APACHE",
      "license-apache",
      "licence-apache",
      // BSD 3 Clause
      "LICENSE-BSD",
      "LICENCE-BSD",
      "license-bsd",
      "licence-bsd",
      // GNU GPLv3
      "LICENSE-GPL",
      "LICENCE-GPL",
      "license-gpl",
      "licence-gpl",
      // MIT
      "LICENSE-MIT",
      "LICENCE-MIT",
      "license-mit",
      "licence-mit",
    ];

    validLicenseFileNames.forEach((fileName) => {
      expect(hasLicenseFileName(fileName)).toBe(true);
    });
  });

  it("returns false for non-license files", () => {
    expect(hasLicenseFileName("README.md")).toBe(false);
    expect(hasLicenseFileName("Cargo.toml")).toBe(false);
  });
});

describe("isApache2License", () => {
  it("returns true for valid Apache 2.0 license text", () => {
    expect(isApache2License(readApache2License())).toBe(true);
  });

  it("returns false for BSD 3-Clause license text", () => {
    expect(isApache2License(readBsd3ClauseLicense())).toBe(false);
  });

  it("returns false for GPL V3 license text", () => {
    expect(isApache2License(readGplV3License())).toBe(false);
  });

  it("returns false for MIT license text", () => {
    expect(isApache2License(readMitLicense())).toBe(false);
  });

  it("returns false for other license text", () => {
    expect(isApache2License(readOtherLicense())).toBe(false);
  });
});

describe("isBsd3ClauseLicense", () => {
  it("returns true for valid BSD 3-Clause license text", () => {
    expect(isBsd3ClauseLicense(readBsd3ClauseLicense())).toBe(true);
  });

  it("returns false for Apache 2.0 license text", () => {
    expect(isBsd3ClauseLicense(readApache2License())).toBe(false);
  });

  it("returns false for GPL V3 license text", () => {
    expect(isBsd3ClauseLicense(readGplV3License())).toBe(false);
  });

  it("returns false for MIT license text", () => {
    expect(isBsd3ClauseLicense(readMitLicense())).toBe(false);
  });

  it("returns false for other license text", () => {
    expect(isBsd3ClauseLicense(readOtherLicense())).toBe(false);
  });
});

describe("isGPLv3License", () => {
  it("returns true for valid GNU GPLv3 license text", () => {
    expect(isGplV3License(readGplV3License())).toBe(true);
  });

  it("returns false for Apache 2.0 license text", () => {
    expect(isGplV3License(readApache2License())).toBe(false);
  });

  it("returns false for BSD 3-Clause license text", () => {
    expect(isGplV3License(readBsd3ClauseLicense())).toBe(false);
  });

  it("returns false for MIT license text", () => {
    expect(isGplV3License(readMitLicense())).toBe(false);
  });

  it("returns false for other license text", () => {
    expect(isGplV3License(readOtherLicense())).toBe(false);
  });
});

describe("isMitLicense", () => {
  it("returns true for valid MIT license text", () => {
    expect(isMitLicense(readMitLicense())).toBe(true);
  });

  it("returns false for Apache 2.0 license text", () => {
    expect(isMitLicense(readApache2License())).toBe(false);
  });

  it("returns false for BSD 3-Clause license text", () => {
    expect(isMitLicense(readBsd3ClauseLicense())).toBe(false);
  });

  it("returns false for GPL V3 license text", () => {
    expect(isMitLicense(readGplV3License())).toBe(false);
  });

  it("returns false for other license text", () => {
    expect(isMitLicense(readOtherLicense())).toBe(false);
  });
});
