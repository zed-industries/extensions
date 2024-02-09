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
  "authors": [
    "Your Name <you@example.com>"
  ],
  "description": "My cool extension",
  "repository": "https://github.com/your-name/my-zed-extension",
  "grammars": [],
  "languages": [],
  "themes": []
}
```

Extensions may contain any combination of grammars, languages, and themes. For example, you can have an extension that provides both a grammar and a language, or one that just provides a theme.

### Grammars

The `grammars` field in `extension.json` is an array containing paths to Tree-sitter grammars.

Generally you will want to add a repository containing a Tree-sitter grammar as a Git submodule and then update the `grammars` list to point to that directory:

```json
{
  "grammars": ["grammars/tree-sitter-example"]
}
```

### Languages

The `languages` field in `extension.json` is an array containing paths to directories containing a language configuration.

### Themes

The `themes` field in `extension.json` is an array containing paths to theme files.

Each theme file should adhere to the JSON schema specified at [`https://zed.dev/schema/themes/v0.1.0.json`](https://zed.dev/schema/themes/v0.1.0.json).

See [this blog post](https://zed.dev/blog/user-themes-now-in-preview) for more details about creating themes.

## Publishing your extension

To publish an extension, open a PR to [this repo](https://github.com/zed-industries/extensions).

In your PR, add your extension as a Git submodule within the `extensions/` directory.

Once your PR is merged, the extension will be packaged and published to the Zed extension registry.

Note: The ability to download extensions is coming soon.
