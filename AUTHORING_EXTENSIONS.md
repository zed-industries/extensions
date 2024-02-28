# Authoring Zed Extensions

Looking to write your own extension for Zed? You've come to the right place!

## Extension capabilities

Extensions are currently capable of extending Zed in the following ways:

### Grammars

Extensions may provide [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammars that allow Zed to parse different kinds of syntax.

These are typically used in conjunction with languages.

### Languages

Extensions may provide languages to extend Zed with support for a particular language.

Currently this is used for things like syntax highlighting and outlining.

Support for defining language servers in extensions will be coming in the future.

### Themes

Extensions may provide themes to change the look of Zed.

## Extension structure

A Zed extension is a Git repository that contains an `extension.json`:

```json
{
  "name": "My extension",
  "version": "0.0.1",
  "authors": ["Your Name <you@example.com>"],
  "description": "My cool extension",
  "repository": "https://github.com/your-name/my-zed-extension"
}
```

Extensions may contain any combination of grammars, languages, and themes. For example, you can have an extension that provides both a grammar and a language, or one that just provides a theme.

### Grammars

The `grammars` directory in an extension should contain one or more TOML files containing grammar configs.

Each file must specify the repository where the Tree-sitter grammar should be loaded from, as well as the SHA of the Git commit to use:

```toml
repository = "https://github.com/polarmutex/tree-sitter-beancount"
commit = "dd6f4ec9b01dd18cc4aa8c8517738414fb98cd63"
```

You may also supply an optional `path` to indicate that the Tree-sitter grammar should be loaded from a subdirectory within the repository:

```toml
repository = "https://github.com/polarmutex/tree-sitter-php"
commit = "5ceb92397f68b4aad73b09dee3c63639cb4611e7"
path = "php_only"
```

### Languages

The `languages` directory in an extension should contain one or more directories containing languages.

### Themes

The `themes` directory in an extension should contain one or more theme files.

Each theme file should adhere to the JSON schema specified at [`https://zed.dev/schema/themes/v0.1.0.json`](https://zed.dev/schema/themes/v0.1.0.json).

See [this blog post](https://zed.dev/blog/user-themes-now-in-preview) for more details about creating themes.

## Testing your extension locally

To test your extension locally, you can add it to the `~/Library/Application\ Support/Zed/extensions/installed/` directory.

Zed should automatically pick up the extension as installed and load it. If it doesn't, you can run `zed: reload extensions` from the command palette to force a reload.

### Grammars

If your extension contains grammars, you will need to install the Tree-sitter CLI to generate the WASM grammar file by running the `build-wasm` command to generate the WASM grammar and then place the `<grammar>.wasm` file in the `grammars` directory in the extension.

## Publishing your extension

To publish an extension, open a PR to [this repo](https://github.com/zed-industries/extensions).

In your PR do the following:

1. Add your extension as a Git submodule within the `extensions/` directory
2. Add a new entry to `extensions.toml` containing your extension:
   ```toml
   [my-extension]
   path = "extensions/my-extension"
   version = "0.0.1"
   ```

Once your PR is merged, the extension will be packaged and published to the Zed extension registry.

## Updating an extension

To update an extension, open a PR to [this repo](https://github.com/zed-industries/extensions).

In your PR do the following:

1. Update the extension's submodule to that commit of the new version.
2. Update the `version` field for the extension in `extensions.toml`

- Make sure the `version` matches the one set in `extension.json` at the particular commit.

If you'd like to automate this process, there is a [community GitHub Action](https://github.com/huacnlee/zed-extension-action) you can use.
