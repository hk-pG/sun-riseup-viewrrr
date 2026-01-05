// サムネイル生成と管理のためのTauriコマンド

use tauri::command;

/// 画像のサムネイルを取得または生成する
///
/// # Arguments
/// * `image_path` - ソース画像のフルパス
///
/// # Returns
/// サムネイルのキャッシュパス（成功時）
#[command]
pub async fn get_or_create_thumbnail(image_path: String) -> Result<String, String> {
    // TODO: Phase 2でThumbnailGeneratorを実装
    Err("Not implemented yet".to_string())
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
) -> Result<std::collections::HashMap<String, String>, String> {
    // TODO: Phase 4（US2）でrayon並列処理を実装
    Err("Not implemented yet".to_string())
}

/// サムネイルキャッシュをクリアする（デバッグ用）
#[command]
pub async fn clear_thumbnail_cache() -> Result<(), String> {
    // TODO: Phase 6でキャッシュ管理を実装
    Err("Not implemented yet".to_string())
}
