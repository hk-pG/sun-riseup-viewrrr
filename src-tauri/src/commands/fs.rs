use core_logic::{
    get_sibling_containers as core_get_sibling_containers,
    list_images_in_container as core_list_images_in_container,
    list_images_in_folder as core_list_images_in_folder, CommandError,
};
use tauri::command;

/// Lists all image files in a specified folder. (Wrapper for core logic)
///
/// 非同期実行でUIブロッキングを防止（tokio::spawn_blockingでファイルシステム操作を別スレッドで実行）
#[command]
pub async fn list_images_in_folder(folder_path: String) -> Result<Vec<String>, CommandError> {
    tokio::task::spawn_blocking(move || core_list_images_in_folder(folder_path))
        .await
        .map_err(|e| CommandError::Io(format!("Task join error: {}", e)))?
}

#[tauri::command]
pub async fn list_images_in_container(container_path: String) -> Result<Vec<String>, CommandError> {
    tokio::task::spawn_blocking(move || core_list_images_in_container(container_path))
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
