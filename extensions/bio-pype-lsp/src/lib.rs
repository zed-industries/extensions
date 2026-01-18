use zed_extension_api as zed;

pub struct BioPypeExtension;

impl zed::Extension for BioPypeExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        let pype_path = worktree
            .which("pype")
            .ok_or_else(|| "pype not found in PATH. Install with: pip install --user bio-pype".to_string())?;

        Ok(zed::Command {
            command: pype_path,
            args: vec![
                "validate".to_string(),
                "lsp".to_string(),
                "--stdio".to_string(),
            ],
            env: Default::default(),
        })
    }
}

zed::register_extension!(BioPypeExtension);
