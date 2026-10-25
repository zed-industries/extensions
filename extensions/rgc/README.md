# RGC for Zed

[RGC](https://github.com/rgc-lang/rgc) language support for the
[Zed](https://zed.dev) editor, powered by the
[tree-sitter-rgc](https://github.com/rgc-lang/tree-sitter-rgc) grammar.

## Features

- **Syntax highlighting** — keywords, types, builtins, strings, numbers,
  comments, and `@` / `@var` borrow annotations
- **Code outline** — functions, classes, enums, and interfaces
- **Bracket matching** (rainbow brackets)
- **Auto-indentation** for C-style blocks
- **Comment toggling** — `#` line comments and `/* */` block comments

## Installation

### Zed extension registry

Search for **RGC** in `zed: extensions` and install it.

### Development install

```sh
git clone https://github.com/rgc-lang/zed-rgc
```

In Zed, run `zed: install dev extension` and select the `zed-rgc` directory.
The `tree-sitter-rgc` grammar is referenced by `extension.toml` at a pinned
revision; no local grammar build is required.

## Language Server

LSP integration (`rgc lsp --stdio`) is planned for a future version.

## License

Apache-2.0. See [LICENSE](LICENSE).