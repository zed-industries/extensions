use zed_extension_api as zed;

struct ZedVerticalViewerExtension;

impl zed::Extension for ZedVerticalViewerExtension {
    fn new() -> Self {
        Self
    }

    // ZedがMarkdownファイルを開いたときに自動的に呼び出すコマンド
    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        // ユーザーの環境変数（PATH）から "zed-vertical-viewer" の実行ファイルを探索する
        let path = worktree
            .which("zed-vertical-viewer")
            .ok_or_else(|| "Could not find zed-vertical-viewer binary in PATH".to_string())?;

        // 起動コマンドをZed本体に返して、代わりに起動してもらう
        Ok(zed::Command {
            command: path,
            args: vec![],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(ZedVerticalViewerExtension);
