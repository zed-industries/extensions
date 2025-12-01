use std::{env, path::PathBuf};
use zed::settings::LspSettings;
use zed_extension_api::{self as zed, LanguageServerId, Result};

const SERVER_RELATIVE_PATH: &str = "server/bin/wc-language-server.js";
const CUSTOM_SERVER_ENV: &str = "WC_LANGUAGE_SERVER_BINARY";

struct WebComponentsExtension;

impl WebComponentsExtension {
    fn resolve_server_script(&self) -> Result<PathBuf> {
        println!("[wc-tools] Resolving server script...");
        if let Ok(custom) = env::var(CUSTOM_SERVER_ENV) {
            return Ok(PathBuf::from(custom));
        }

        let extension_root = env::current_dir()
            .map_err(|err| format!("failed to resolve extension root: {err}"))?;
        let script = extension_root.join(SERVER_RELATIVE_PATH);

        if script.exists() {
            Ok(script)
        } else {
            Err(format!(
                "missing bundled language server at {}. Run `pnpm dev` (or `pnpm --filter @wc-toolkit/zed run build`) to generate it.",
                script.display()
            )
            .into())
        }
    }
}

impl zed::Extension for WebComponentsExtension {
    fn new() -> Self {
        println!("[wc-tools] Initializing WebComponentsExtension...");
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        println!("[wc-tools] Resolving language server command...");
        let server_path = self.resolve_server_script()?;
        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![server_path.to_string_lossy().to_string(), "--stdio".to_string()],
            env: Default::default(),
        })
    }

    fn language_server_initialization_options(
        &mut self,
        server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        println!("[wc-tools] Resolving language server initialization options...");
        let initialization_options = LspSettings::for_worktree(server_id.as_ref(), worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.initialization_options.clone());
        Ok(initialization_options)
    }

    fn language_server_workspace_configuration(
        &mut self,
        server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        println!("[wc-tools] Resolving language server workspace configuration...");
        let settings = LspSettings::for_worktree(server_id.as_ref(), worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.settings.clone())
            .unwrap_or_default();
        Ok(Some(settings))
    }
}

zed::register_extension!(WebComponentsExtension);