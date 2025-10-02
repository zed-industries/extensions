import path from "node:path";

/**
 * @param {string} fileName
 * @returns {boolean}
 */
export function hasLicenseFileName(fileName) {
  const nameWithoutExt = path.parse(fileName).name.toLowerCase();

  if (nameWithoutExt.startsWith("licence")) {
    return true;
  }

  if (nameWithoutExt.startsWith("license")) {
    return true;
  }

  return false;
}

const MIT_REQUIRED_PATTERNS = [
  /MIT License/i,
  /Copyright \(c\)/i,
  /Permission is hereby granted, free of charge, to any person obtaining a copy/i,
  /The above copyright notice and this permission notice shall be included in all/i,
  /THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isMitLicense(licenseContent) {
  return MIT_REQUIRED_PATTERNS.every((pattern) => pattern.test(licenseContent));
}

const APACHE_2_REQUIRED_PATTERNS = [
  /Apache License/i,
  /Version 2\.0, January 2004/i,
  /http:\/\/www.apache.org\/licenses\//i,
  /TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION/i,
  /1\. Definitions\./i,
  /2\. Grant of Copyright License\./i,
  /3\. Grant of Patent License\./i,
  /4\. Redistribution\./i,
  /5\. Submission of Contributions\./i,
  /6\. Trademarks\./i,
  /7\. Disclaimer of Warranty\./i,
  /8\. Limitation of Liability\./i,
  /9\. Accepting Warranty or Additional Liability\./i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isApache2License(licenseContent) {
  return APACHE_2_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}
