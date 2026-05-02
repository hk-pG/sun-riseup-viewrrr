/// サムネイルキャッシュディレクトリのパスを取得（Tauri依存）
pub fn get_cache_dir(app_handle: &tauri::AppHandle) -> std::io::Result<std::path::PathBuf> {
    use tauri::Manager;
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::NotFound, e))?;
    let thumbnail_dir = cache_dir.join("thumbnails");
    std::fs::create_dir_all(&thumbnail_dir)?;
    Ok(thumbnail_dir)
}
