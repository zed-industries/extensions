# Arch Linux MCP Server Extension for Zed

This extension integrates the [Arch Linux MCP Server](https://github.com/nihalxkumar/arch-mcp) into Zed, providing AI-assisted access to the Arch Linux ecosystem.

## Features

### Resources (URI-based Access)

- **Arch Wiki**: `archwiki://Installation_guide` - Access Wiki pages in Markdown format
- **Official Repos**: `archrepo://vim` - Get official package details
- **AUR Info**: `aur://yay/info` - AUR package metadata (votes, maintainer, dates)
- **AUR PKGBUILD**: `aur://yay/pkgbuild` - Raw PKGBUILD with safety analysis
- **System Packages** (Arch only):
  - `pacman://installed` - List installed packages
  - `pacman://orphans` - Find orphaned packages
  - `pacman://explicit` - Explicitly installed packages
  - `pacman://groups` - All package groups
  - `pacman://group/base-devel` - Packages in specific group
- **System Info**:
  - `system://info` - System information (kernel, memory, uptime)
  - `system://disk` - Disk space usage
  - `system://services/failed` - Failed systemd services
  - `system://logs/boot` - Recent boot logs
- **News**: `archnews://latest` - Latest Arch Linux news

### Tools (Executable Functions)

#### Package Search & Information
- `search_archwiki` - Query Arch Wiki with ranked results
- `search_aur` - Search AUR (by relevance/votes/popularity/modified)
- `get_official_package_info` - Get official package details

#### Package Lifecycle Management (Arch only)
- `check_updates_dry_run` - Check for available updates
- `install_package_secure` - Install with security checks (blocks malicious packages)
- `remove_package` - Remove single package
- `remove_packages_batch` - Remove multiple packages efficiently

#### Package Analysis & Maintenance (Arch only)
- `list_orphan_packages` - Find orphaned packages
- `remove_orphans` - Clean orphans with dry-run option
- `verify_package_integrity` - Check file integrity
- `list_explicit_packages` - List user-installed packages

#### Security Analysis
- `analyze_pkgbuild_safety` - Comprehensive PKGBUILD analysis (50+ red flags)
- `analyze_package_metadata_risk` - Package trust scoring

### Prompts (Guided Workflows)

- `troubleshoot_issue` - Diagnose system errors
- `audit_aur_package` - Pre-installation safety audit
- `analyze_dependencies` - Installation planning
- `safe_system_update` - Safe update workflow

## Installation

### Option 1: Local STDIO (Recommended)

The extension will automatically use `uvx arch-ops-server` for local STDIO operations.

**Prerequisites:**
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

**Quick Install:**

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh
```

The extension will automatically run `uvx arch-ops-server` when needed.

### Option 2: Smithery HTTP Server

Alternatively, you can use the hosted MCP server on Smithery (requires internet connection):

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

Or configure it directly in Zed to use: `https://smithery.ai/server/@nihalxkumar/arch-mcp/`

## Configuration

You can customize the server path in your Zed settings:

```jsonc
{
  "context_servers": {
    "arch-ops-server": {
      // Optional: Custom path to the arch-ops-server binary/script
      // "server_path": "/path/to/arch-ops-server",
      
      // Optional: Use local development path (for development)
      // "use_local_path": false,
      
      // Optional: Local path to arch-mcp repository (if use_local_path is true)
      // "local_path": "/home/user/dev/arch-mcp"
    }
  }
}
```

## Documentation

For complete documentation, visit: [https://nxk.mintlify.app/arch-mcp](https://nxk.mintlify.app/arch-mcp)

## License

This extension is dual-licensed under:
- **GPL-3.0-only** - For strong copyleft protections
- **MIT License** - For broader compatibility

You may use this software under the terms of either license.
