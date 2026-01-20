// サムネイル生成のエラー型定義

use thiserror::Error;

/// サムネイル生成と管理に関するエラー
#[derive(Error, Debug)]
pub enum ThumbnailError {
    /// 画像ファイルが見つからない
    #[error("Image file not found: {0}")]
    ImageNotFound(String),

    /// 画像のデコードに失敗
    #[error("Failed to decode image: {0}")]
    DecodeError(String),

    /// サムネイル生成に失敗
    #[error("Failed to generate thumbnail: {0}")]
    GenerationError(String),

    /// キャッシュディレクトリへのアクセスに失敗
    #[error("Cache directory access failed: {0}")]
    CacheAccessError(String),

    /// I/Oエラー
    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    /// 画像処理エラー
    #[error("Image processing error: {0}")]
    ImageError(#[from] image::ImageError),

    /// 設定バリデーションエラー
    #[error("Configuration validation error: {0}")]
    ConfigError(String),
}

impl From<String> for ThumbnailError {
    fn from(s: String) -> Self {
        ThumbnailError::ConfigError(s)
    }
}

/// Resultのエイリアスでth<bbnailErrorをデフォルトのエラー型として使用
pub type Result<T> = std::result::Result<T, ThumbnailError>;
