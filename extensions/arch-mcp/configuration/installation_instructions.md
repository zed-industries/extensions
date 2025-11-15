# Arch Linux MCP Server Installation

The Arch Linux MCP Server provides access to Arch Wiki, AUR, and official repositories through the Model Context Protocol.

## Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

## Installation

### Option 1: Local STDIO (Recommended)

The extension will automatically use `uvx arch-ops-server` which downloads and runs the server on-demand:

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh
```

That's it! The extension will handle the rest automatically.

### Option 2: Smithery HTTP Server

Use the hosted MCP server on Smithery (requires internet connection):

```jsonc
{
  "context_servers": {
    "arch-ops-server": {
      "server_path": "npx",
      "args": ["-y", "@smithery/cli", "run", "@nihalxkumar/arch-mcp"]
    }
  }
}
```

Or configure directly: `https://smithery.ai/server/@nihalxkumar/arch-mcp/`

### Alternative: Manual Installation

If you prefer to install the package globally:

```bash
# Using uv (recommended)
uv tool install arch-ops-server

# Or using pip
pip install arch-ops-server
```

Then optionally set the `server_path` in settings to point to the installed binary.

### For Development

If you're developing the arch-mcp server locally, you can configure the extension to use your local repository:

```jsonc
{
  "context_servers": {
    "arch-ops-server": {
      "use_local_path": true,
      "local_path": "/path/to/your/arch-mcp/repository"
    }
  }
}
```

## Features

### Resources (URI-based Access)

Access Arch ecosystem data directly via custom URI schemes:

- **Arch Wiki**: `archwiki://Installation_guide`
- **Official Repos**: `archrepo://vim`
- **AUR**: `aur://yay/info`, `aur://yay/pkgbuild`
- **System Packages**: `pacman://installed`, `pacman://orphans`
- **System Info**: `system://info`, `system://disk`
- **News**: `archnews://latest`

### Tools (Executable Functions)

Over 30 tools for package management, system diagnostics, and security analysis:

- **Search**: `search_archwiki`, `search_aur`, `get_official_package_info`
- **Package Management**: `install_package_secure`, `remove_package`, `check_updates_dry_run`
- **Maintenance**: `list_orphan_packages`, `remove_orphans`, `verify_package_integrity`
- **Security**: `analyze_pkgbuild_safety`, `analyze_package_metadata_risk`

### Prompts (Guided Workflows)

- `troubleshoot_issue` - Diagnose system errors
- `audit_aur_package` - Pre-installation safety audit
- `analyze_dependencies` - Installation planning
- `safe_system_update` - Safe update workflow

## Documentation

For complete documentation and examples, visit:
- **Official Docs**: [https://nxk.mintlify.app/arch-mcp](https://nxk.mintlify.app/arch-mcp)
- **GitHub**: [https://github.com/nihalxkumar/arch-mcp](https://github.com/nihalxkumar/arch-mcp)
- **PyPI**: [https://pypi.org/project/arch-ops-server/](https://pypi.org/project/arch-ops-server/)

## Troubleshooting

### Server Not Starting

1. Ensure `uv` is installed and in your PATH:
   ```bash
   which uvx
   ```

2. Test the server manually:
   ```bash
   uvx arch-ops-server
   ```

3. Check Zed logs for error messages

### Custom Installation

If you need to use a custom installation, set the `server_path` in your Zed settings:

```jsonc
{
  "context_servers": {
    "arch-ops-server": {
      "server_path": "/path/to/arch-ops-server"
    }
  }
}
```

## License

This extension is dual-licensed under:
- **GPL-3.0-only** - For strong copyleft protections
- **MIT License** - For broader compatibility

You may use this software under the terms of either license.
