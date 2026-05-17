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

use crate::utils::get_cache_dir;

/// フォルダのサムネイルを取得する
#[command]
pub async fn get_folder_thumbnail(
    container_path: String,
    app_handle: tauri::AppHandle,
) -> std::result::Result<Option<FolderThumbnailResult>, String> {
    let cache_dir = get_cache_dir(&app_handle).map_err(|e| e.to_string())?;
    let result = tokio::task::spawn_blocking(move || {
        let first_image = folder::get_first_image_in_folder(&container_path, &cache_dir)?;
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
                folder::get_first_image_in_folder(folder_path, &cache_dir)
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
