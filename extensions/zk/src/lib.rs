use std::fs;

use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

struct ZkExtension {
    cached_binary_path: Option<String>,
}

impl ZkExtension {
    fn language_server_binary_path(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<String> {
        if let Some(path) = &self.cached_binary_path {
            if fs::metadata(path).map_or(false, |stat| stat.is_file()) {
                return Ok(path.clone());
            }
        }

        // First check if already installed to path
        if let Some(path) = worktree.which("zk") {
            self.cached_binary_path = Some(path.clone());
            return Ok(path);
        }

        zed::set_language_server_installation_status(
            language_server_id,
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );

        let release = zed::latest_github_release(
            "zk-org/zk",
            zed::GithubReleaseOptions {
                require_assets: true,
                pre_release: false,
            },
        )?;

        let (platform, arch) = zed::current_platform();
        let asset_name = format!(
            "zk-{version}-{os}-{arch}",
            version = release.version,
            os = match platform {
                zed::Os::Mac => "macos",
                zed::Os::Linux => "linux",
                zed::Os::Windows => "windows",
            },
            arch = match (platform, arch) {
                (zed::Os::Mac, zed::Architecture::Aarch64) => "arm64",
                (zed::Os::Mac, zed::Architecture::X8664) => "x86_64",
                (_, zed::Architecture::Aarch64) => "arm64",
                (_, zed::Architecture::X8664) => "amd64",
                (_, zed::Architecture::X86) => "i386",
            },
        );

        // zk uses .tar.gz for all platforms including Windows
        let asset_extension = ".tar.gz";

        let binary_extension = match platform {
            zed::Os::Windows => ".exe",
            _ => "",
        };

        let asset_full_name = format!("{}{}", asset_name, asset_extension);
        let asset = release
            .assets
            .iter()
            .find(|asset| asset.name == asset_full_name)
            .ok_or_else(|| format!("no asset found matching {:?}", asset_full_name))?;

        let version_dir = format!("zk-{}", release.version);
        let binary_path = format!("{version_dir}/zk{binary_extension}");

        if !fs::metadata(&binary_path).map_or(false, |stat| stat.is_file()) {
            zed::set_language_server_installation_status(
                language_server_id,
                &zed::LanguageServerInstallationStatus::Downloading,
            );

            zed::download_file(
                &asset.download_url,
                &version_dir,
                zed::DownloadedFileType::GzipTar,
            )
            .map_err(|e| format!("failed to download file: {e}"))?;

            // Make binary executable on Unix platforms
            zed::make_file_executable(&binary_path)?;

            // Clean up old versions
            let entries =
                fs::read_dir(".").map_err(|e| format!("failed to list working directory {e}"))?;

            for entry in entries {
                let entry = entry.map_err(|e| format!("failed to load directory entry {e}"))?;
                if entry.file_name().to_str() != Some(&version_dir) {
                    fs::remove_dir_all(entry.path()).ok();
                }
            }
        }

        self.cached_binary_path = Some(binary_path.clone());
        Ok(binary_path)
    }
}

impl zed::Extension for ZkExtension {
    fn new() -> Self {
        ZkExtension {
            cached_binary_path: None,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Command> {
        let binary_path = self.language_server_binary_path(language_server_id, worktree)?;

        Ok(Command {
            command: binary_path,
            args: vec!["lsp".to_string()],
            env: Default::default(),
        })
    }
}

zed::register_extension!(ZkExtension);
