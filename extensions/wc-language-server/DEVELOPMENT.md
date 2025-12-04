# Developing the Zed Web Components Extension

This document explains how to set up a local environment, iterate on the extension, and publish updates. Read [`README.md`](./README.md) if you only need to install or configure the extension inside Zed.

## Prerequisites

- Node.js 18+ and [pnpm](https://pnpm.io/) (use the workspace version by running `corepack enable`).
- Rust toolchain (via `rustup`) with the `wasm32-wasip2` target installed.
- Zed editor plus the Zed CLI (`cli: install` inside Zed adds it to `$PATH`).

## Initial setup

```bash
pnpm install
rustup target add wasm32-wasip2
```

## Daily development workflow

```bash
pnpm dev
```

`pnpm dev` performs the following steps for you:

1. Bundles the latest language-server build into `packages/zed/server/bin`.
2. Builds the Rust extension as WebAssembly using `cargo build --release --target wasm32-wasip2` and copies the output to `packages/zed/extension.wasm`.
3. Launches `zed --foreground`, opening `demos/html` (or `ZED_WORKSPACE_DIR` if you set the environment variable) so you can immediately try the extension.

Make sure you have the dev extension linked (steps below) before running the script, otherwise Zed will launch without the local build.

Environment variables used by the script:

| Variable                    | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| `WC_LANGUAGE_SERVER_BINARY` | Custom language-server entry point.         |
| `WC_LANGUAGE_SERVER_NODE`   | Override Node.js executable for the server. |
| `ZED_EXTENSIONS_DIR`        | Custom dev extensions directory.            |
| `ZED_BIN`                   | Path to the Zed executable.                 |
| `ZED_WORKSPACE_DIR`         | Workspace to open when launching Zed.       |

## Installing the dev extension into Zed

Zed loads development extensions from `~/Library/Application Support/Zed/extensions/dev` on macOS and `${XDG_DATA_HOME:-$HOME/.local/share}/zed/extensions/dev` on Linux. You only need to set this up once per machine.

```bash
# macOS example
DEV_EXT_DIR="$HOME/Library/Application Support/Zed/extensions/dev"
mkdir -p "$DEV_EXT_DIR"
ln -sfn "$PWD/packages/zed" "$DEV_EXT_DIR/wc-language-server"

# Linux example
DEV_EXT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/zed/extensions/dev"
mkdir -p "$DEV_EXT_DIR"
ln -sfn "$PWD/packages/zed" "$DEV_EXT_DIR/wc-language-server"
```

> Replace `wc-language-server` with any directory name you prefer, as long as it matches the `name` in `extension.toml`. Keep the quotes around `$DEV_EXT_DIR` so paths with spaces (like `Application Support`) are handled correctly.

After linking, restart Zed (or run `pnpm dev`) and verify the extension appears under **Extensions → Development** inside Zed.

## Manual commands

```bash
# Only copy the language-server bundle
pnpm --filter @wc-toolkit/zed run bundle

# Build the bundle and extension.wasm without launching Zed
pnpm --filter @wc-toolkit/zed run build

# Rebuild the Rust payload from this package directory
cargo build --release --target wasm32-wasip2
```

> Tip: When iterating on `src/lib.rs`, re-run the `cargo build` command above and restart Zed to load the new `extension.wasm`.

## Testing & linting

- Language-server unit tests live under `packages/language-server`; run them via `pnpm --filter @wc-toolkit/language-server test`.
- Workspace-wide linting/formatting can be invoked with `pnpm lint` and `pnpm format` at the repo root.

## Publishing

Push a tag named `v*` (for example `v0.1.0`) to trigger the `zed-extension-release` workflow. The job copies `packages/zed` into our fork of [zed-industries/extensions](https://github.com/zed-industries/extensions) and opens a release PR. You can also manually dispatch **Zed Extension Publish** in GitHub Actions to override the tag, fork, or temporary token.

Before publishing, verify:

- `pnpm dev` launches successfully and the demo workspace shows language-server output in the terminal.
- `packages/zed/extension.toml` references the correct binary path and version.
- Any user-facing changes are documented in `packages/zed/CHANGELOG.md`.

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the workflow above to test changes locally.
3. Ensure formatting/linting/tests pass.
4. Open a PR with clear reproduction steps for bug fixes or new feature demos.

Thanks for improving the Web Components experience inside Zed!
