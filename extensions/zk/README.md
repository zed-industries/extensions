# zk - Zettelkasten Extension for Zed

This extension provides language server support for [zk](https://github.com/zk-org/zk), a plain text note-taking assistant for Zettelkasten and personal wikis.

## Features

The zk language server provides the following features for Markdown files in zk notebooks:

- **Auto-completion** for wikilinks (`[[`), hashtags, and colon-separated tags
- **Hover** previews showing note content when hovering over links
- **Go to definition** to navigate between notes via internal links
- **Diagnostics** for dead links, wiki-link titles, and missing backlinks
- **Code actions** to create notes from selection or add missing backlinks

## Requirements

This extension will automatically download and install the `zk` binary. Alternatively, you can install `zk` manually:

- **macOS**: `brew install zk`
- **Arch Linux**: `pacman -S zk`
- **Alpine Linux**: `apk add zk`
- **Build from source**: See [zk installation instructions](https://github.com/zk-org/zk#install)

## Configuration

The zk language server requires a zk notebook (a directory containing a `.zk` configuration directory). Initialize one with:

```bash
zk init
```

For LSP configuration options, see the [zk LSP documentation](https://zk-org.github.io/zk/config/config-lsp.html).

## Usage

Once installed, the extension will activate when you open Markdown files in a zk notebook. The language server provides:

- Link completion when typing `[[` for wikilinks
- Tag completion when typing `#` for hashtags
- Hover information when pointing at links
- Navigation via Cmd/Ctrl+Click on links
- Diagnostics for broken links

## More Information

- [zk Documentation](https://zk-org.github.io/zk/)
- [Editor Integration Guide](https://zk-org.github.io/zk/tips/editors-integration.html)
- [zk GitHub Repository](https://github.com/zk-org/zk)
