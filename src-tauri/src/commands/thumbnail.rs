// サムネイル生成と管理のためのTauriコマンド

mod config;
mod error;
mod generator;
mod utils;

pub use config::ThumbnailConfig;
pub use error::{Result, ThumbnailError};
pub use generator::ThumbnailGenerator;
pub use utils::{get_cache_dir, hash_path};

use tauri::command;

/// 画像のサムネイルを取得または生成する
///
/// # Arguments
/// * `image_path` - ソース画像のフルパス
/// * `app_handle` - Tauriアプリケーションハンドル（自動注入）
///
/// # Returns
/// サムネイルのキャッシュパス（成功時）
#[command]
pub async fn get_or_create_thumbnail(
    image_path: String,
    app_handle: tauri::AppHandle,
) -> std::result::Result<String, String> {
    let generator =
        ThumbnailGenerator::with_default_config(app_handle).map_err(|e| e.to_string())?;

    let cache_path = generator
        .get_or_create_thumbnail(&image_path)
        .map_err(|e| e.to_string())?;

    let path_str = cache_path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path to string".to_string())?;

    Ok(path_str)
}

/// 複数の画像のサムネイルをバッチ生成する
///
/// # Arguments
/// * `image_paths` - ソース画像のパスの配列
///
/// # Returns
/// 各画像パスに対応するサムネイルキャッシュパスのマップ
#[command]
pub async fn batch_create_thumbnails(
    image_paths: Vec<String>,
) -> std::result::Result<std::collections::HashMap<String, String>, String> {
    // TODO: Phase 4（US2）でrayon並列処理を実装
    let _ = image_paths; // 未使用変数警告を回避
    Err("Not implemented yet".to_string())
}

/// サムネイルキャッシュをクリアする（デバッグ用）
#[command]
pub async fn clear_thumbnail_cache() -> std::result::Result<(), String> {
    // TODO: Phase 6でキャッシュ管理を実装
    Err("Not implemented yet".to_string())
}
