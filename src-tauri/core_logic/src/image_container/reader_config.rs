use std::path::{Path, PathBuf};

#[derive(Clone)]
pub struct ImageContainerReaderConfig {
    ///
    /// 解凍先のディレクトリパス。圧縮ファイルを扱う際に必要。
    ///
    extract_dir: PathBuf,

    ///
    /// サポートされている圧縮ファイルの拡張子。
    ///
    supported_archive_extensions: Vec<String>,
}

impl ImageContainerReaderConfig {
    pub fn new<P: AsRef<std::path::Path>>(extract_dir: P) -> Self {
        ImageContainerReaderConfig {
            extract_dir: extract_dir.as_ref().to_path_buf(),
            supported_archive_extensions: vec!["zip".to_string()],
        }
    }

    pub fn get_extract_dir(&self) -> &std::path::Path {
        &self.extract_dir
    }

    pub fn is_supported_extension<P: AsRef<Path>>(&self, path: P) -> bool {
        let extension = path
            .as_ref()
            .extension()
            .and_then(|ext| ext.to_str())
            // 拡張子がない場合は空文字列にfallbackする
            .unwrap_or("");

        // 大文字小文字を区別せずに、サポートされている拡張子のいずれかと一致するかを確認する
        self.supported_archive_extensions
            .iter()
            .any(|ext| ext.eq_ignore_ascii_case(extension))
    }
}
