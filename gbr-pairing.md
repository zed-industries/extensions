# Pair a phone with Build Remote Agent (Zed)

This catalog can document **Build Remote Agent** as a pairing device for Zed's Agent Panel. The paid iOS/Android app spectates (and can inject into) a desktop session through the free MIT `gbr-agent`. Phone and PC never open ports to each other.

This pull request **does not** register an extension in `extensions.toml`. A GBR MCP server should live in its own licensed repo and be tested as a Zed [dev extension](https://zed.dev/docs/extensions/developing-extensions) before a catalog submission. Until then, attach GBR as a **custom context server**.

Website: https://grokbuildremote.com/
Agent: https://github.com/LinespottingOrg/GrokBuildRemote-Agents (MIT)
Protocol: `gbr/1` · need agent **v0.6.0+**

Independent product by Linespotting AB. Not affiliated with xAI or SpaceX.

## Install + pair

```bash
# macOS / Linux
curl -fsSL https://grokbuildremote.com/install.sh | bash
gbr-agent version          # must print v0.6.0 or newer
gbr-agent pair             # QR in browser + printed 8-char code
gbr-agent run              # leave running
```

```powershell
# Windows
irm https://grokbuildremote.com/install.ps1 | iex
gbr-agent version
gbr-agent pair
gbr-agent run
```

Phone: open Build Remote Agent → **Scan QR from computer** (or type the 8-char code). Sessions appear in the app. **Unpair** in Settings before changing PCs. Force-close is not enough.

## Attach in Zed (custom MCP)

After `gbr-agent run`, add a local MCP server in **Settings → AI → MCP Servers → Add Local Server**, or in `settings.json`:

```json
{
  "context_servers": {
    "gbr": {
      "command": "node",
      "args": [
        "/ABS/PATH/GrokBuildRemote-Agents/mcp/gbr-mcp/bin/gbr-mcp.js"
      ],
      "env": {}
    }
  }
}
```

Clone and diagnose the stdio server:

```bash
git clone https://github.com/LinespottingOrg/GrokBuildRemote-Agents.git
cd GrokBuildRemote-Agents/mcp/gbr-mcp && npm install
node bin/gbr-mcp.js --diagnose
```

Bot API (same loop, spectator attach):

```bash
curl -sS http://127.0.0.1:8788/health
curl -sS http://127.0.0.1:8788/v1/sessions
```

Attach surfaces are **only** `http://127.0.0.1:8788` and `gbr-mcp` stdio. Phone is spectator + veto, not orchestrator.

Do not commit mailbox keys. Phone **Settings → Bot API** is the only place the relay key is copied.

## Later: MCP extension

To publish as a Zed extension, follow [MCP Server Extensions](https://zed.dev/docs/extensions/mcp-extensions): `extension.toml` `[context_servers.gbr]` plus `context_server_command` that returns the `node …/gbr-mcp.js` command. The extension repository must include an [accepted license](https://zed.dev/docs/extensions/publishing/license-requirements). Do not put mailbox keys in `extension.toml`.
