// サムネイル生成のユーティリティ関数

use blake3;

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
}
