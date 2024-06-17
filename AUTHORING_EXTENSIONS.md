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

Extensions may also provide language servers for use with languages.

### Themes

Extensions may provide themes to change the look of Zed.

## Extension structure

A Zed extension is a Git repository that contains an `extension.toml`:

```toml
id = "my-extension"
name = "My extension"
version = "0.0.1"
schema_version = 1
authors = ["Your Name <you@example.com>"]
description = "My cool extension"
repository = "https://github.com/your-name/my-zed-extension"
```

Extensions may contain any combination of grammars, languages, and themes. For example, you can have an extension that provides both a grammar and a language, or one that just provides a theme.

### Grammars

If your extension contains grammars, you can denote the provided grammars in your `extension.toml` like so:

```toml
[grammars.gleam]
repository = "https://github.com/gleam-lang/tree-sitter-gleam"
commit = "58b7cac8fc14c92b0677c542610d8738c373fa81"
```

The `repository` field must specify a repository where the Tree-sitter grammar should be loaded from, and the `commit` field must contain the SHA of the Git commit to use.

### Languages

The `languages` directory in an extension should contain one or more directories containing languages.

### Language servers

To provide language server support your extension can integrate against the [Zed extension API](https://crates.io/crates/zed_extension_api).

Create a Rust library at the root of your extension repository.

Your `Cargo.toml` should look like this:

```toml
[package]
name = "my-extension"
version = "0.0.1"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
zed_extension_api = "0.0.4"
```

Make sure to use the latest version of the `zed_extension_api` available on crates.io.

In the `src/lib.rs` file in your Rust crate you will need to define a struct for your extension and implement the `Extension` trait, as well as use the `register_extension!` macro to register your extension:

```rs
use zed_extension_api as zed;

struct MyExtension {
    // ... state
}

impl zed::Extension for MyExtension {
    // ...
}

zed::register_extension!(MyExtension);
```

Finally, add an entry to your `extension.toml` with the name of your language server and the language it applies to:

```toml
[language_servers.some-language]
name = "My Extension LSP"
language = "Some Language"
```

For more examples on providing language servers via extensions, take a look at the [extensions](https://github.com/zed-industries/zed/tree/main/extensions) available in the Zed repository.

### Themes

The `themes` directory in an extension should contain one or more theme files.

Each theme file should adhere to the JSON schema specified at [`https://zed.dev/schema/themes/v0.1.0.json`](https://zed.dev/schema/themes/v0.1.0.json).

See [this blog post](https://zed.dev/blog/user-themes-now-in-preview) for more details about creating themes.

## Testing your extension locally

To test your extension locally, you can open up the extensions view with the `zed: extensions` command and then click on the `Install Dev Extension` button.

This will open a file dialog where you can locate and select the directory in which your extension resides.

Zed will then build your extension and load it.

## Publishing your extension

To publish an extension, open a PR to [this repo](https://github.com/zed-industries/extensions).

In your PR do the following:

1. Add your extension as a Git submodule within the `extensions/` directory
2. Add a new entry to `extensions.toml` containing your extension:
   ```toml
   [my-extension]
   submodule = "extensions/my-extension"
   version = "0.0.1"
   ```
3. Run `pnpm sort-extensions` to ensure `extensions.toml` and `.gitmodules` are sorted

Once your PR is merged, the extension will be packaged and published to the Zed extension registry.

## Updating an extension

To update an extension, open a PR to [this repo](https://github.com/zed-industries/extensions).

In your PR do the following:

1. Update the extension's submodule to that commit of the new version.
2. Update the `version` field for the extension in `extensions.toml`

- Make sure the `version` matches the one set in `extension.json` at the particular commit.

If you'd like to automate this process, there is a [community GitHub Action](https://github.com/huacnlee/zed-extension-action) you can use.
