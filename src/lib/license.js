import path from "node:path";

/**
 * Normalizes whitespace in the given text by collapsing all sequences of
 * whitespace characters (spaces, newlines, tabs, etc.) into a single space.
 * This makes license matching insensitive to text wrapping.
 * @param {string} text
 * @returns {string}
 */
export function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * @param {string} fileName
 * @returns {boolean}
 */
export function hasLicenseFileName(fileName) {
  const nameWithoutExt = path.parse(fileName).name.toLowerCase();

  return (
    nameWithoutExt.startsWith("licence") || nameWithoutExt.startsWith("license")
  );
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

const BSD_COMMON_PATTERNS = [
  /Copyright/i,
  /Redistribution and use in source and binary forms, with or without/i,
  /modification, are permitted provided that the following conditions/i,
  /1\. Redistributions of source code must retain the above copyright/i,
  /2\. Redistributions in binary form must reproduce the above copyright/i,
  /THIS SOFTWARE IS PROVIDED BY THE (?:COPYRIGHT HOLDERS AND CONTRIBUTORS|AUTHOR AND CONTRIBUTORS) "AS IS"/i,
  /IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE/i,
  /DISCLAIMED\. IN NO EVENT SHALL THE (?:COPYRIGHT HOLDER|AUTHOR) OR CONTRIBUTORS BE LIABLE/i,
];

const BSD_3_CLAUSE_ONLY_PATTERN =
  /3\. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from/i;

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isBsd2ClauseLicense(licenseContent) {
  return (
    BSD_COMMON_PATTERNS.every((pattern) => pattern.test(licenseContent)) &&
    !BSD_3_CLAUSE_ONLY_PATTERN.test(licenseContent)
  );
}

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isBsd3ClauseLicense(licenseContent) {
  return (
    BSD_COMMON_PATTERNS.every((pattern) => pattern.test(licenseContent)) &&
    BSD_3_CLAUSE_ONLY_PATTERN.test(licenseContent)
  );
}

const GPL_V3_REQUIRED_PATTERNS = [
  /GNU G[eE][nN][eE][rR][aA][lL] P[uU][bB][lL][iI][cC] L[iI][cC][eE][nN][sS][eE]/i,
  /Version 3, 29 June 2007/i,
  /Free Software Foundation/i,
  /TERMS AND CONDITIONS/i,
  /0\. Definitions/i,
  /1\. Source Code/i,
  /2\. Basic Permissions/i,
  /3\. Protecting Users' Legal Rights From Anti-Circumvention Law/i,
  /4\. Conveying Verbatim Copies/i,
  /5\. Conveying Modified Source Versions/i,
  /6\. Conveying Non-Source Forms/i,
  /7\. Additional Terms/i,
  /8\. Termination/i,
  /9\. Acceptance Not Required for Having Copies/i,
  /10\. Automatic Licensing of Downstream Recipients/i,
  /11\. Patents/i,
  /12\. No Surrender of Others' Freedom/i,
  /15\. Disclaimer of Warranty/i,
  /16\. Limitation of Liability/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isGplV3License(licenseContent) {
  return GPL_V3_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}

const MIT_REQUIRED_PATTERNS = [
  /Copyright/i,
  /Permission is hereby granted, free of charge, to any person obtaining a copy/i,
  /The above copyright notice and this permission notice shall be included in all/i,
  /THE SOFTWARE IS PROVIDED ["“]AS IS["”], WITHOUT WARRANTY OF ANY KIND, EXPRESS OR/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isMitLicense(licenseContent) {
  return MIT_REQUIRED_PATTERNS.every((pattern) => pattern.test(licenseContent));
}

const ZLIB_REQUIRED_PATTERNS = [
  /(?:Copyright|\(C\))/i,
  /This software is provided [\u2018\u2019']as-is[\u2018\u2019'], without any express or implied/i,
  /warranty\.\s+In no event will the authors be held liable for any damages/i,
  /arising from the use of this software/i,
  /Permission is granted to anyone to use this software for any purpose/i,
  /including commercial applications, and to alter it and redistribute it/i,
  /freely, subject to the following restrictions:/i,
  /1\. The origin of this software must not be misrepresented/i,
  /2\. Altered source versions must be plainly marked as such/i,
  /3\. This notice may not be removed or altered from any source\s+distribution/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isZlibLicense(licenseContent) {
  return ZLIB_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}

const LGPL_V3_REQUIRED_PATTERNS = [
  /GNU LESSER GENERAL PUBLIC LICENSE/i,
  /Version 3, 29 June 2007/i,
  /Free Software Foundation/i,
  /This version of the GNU Lesser General Public License incorporates/i,
  /the terms and conditions of version 3 of the GNU General Public/i,
  /0\. Additional Definitions/i,
  /1\. Exception to Section 3 of the GNU GPL/i,
  /2\. Conveying Modified Versions/i,
  /3\. Object Code Incorporating Material from Library Header Files/i,
  /4\. Combined Works/i,
  /5\. Combined Libraries/i,
  /6\. Revised Versions of the GNU Lesser General Public License/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isLgplV3License(licenseContent) {
  return LGPL_V3_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}

const UNLICENSE_REQUIRED_PATTERNS = [
  /free and unencumbered software released into the public domain/i,
  /Anyone is free to copy, modify, publish, use, compile, sell, or/i,
  /distribute this software/i,
  /In jurisdictions that recognize copyright laws/i,
  /dedicate any and all copyright interest/i,
  /relinquishment in perpetuity of all present and future rights/i,
  /THE SOFTWARE IS PROVIDED .AS IS., WITHOUT WARRANTY OF ANY KIND/i,
  /For more information, please refer to\s+<?https?:\/\/unlicense\.org\/?>?/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isUnlicense(licenseContent) {
  return UNLICENSE_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}

const CC_BY_4_REQUIRED_PATTERNS = [
  /Attribution 4\.0 International/i,
  /Creative Commons Corporation/i,
  /Creative Commons Attribution 4\.0 International Public License/i,
  /Section 1 -- Definitions/i,
  /Section 2 -- Scope/i,
  /Section 3 -- License Conditions/i,
  /Section 4 -- Sui Generis Database Rights/i,
  /Section 5 -- Disclaimer of Warranties and Limitation of Liability/i,
  /Section 6 -- Term and Termination/i,
  /Section 7 -- Other Terms and Conditions/i,
  /Section 8 -- Interpretation/i,
  /Licensed Rights/i,
  /Adapted Material/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isCcBy4License(licenseContent) {
  return CC_BY_4_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}
