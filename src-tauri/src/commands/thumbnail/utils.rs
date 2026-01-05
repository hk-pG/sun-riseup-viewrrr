// サムネイル生成のユーティリティ関数

use blake3;
use directories::ProjectDirs;

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
/// `directories`クレートを使用してOS標準のキャッシュディレクトリを取得します。
///
/// # Returns
/// プラットフォーム固有のキャッシュディレクトリパス
/// - Linux: `~/.cache/sun-riseup-viewrrr/thumbnails`
/// - macOS: `~/Library/Caches/sun-riseup-viewrrr/thumbnails`
/// - Windows: `%LOCALAPPDATA%\sun-riseup-viewrrr\thumbnails`
///
/// # Errors
/// プロジェクトディレクトリが取得できない場合、またはディレクトリ作成に失敗した場合にエラーを返す
pub fn get_cache_dir() -> std::io::Result<std::path::PathBuf> {
    let proj_dirs = ProjectDirs::from("com", "sun-riseup", "viewrrr").ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Could not determine project directories",
        )
    })?;

    let thumbnail_dir = proj_dirs.cache_dir().join("thumbnails");

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

    #[test]
    fn test_get_cache_dir_creates_directory() {
        let cache_dir = get_cache_dir().expect("Should get cache directory");
        assert!(
            cache_dir.exists(),
            "Cache directory should be created if it doesn't exist"
        );
        // directoriesクレートは"viewrrr/thumbnails"という構造を作る
        assert!(
            cache_dir.ends_with("viewrrr/thumbnails"),
            "Cache directory should end with app-specific path: {:?}",
            cache_dir
        );
    }
}
