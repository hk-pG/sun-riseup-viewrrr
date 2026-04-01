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
#[allow(dead_code)]
#[command]
pub async fn get_or_create_thumbnail(
    image_path: String,
    app_handle: tauri::AppHandle,
) -> std::result::Result<String, String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    let generator =
        ThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;

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
#[allow(dead_code)]
#[command]
pub async fn batch_create_thumbnails(
    image_paths: Vec<String>,
    visible_count: Option<usize>,
    app_handle: tauri::AppHandle,
) -> std::result::Result<std::collections::HashMap<String, serde_json::Value>, String> {
    // tokio::spawn_blockingで非同期に実行（UIをブロックしない）
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    tokio::task::spawn_blocking(move || {
        // BatchThumbnailGeneratorの初期化
        let batch_generator =
            BatchThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;

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

/// フォルダのサムネイルを取得する（フォルダパスのみで完結）
///
/// フォルダ内の最初の画像を自動選択し、サムネイルを生成して返す。
/// 画像がないフォルダの場合は None (null) を返す。
///
/// # Arguments
/// * `folder_path` - 対象フォルダのフルパス
/// * `app_handle` - Tauriアプリケーションハンドル（自動注入）
///
/// # Returns
/// FolderThumbnailResult（画像パス、サムネイルパス、ファイル名）、画像なしの場合 null
#[command]
pub async fn get_folder_thumbnail(
    folder_path: String,
    app_handle: tauri::AppHandle,
) -> std::result::Result<Option<folder::FolderThumbnailResult>, String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    let result = tokio::task::spawn_blocking(move || {
        // 1. フォルダ内の最初の画像を取得
        let first_image = folder::get_first_image_in_folder(&folder_path)?;

        let image_path = match first_image {
            Some(path) => path,
            None => return Ok::<Option<folder::FolderThumbnailResult>, String>(None),
        };

        // 2. サムネイルを生成
        let generator =
            ThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;
        let cache_path = generator
            .get_or_create_thumbnail(&image_path)
            .map_err(|e| e.to_string())?;

        // 3. basenameを取得
        // get_first_image_in_folder が画像ファイルパスのみ返すため
        // file_name() が None になるケースは実質到達しない（防御的フォールバック）
        let image_name = std::path::Path::new(&image_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let thumbnail_path = cache_path
            .to_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "Failed to convert thumbnail path to string".to_string())?;

        Ok(Some(folder::FolderThumbnailResult {
            image_path,
            thumbnail_path,
            image_name,
        }))
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;

    Ok(result)
}

/// 複数フォルダのサムネイルをバックグラウンドでプリフェッチする
///
/// フォルダパスの配列を受け取り、各フォルダの最初の画像のサムネイルを
/// バッチ生成する。優先度はインデックス順で自動決定される。
/// Fire-and-forget パターンで使用される想定。
///
/// # Arguments
/// * `folder_paths` - 対象フォルダのパス配列
/// * `app_handle` - Tauriアプリケーションハンドル（自動注入）
#[command]
pub async fn prefetch_folder_thumbnails(
    folder_paths: Vec<String>,
    app_handle: tauri::AppHandle,
) -> std::result::Result<(), String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    tokio::task::spawn_blocking(move || {
        // 1. 各フォルダから最初の画像パスを取得
        let image_entries: Vec<(usize, String)> = folder_paths
            .iter()
            .enumerate()
            .filter_map(|(index, folder_path)| {
                folder::get_first_image_in_folder(folder_path)
                    .ok()
                    .flatten()
                    .map(|image_path| (index, image_path))
            })
            .collect();

        if image_entries.is_empty() {
            return Ok(());
        }

        // 2. 優先度付きバッチタスクを作成
        let tasks: Vec<BatchTask> = image_entries
            .into_iter()
            .map(|(index, image_path)| {
                let priority = folder::assign_priority(index);
                BatchTask::new(image_path, priority)
            })
            .collect();

        // 3. バッチ生成を実行
        let batch_generator =
            BatchThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;
        let _results = batch_generator.batch_create_thumbnails(tasks);

        Ok(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
