// サムネイル生成と管理のためのTauriコマンド

mod batch;
mod config;
mod error;
mod folder;
mod generator;
mod utils;

pub use batch::{BatchResult, BatchTask, BatchThumbnailGenerator, TaskPriority};
pub use config::ThumbnailConfig;
pub use error::{Result, ThumbnailError};
pub use folder::FolderThumbnailResult;
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
/// * `visible_count` - 可視領域の画像数（優先度High）
/// * `app_handle` - Tauriアプリケーションハンドル（自動注入）
///
/// # Returns
/// 各画像パスに対応するサムネイルキャッシュパスまたはエラーメッセージのマップ
#[command]
pub async fn batch_create_thumbnails(
    image_paths: Vec<String>,
    visible_count: Option<usize>,
    app_handle: tauri::AppHandle,
) -> std::result::Result<std::collections::HashMap<String, serde_json::Value>, String> {
    // tokio::spawn_blockingで非同期に実行（UIをブロックしない）
    tokio::task::spawn_blocking(move || {
        // BatchThumbnailGeneratorの初期化
        let batch_generator =
            BatchThumbnailGenerator::with_default_config(app_handle).map_err(|e| e.to_string())?;

        // タスクリストの作成（優先度付き）
        let visible_count = visible_count.unwrap_or(10);
        let tasks: Vec<BatchTask> = image_paths
            .into_iter()
            .enumerate()
            .map(|(index, image_path)| {
                let priority = if index < visible_count {
                    TaskPriority::High // 可視領域
                } else if index < visible_count * 3 {
                    TaskPriority::Normal // 近傍
                } else {
                    TaskPriority::Low // バックグラウンド
                };
                BatchTask::new(image_path, priority)
            })
            .collect();

        // バッチ生成の実行
        let results = batch_generator.batch_create_thumbnails(tasks);

        // 結果をマップに変換
        let result_map: std::collections::HashMap<String, serde_json::Value> = results
            .into_iter()
            .map(|result| {
                let value = if let Some(thumbnail_path) = result.thumbnail_path {
                    serde_json::json!({
                        "success": true,
                        "path": thumbnail_path.to_string_lossy().to_string()
                    })
                } else if let Some(error) = result.error {
                    serde_json::json!({
                        "success": false,
                        "error": error
                    })
                } else {
                    serde_json::json!({
                        "success": false,
                        "error": "Unknown error"
                    })
                };
                (result.image_path, value)
            })
            .collect();

        Ok(result_map)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

/// サムネイルキャッシュをクリアする（デバッグ用）
#[command]
pub async fn clear_thumbnail_cache() -> std::result::Result<(), String> {
    // TODO: Phase 6でキャッシュ管理を実装
    Err("Not implemented yet".to_string())
}
