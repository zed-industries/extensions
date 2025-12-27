# Bio Pype LSP Extension for Zed

Language Server Protocol support for Bio Pype in Markdown and YAML files.

## Installation

Install bio-pype:
```bash
pip install --user bio-pype
```

Install this extension in Zed, then open a Markdown or YAML file.

## Configuration

### Automatic (Recommended)

If `pype` is in your PATH, the extension works automatically with no configuration needed.

### Custom Path

For custom installations (e.g., virtual environments), add to your settings:

```json
{
  "lsp": {
    "bio-pype": {
      "binary": {
        "path": "/path/to/venv/bin/pype",
        "arguments": ["validate", "lsp", "--stdio"]
      }
    }
  }
}
```

**Note:** When configuring a custom path, you must include both `path` and `arguments`.

## Troubleshooting

**LSP not starting?**

Check that pype is installed and accessible:
```bash
pype --version
pype validate lsp --stdio  # Should wait for input (Ctrl+C to exit)
```

## Links

- [Bio Pype](https://bitbucket.org/ffavero/bio_pype)
- [Extension Source](https://github.com/compute-bio/zed-pype-lsp)

## License

MIT License - see [LICENSE](LICENSE)
