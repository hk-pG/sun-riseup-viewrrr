// サムネイル生成のユーティリティ関数

use blake3;
use tauri::{AppHandle, Manager};

/// 画像パスからBLAKE3ハッシュを生成してサムネイルIDを作成
///
/// # Arguments
/// * `image_path` - ソース画像のパス
///
/// # Returns
/// 16進数エンコードされたBLAKE3ハッシュ文字列（64文字）
pub fn hash_path(image_path: &str) -> String {
    let hash = blake3::hash(image_path.as_bytes());
    hash.to_hex().to_string()
}

/// サムネイルキャッシュディレクトリのパスを取得
///
/// Tauri PathResolverを使用してOS標準のキャッシュディレクトリを取得します。
/// これは`tauri.conf.json`の`$CACHE`変数と一貫性があります。
///
/// # Arguments
/// * `app_handle` - Tauriアプリケーションハンドル
///
/// # Returns
/// プラットフォーム固有のキャッシュディレクトリパス
/// - Linux: `~/.cache/sun-riseup-viewrrr/thumbnails`
/// - macOS: `~/Library/Caches/sun-riseup-viewrrr/thumbnails`
/// - Windows: `%LOCALAPPDATA%\sun-riseup-viewrrr\cache\thumbnails`
///
/// # Errors
/// ディレクトリの取得または作成に失敗した場合にエラーを返す
pub fn get_cache_dir(app_handle: &AppHandle) -> std::io::Result<std::path::PathBuf> {
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::NotFound, e))?;

    let thumbnail_dir = cache_dir.join("thumbnails");

    // ディレクトリが存在しない場合は作成
    std::fs::create_dir_all(&thumbnail_dir)?;

    Ok(thumbnail_dir)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_path_consistency() {
        let path = "/path/to/image.jpg";
        let hash1 = hash_path(path);
        let hash2 = hash_path(path);
        assert_eq!(hash1, hash2, "Same path should produce same hash");
        assert_eq!(hash1.len(), 64, "BLAKE3 hash should be 64 hex characters");
    }

    #[test]
    fn test_hash_path_uniqueness() {
        let path1 = "/path/to/image1.jpg";
        let path2 = "/path/to/image2.jpg";
        let hash1 = hash_path(path1);
        let hash2 = hash_path(path2);
        assert_ne!(
            hash1, hash2,
            "Different paths should produce different hashes"
        );
    }

    // Note: get_cache_dir()のテストはAppHandleが必要なため、
    // 統合テストで実施します（src-tauri/tests/）
}
