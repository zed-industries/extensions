import { execFile } from "node:child_process";

/**
 * @param {string} command
 * @param {readonly string[]} args
 * @param {any} [options]
 * @returns {Promise<{ stdout: string; stderr: string}>}
 */
export function exec(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          stdout: stdout.toString("utf8"),
          stderr: stderr.toString("utf8"),
        });
      }
    });
  });
}
