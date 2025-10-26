import path from "node:path";

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

const BSD_3_CLAUSE_REQUIRED_PATTERNS = [
  /BSD 3-Clause License/i,
  /Copyright/i,
  /Redistribution and use in source and binary forms, with or without/i,
  /modification, are permitted provided that the following conditions are met:/i,
  /1\. Redistributions of source code must retain the above copyright notice/i,
  /2\. Redistributions in binary form must reproduce the above copyright notice/i,
  /3\. Neither the name of the copyright holder nor the names of its/i,
  /contributors may be used to endorse or promote products derived from/i,
  /THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"/i,
  /IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE/i,
  /DISCLAIMED\. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isBsd3ClauseLicense(licenseContent) {
  return BSD_3_CLAUSE_REQUIRED_PATTERNS.every((pattern) =>
    pattern.test(licenseContent),
  );
}

const GPL_V3_REQUIRED_PATTERNS = [
  /GNU GENERAL PUBLIC LICENSE/i,
  /Version 3, 29 June 2007/i,
  /Free Software Foundation/i,
  /TERMS AND CONDITIONS/i,
  /0\. Definitions\./i,
  /1\. Source Code\./i,
  /2\. Basic Permissions\./i,
  /3\. Protecting Users' Legal Rights From Anti-Circumvention Law\./i,
  /4\. Conveying Verbatim Copies\./i,
  /5\. Conveying Modified Source Versions\./i,
  /6\. Conveying Non-Source Forms\./i,
  /7\. Additional Terms\./i,
  /8\. Termination\./i,
  /9\. Acceptance Not Required for Having Copies\./i,
  /10\. Automatic Licensing of Downstream Recipients\./i,
  /11\. Patents\./i,
  /12\. No Surrender of Others' Freedom\./i,
  /15\. Disclaimer of Warranty\./i,
  /16\. Limitation of Liability\./i,
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
  /The above copyright notice and this permission notice shall be included in[ \n]all/i,
  /THE SOFTWARE IS PROVIDED ["“]AS IS["”], WITHOUT WARRANTY OF ANY KIND, EXPRESS OR/i,
];

/**
 * @param {string} licenseContent
 * @returns {boolean}
 */
export function isMitLicense(licenseContent) {
  return MIT_REQUIRED_PATTERNS.every((pattern) => pattern.test(licenseContent));
}
