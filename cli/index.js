#!/usr/bin/env node

import * as p from "@clack/prompts";
// import color from 'picocolors';
import { exec, execFile } from "node:child_process";

/**
 * @param {"docker" | "node"} toolName
 */
async function getToolsVersion(toolName) {
  return new Promise((resolve, reject) => {
    exec(`${toolName} --version`, (err, stdout, stderr) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function doctor() {
  let status = {
    isDocker: false,
    isNode: false,
  };

  status.isDocker = await getToolsVersion("docker");
  status.isNode = await getToolsVersion("node");

  return status;
}

const s = p.spinner();

async function main() {
  console.clear();

  p.intro("Let's add a new extension to Zed!");

  s.start("Checking for tools");

  const { isDocker, isNode } = await doctor();

  if (!isDocker) {
    // p.log("Docker is not installed");
    s.stop("Docker is not installed", 1);
    process.exit(1);
  } else {
    p.log.success("Docker is installed");
    // TODO: check if docker is running
    // exec("docker ps", (err, stdout, stderr) => {
    //  if (err) {
    //   console.error("Docker is not running", stdout, stderr);
    //  } else {
    //    console.log("Docker is running", stdout, stderr);
    //  }
    // });
  }

  if (!isNode) {
    s.stop("Node is not installed", 1);
    process.exit(1);
  } else {
    p.log.success("Node is installed");
  }

  s.stop("All tools are installed", 0);

  const project = await p.group(
    {
      language: () =>
        p.text({
          message: "What language is the grammar written for?",
          placeholder: "javascript",
          validate: (value) => {
            if (!value) return "Please enter a language.";
          },
        }),
      grammarPath: () =>
        p.text({
          message: "Where is the grammar located?",
          placeholder: "../../relative-path/to/grammar.js",
          validate: (value) => {
            if (!value) return "Please enter a path.";
            if (value[0] !== ".") return "Please enter a relative path.";
          },
        }),
      install: () =>
        p.confirm({
          message: "Do you want to install the extension?",
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  s.start("Generating WASM file");

  await new Promise((resolve, reject) => {
    execFile(
      "tree-sitter",
      ["build-wasm"],
      { cwd: project.grammarPath },
      (err, stdout, stderr) => {
        if (err) {
          s.stop("Error generating WASM file", 1);
          reject();
        } else {
          s.stop("WASM file generated", 0);
          resolve();
        }
      },
    );
  });

  await new Promise((resolve, reject) => {
    exec(
      `mv ${project.grammarPath}/tree-sitter-${project.language}.wasm ../extensions/${project.language}/grammars/`,
      (err, stdout, stderr) => {
        if (err) {
          s.stop("Error moving WASM file", 1);
          reject();
        } else {
          s.stop("WASM file moved", 0);
          resolve();
        }
      },
    );
  });

  if (project.install) {
    s.start("Installing extension");
    await new Promise((resolve, reject) => {
      exec(
        `cp -R ../extensions/pkl "${process.env.HOME}/Library/Application\ Support/Zed/extensions/installed/pkl"`,
        (err, stdout, stderr) => {
          if (err) {
            s.stop("Error installing extension", 1);
            reject();
          } else {
            s.stop("Extension installed", 0);
            resolve();
          }
        },
      );
    });
  }

  p.outro(
    `You can now use the ${project.language} grammar in Zed by opening a file with the .${project.language} extension.`,
  );
}

main().catch(console.error);
