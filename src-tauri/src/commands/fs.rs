use core_logic::get_sibling_containers as core_get_sibling_containers;
use core_logic::list_images_in_container as core_list_images_in_container;
use core_logic::CommandError;
use tauri::command;

use crate::utils::get_archive_cache_dir;

/// Lists all image files in a specified container. (Wrapper for core logic)
///
/// 非同期実行でUIブロッキングを防止（tokio::spawn_blockingでファイルシステム操作を別スレッドで実行）
#[command]
pub async fn list_images_in_container(
    container_path: String,
    app_handle: tauri::AppHandle,
) -> Result<Vec<String>, CommandError> {
    tokio::task::spawn_blocking(move || {
        core_list_images_in_container(container_path, get_archive_cache_dir(&app_handle)?)
    })
    .await
    .map_err(|e| CommandError::Io(format!("Task join error: {}", e)))?
}

/// Gets sibling folders for a given path. (Wrapper for core logic)
///
/// 非同期実行でUIブロッキングを防止（tokio::spawn_blockingでファイルシステム操作を別スレッドで実行）
#[command]
pub async fn get_sibling_containers(container_path: String) -> Result<Vec<String>, CommandError> {
    tokio::task::spawn_blocking(move || core_get_sibling_containers(container_path))
        .await
        .map_err(|e| CommandError::Io(format!("Task join error: {}", e)))?
}
