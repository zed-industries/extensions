use schemars::JsonSchema;
use serde::Deserialize;
use std::env;
use zed_extension_api::{
    self as zed, serde_json, Command, ContextServerConfiguration, ContextServerId, Project, Result,
};

const PACKAGE_NAME: &str = "@augmentcode/auggie";
const PACKAGE_VERSION: &str = "latest";
const SERVER_PATH: &str = "node_modules/@augmentcode/auggie/augment.mjs";

#[derive(Debug, Deserialize, JsonSchema)]
struct AugmentContextEngineSettings {
    // Placeholder for future settings
}

struct AugmentContextEngineExtension;

impl zed::Extension for AugmentContextEngineExtension {
    fn new() -> Self {
        Self
    }

    fn context_server_command(
        &mut self,
        _context_server_id: &ContextServerId,
        _project: &Project,
    ) -> Result<Command> {
        let version = zed::npm_package_installed_version(PACKAGE_NAME)?;
        if version.as_deref() != Some(PACKAGE_VERSION) {
            zed::npm_install_package(PACKAGE_NAME, PACKAGE_VERSION)?;
        }

        let mut args = Vec::new();
        args.push(
            env::current_dir()
                .unwrap()
                .join(SERVER_PATH)
                .to_string_lossy()
                .to_string(),
        );
        args.push("--mcp".to_string());
        args.push("--mcp-auto-workspace".to_string());

        Ok(Command {
            command: zed::node_binary_path()?,
            args,
            env: Default::default(),
        })
    }

    fn context_server_configuration(
        &mut self,
        _context_server_id: &ContextServerId,
        _project: &Project,
    ) -> Result<Option<ContextServerConfiguration>> {
        let installation_instructions =
            include_str!("../configuration/installation_instructions.md").to_string();
        let default_settings = include_str!("../configuration/default_settings.jsonc").to_string();
        let settings_schema = serde_json::to_string(&schemars::schema_for!(
            AugmentContextEngineSettings
        ))
        .map_err(|e| e.to_string())?;

        Ok(Some(ContextServerConfiguration {
            installation_instructions,
            default_settings,
            settings_schema,
        }))
    }
}

zed::register_extension!(AugmentContextEngineExtension);

