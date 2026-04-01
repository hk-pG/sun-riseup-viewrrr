// サムネイル生成と管理のためのTauriコマンド
//
// コアロジックは core_logic::thumbnail に移動済み。
// このファイルは Tauri コマンドの薄いラッパーとして、以下のみを担当:
// 1. AppHandle → PathBuf の変換（get_cache_dir）
// 2. core_logic::thumbnail::* の呼び出し
// 3. 結果の Tauri IPC 向けシリアライズ

use core_logic::thumbnail::folder;
use core_logic::thumbnail::{
    BatchTask, BatchThumbnailGenerator, FolderThumbnailResult, ThumbnailGenerator,
};
use tauri::command;

/// サムネイルキャッシュディレクトリのパスを取得（Tauri依存）
fn get_cache_dir(app_handle: &tauri::AppHandle) -> std::io::Result<std::path::PathBuf> {
    use tauri::Manager;
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::NotFound, e))?;
    let thumbnail_dir = cache_dir.join("thumbnails");
    std::fs::create_dir_all(&thumbnail_dir)?;
    Ok(thumbnail_dir)
}

/// 画像のサムネイルを取得または生成する
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
#[allow(dead_code)]
#[command]
pub async fn batch_create_thumbnails(
    image_paths: Vec<String>,
    visible_count: Option<usize>,
    app_handle: tauri::AppHandle,
) -> std::result::Result<std::collections::HashMap<String, serde_json::Value>, String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    tokio::task::spawn_blocking(move || {
        use core_logic::thumbnail::TaskPriority;
        let batch_generator =
            BatchThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;
        let visible_count = visible_count.unwrap_or(10);
        let tasks: Vec<BatchTask> = image_paths
            .into_iter()
            .enumerate()
            .map(|(index, image_path)| {
                let priority = if index < visible_count {
                    TaskPriority::High
                } else if index < visible_count * 3 {
                    TaskPriority::Normal
                } else {
                    TaskPriority::Low
                };
                BatchTask::new(image_path, priority)
            })
            .collect();
        let results = batch_generator.batch_create_thumbnails(tasks);
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
    Err("Not implemented yet".to_string())
}

/// フォルダのサムネイルを取得する
#[command]
pub async fn get_folder_thumbnail(
    folder_path: String,
    app_handle: tauri::AppHandle,
) -> std::result::Result<Option<FolderThumbnailResult>, String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    let result = tokio::task::spawn_blocking(move || {
        let first_image = folder::get_first_image_in_folder(&folder_path)?;
        let image_path = match first_image {
            Some(path) => path,
            None => return Ok::<Option<FolderThumbnailResult>, String>(None),
        };
        let generator =
            ThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;
        let cache_path = generator
            .get_or_create_thumbnail(&image_path)
            .map_err(|e| e.to_string())?;
        let image_name = std::path::Path::new(&image_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();
        let thumbnail_path = cache_path
            .to_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "Failed to convert thumbnail path to string".to_string())?;
        Ok(Some(FolderThumbnailResult {
            image_path,
            thumbnail_path,
            image_name,
        }))
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))??;
    Ok(result)
}

/// 複数フォルダのサムネイルをプリフェッチする
#[command]
pub async fn prefetch_folder_thumbnails(
    folder_paths: Vec<String>,
    app_handle: tauri::AppHandle,
) -> std::result::Result<(), String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    tokio::task::spawn_blocking(move || {
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
        let tasks: Vec<BatchTask> = image_entries
            .into_iter()
            .map(|(index, image_path)| {
                let priority = folder::assign_priority(index);
                BatchTask::new(image_path, priority)
            })
            .collect();
        let batch_generator =
            BatchThumbnailGenerator::with_default_config(cache_dir).map_err(|e| e.to_string())?;
        let _results = batch_generator.batch_create_thumbnails(tasks);
        Ok(())
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}
