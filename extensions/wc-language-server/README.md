# Web Components Language Server for Zed

This extension brings the @wc-toolkit language server into Zed so you get framework-aware completions, diagnostics, and hover documentation while editing HTML, TypeScript, Markdown, Astro, Vue SFCs, and other templates that include custom elements.

## Installation

### From Zed's extension browser

1. Open the command palette (`Cmd/Ctrl` + `Shift` + `P`).
2. Run **"Zed: Extensions"**.
3. Search for **"Web Components Language Server"**.
4. Select the entry and press **Install**.

Zed will download the latest released version (triggered by `v*` tags in this repository) and enable it for the current workspace.

### Local build (optional)

If you need a bleeding-edge build before a tag is published, clone this repo and run `pnpm dev` from the repo root. The script links a development copy into Zed's extensions directory and launches `zed --foreground` with the demo workspace. Refer to [`DEVELOPMENT.md`](./DEVELOPMENT.md) for the complete setup instructions.

## Using the extension

Once the extension is installed:

- Open a workspace that contains your Web Components project (if you are using an npm package with web components that has a `custom-elements.json` file or if there is one locally, these will be automatically detected).
- The extension automatically activates for the languages listed in `extension.toml` (HTML, JS/TS, Markdown, Vue, Astro, etc.).
- Diagnostics and completion quality can be customized when you provide a workspace-level `wc.config.js`, described below.

## Configuring your project with `wc.config.js`

Place a `wc.config.js` (or `.cjs`/`.mjs`) file in the root of your workspace. The extension reads this file on startup to learn where your component manifest is stored, which paths to ignore, and how strict diagnostics should be.

### Example configuration

```js
/** @type {import('@wc-toolkit/wctools').WCConfig} */
export default {
  manifestSrc: "custom-elements.json",
  exclude: ["node_modules/**", "dist/**", "build/**"],
  typeSrc: "parsedType",
  diagnosticSeverity: {
    invalidBoolean: "error",
    invalidNumber: "error",
    invalidAttributeValue: "error",
    deprecatedAttribute: "warning",
    deprecatedElement: "warning",
    duplicateAttribute: "error",
    unknownElement: "hint",
    unknownAttribute: "hint",
  },
  debug: false,
  libraries: {
    "@awesome.me/webawesome": {
      manifestSrc:
        "https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.0.0/dist/custom-elements.json",
      // tagFormatter: (tag) => tag.replace('wa-', 'awesome-'),
      // diagnosticSeverity: { duplicateAttribute: 'warning' }
    },
  },
};
```

### Key options

- **`manifestSrc`** – Path or URL to the `custom-elements.json` manifest created by your build. Point this at wherever your design system emits metadata.
- **`exclude`** – Glob patterns the language server should ignore when scanning files for diagnostics.
- **`typeSrc`** – Controls how member types are resolved (e.g., `parsedType` or `closure`).
- **`diagnosticSeverity`** – Override the severity (`error`, `warning`, `hint`) per diagnostic type so the extension only blocks on what matters to your team.
- **`debug`** – Set to `true` to log detailed resolver information in Zed's developer console.
- **`libraries`** – Provide per-package overrides. Common use cases include fetching a manifest from a CDN, transforming tag names via `tagFormatter`, or customizing severities for a specific component library.

You can omit any fields you don't need; the extension falls back to sensible defaults.

## Keeping up with releases

When a new `v*` tag is pushed, `.github/workflows/zed-extension-release.yml` copies `packages/zed` into our fork of [zed-industries/extensions](https://github.com/zed-industries/extensions) and opens a PR. The workflow can also be dispatched manually from the **Actions** tab ("Zed Extension Publish") if you need to target a specific tag, fork, or temporary token.

## Hacking on the extension

If you want to contribute fixes or build custom features, read [`DEVELOPMENT.md`](./DEVELOPMENT.md) for prerequisites, development workflows, and release tips. PRs are welcome!
