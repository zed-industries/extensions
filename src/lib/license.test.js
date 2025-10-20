import { describe, expect, it } from "vitest";
import {
  hasLicenseFileName,
  isApache2License,
  isMitLicense,
} from "./license.js";
import {
  readApache2License,
  readGplV3License,
  readMitLicense,
} from "./test-licenses/utilities.js";

describe("hasLicenseFileName", () => {
  it("returns true for various license names", () => {
    expect(hasLicenseFileName("license")).toBe(true);
    expect(hasLicenseFileName("LICENSE")).toBe(true);

    expect(hasLicenseFileName("license-apache")).toBe(true);
    expect(hasLicenseFileName("LICENSE-APACHE")).toBe(true);

    expect(hasLicenseFileName("license-mit")).toBe(true);
    expect(hasLicenseFileName("LICENSE-MIT")).toBe(true);

    expect(hasLicenseFileName("license.txt")).toBe(true);
    expect(hasLicenseFileName("LICENSE.txt")).toBe(true);

    expect(hasLicenseFileName("license.md")).toBe(true);
    expect(hasLicenseFileName("LICENSE.md")).toBe(true);

    expect(hasLicenseFileName("licence")).toBe(true);
    expect(hasLicenseFileName("LICENCE")).toBe(true);

    expect(hasLicenseFileName("licence-apache")).toBe(true);
    expect(hasLicenseFileName("LICENCE-APACHE")).toBe(true);

    expect(hasLicenseFileName("licence-mit")).toBe(true);
    expect(hasLicenseFileName("LICENCE-MIT")).toBe(true);

    expect(hasLicenseFileName("licence.txt")).toBe(true);
    expect(hasLicenseFileName("LICENCE.txt")).toBe(true);

    expect(hasLicenseFileName("licence.md")).toBe(true);
    expect(hasLicenseFileName("LICENCE.md")).toBe(true);
  });

  it("returns false for non-license files", () => {
    expect(hasLicenseFileName("README.md")).toBe(false);
    expect(hasLicenseFileName("Cargo.toml")).toBe(false);
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
