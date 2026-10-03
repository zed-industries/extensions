use zed_extension_api::{self as zed, Result};

struct TextlintExtension;

impl zed::Extension for TextlintExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        Ok(zed::Command {
            command: "npx".to_string(),
            args: vec!["textlint-lsp".to_string(), "--stdio".to_string()],
            env: Default::default(),
        })
    }
}

zed::register_extension!(TextlintExtension);
