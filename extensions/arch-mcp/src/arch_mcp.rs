use schemars::JsonSchema;
use serde::Deserialize;
use std::path::PathBuf;
use zed_extension_api::settings::ContextServerSettings;
use zed_extension_api::{
    self as zed, serde_json, Command, ContextServerConfiguration, ContextServerId, Project, Result,
};

/// Settings for the Arch Linux MCP Server extension
/// Allows customization of the server path and local development setup
#[derive(Debug, Deserialize, JsonSchema)]
struct ArchMcpSettings {
    /// Path to the arch-ops-server binary or script
    /// If not set, will try to use `uvx arch-ops-server` or local path
    server_path: Option<String>,
    
    /// Use local development path (for development)
    /// When true, will use the local_path setting to run the server
    use_local_path: Option<bool>,
    
    /// Local path to arch-mcp repository (if use_local_path is true)
    /// Should point to the directory containing arch_ops_server.py
    local_path: Option<String>,
}

struct ArchMcpExtension;

impl ArchMcpExtension {
    /// Get the command to run the arch-mcp server
    /// Priority order:
    /// 1. Local development path (if use_local_path is true)
    /// 2. Custom server_path (if provided)
    /// 3. Default: uvx arch-ops-server
    fn get_server_command(&self, project: &Project) -> Result<Command> {
        // Debug: Load settings for the arch-ops-server context server
        let settings = ContextServerSettings::for_project("arch-ops-server", project)?;
        let settings: ArchMcpSettings = if let Some(settings) = settings.settings {
            serde_json::from_value(settings).map_err(|e| format!("failed to parse settings: {e}"))?
        } else {
            // Debug: No settings found, using defaults
            ArchMcpSettings {
                server_path: None,
                use_local_path: None,
                local_path: None,
            }
        };

        // Debug: Check if we should use local development path
        if settings.use_local_path.unwrap_or(false) {
            if let Some(local_path) = settings.local_path {
                // Debug: Attempting to use local development path
                let local_server_path = PathBuf::from(&local_path)
                    .join("arch_ops_server.py")
                    .canonicalize()
                    .map_err(|e| format!("failed to resolve local path: {e}"))?;

                if local_server_path.exists() {
                    // Debug: Local server path found, using python3 to run it
                    // Run python3 with the script path, using /usr/bin/env to search PATH
                    return Ok(Command {
                        command: "/usr/bin/env".into(),
                        args: vec![
                            "python3".into(),
                            local_server_path.to_string_lossy().into_owned(),
                        ],
                        env: vec![],
                    });
                }
            }
        }

        // Debug: Check if custom server path is provided
        if let Some(server_path) = settings.server_path {
            let server_pathbuf = PathBuf::from(&server_path);
            if server_pathbuf.exists() {
                // Debug: Custom server path exists, using it directly
                return Ok(Command {
                    command: server_pathbuf.to_string_lossy().into_owned(),
                    args: vec![],
                    env: vec![],
                });
            }

            // Debug: Custom server path doesn't exist as file, trying as command on PATH
            // Allow running commands available on PATH (e.g. "uvx")
            return Ok(Command {
                command: "/usr/bin/env".into(),
                args: vec![server_path],
                env: vec![],
            });
        }

        // Debug: No custom settings, using default uvx arch-ops-server
        // Try to use uvx arch-ops-server (recommended)
        // This is the standard way to run the arch-mcp server; /usr/bin/env locates uvx on PATH
        Ok(Command {
            command: "/usr/bin/env".into(),
            args: vec!["uvx".into(), "arch-ops-server".into()],
            env: vec![],
        })
    }
}

impl zed::Extension for ArchMcpExtension {
    fn new() -> Self {
        // Debug: Initializing Arch MCP Extension
        Self
    }

    fn context_server_command(
        &mut self,
        _context_server_id: &ContextServerId,
        project: &Project,
    ) -> Result<Command> {
        // Debug: Getting server command for context server
        self.get_server_command(project)
    }

    fn context_server_configuration(
        &mut self,
        _context_server_id: &ContextServerId,
        _project: &Project,
    ) -> Result<Option<ContextServerConfiguration>> {
        // Debug: Providing context server configuration (installation instructions, settings schema)
        let installation_instructions =
            include_str!("../configuration/installation_instructions.md").to_string();
        let default_settings =
            include_str!("../configuration/default_settings.jsonc").to_string();
        let settings_schema = serde_json::to_string(&schemars::schema_for!(ArchMcpSettings))
            .map_err(|e| e.to_string())?;

        Ok(Some(ContextServerConfiguration {
            installation_instructions,
            default_settings,
            settings_schema,
        }))
    }
}

// Debug: Registering Arch MCP Extension with Zed
zed::register_extension!(ArchMcpExtension);
