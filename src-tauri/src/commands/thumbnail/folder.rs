// フォルダサムネイル取得のためのユーティリティ

use serde::Serialize;

use super::batch::TaskPriority;

/// フォルダサムネイル取得結果
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderThumbnailResult {
    pub image_path: String,
    pub thumbnail_path: String,
    pub image_name: String,
}

/// インデックスから優先度を決定
/// - 0-9: High（可視領域）
/// - 10-29: Normal（近傍）
/// - 30+: Low（バックグラウンド）
pub fn assign_priority(index: usize) -> TaskPriority {
    if index < 10 {
        TaskPriority::High
    } else if index < 30 {
        TaskPriority::Normal
    } else {
        TaskPriority::Low
    }
}

/// フォルダ内の最初の画像ファイルパスを取得
/// core_logic::list_images_in_folder を内部で使用
pub fn get_first_image_in_folder(folder_path: &str) -> Result<Option<String>, String> {
    let images = core_logic::list_images_in_folder(folder_path.to_string())
        .map_err(|e| format!("Failed to list images: {:?}", e))?;

    Ok(images.into_iter().next())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env::temp_dir;
    use std::fs::{create_dir_all, remove_dir_all, File};

    // --- FolderThumbnailResult のシリアライゼーションテスト ---

    #[test]
    fn test_folder_thumbnail_result_serializes_to_camel_case() {
        let result = FolderThumbnailResult {
            image_path: "/photos/folder1/image1.jpg".to_string(),
            thumbnail_path: "/cache/thumbnails/abc123.jpg".to_string(),
            image_name: "image1.jpg".to_string(),
        };

        let json = serde_json::to_value(&result).unwrap();
        // camelCase でシリアライズされることを確認
        assert!(json.get("imagePath").is_some());
        assert!(json.get("thumbnailPath").is_some());
        assert!(json.get("imageName").is_some());
        // snake_case ではないことを確認
        assert!(json.get("image_path").is_none());
        assert!(json.get("thumbnail_path").is_none());
        assert!(json.get("image_name").is_none());

        assert_eq!(json["imagePath"], "/photos/folder1/image1.jpg");
        assert_eq!(json["thumbnailPath"], "/cache/thumbnails/abc123.jpg");
        assert_eq!(json["imageName"], "image1.jpg");
    }

    // --- assign_priority のテスト ---

    #[test]
    fn test_assign_priority_high_for_visible_range() {
        // 0-9: High（可視領域）
        for i in 0..10 {
            assert_eq!(
                assign_priority(i),
                TaskPriority::High,
                "Index {} should be High priority",
                i
            );
        }
    }

    #[test]
    fn test_assign_priority_normal_for_nearby_range() {
        // 10-29: Normal（近傍）
        for i in 10..30 {
            assert_eq!(
                assign_priority(i),
                TaskPriority::Normal,
                "Index {} should be Normal priority",
                i
            );
        }
    }

    #[test]
    fn test_assign_priority_low_for_background() {
        // 30+: Low（バックグラウンド）
        for i in [30, 50, 100, 1000] {
            assert_eq!(
                assign_priority(i),
                TaskPriority::Low,
                "Index {} should be Low priority",
                i
            );
        }
    }

    // --- get_first_image_in_folder のテスト ---

    #[test]
    fn test_get_first_image_returns_image_path() {
        let temp = temp_dir().join("test_folder_thumbnail_first");
        let _ = remove_dir_all(&temp);
        create_dir_all(&temp).unwrap();

        // 画像ファイルを作成
        File::create(temp.join("image1.jpg")).unwrap();
        File::create(temp.join("image2.png")).unwrap();

        let result = get_first_image_in_folder(temp.to_str().unwrap());
        assert!(result.is_ok());
        let first = result.unwrap();
        assert!(first.is_some(), "Should return first image path");
        // パスに画像拡張子が含まれること
        let path = first.unwrap();
        assert!(
            path.ends_with(".jpg") || path.ends_with(".png"),
            "Should return an image file path, got: {}",
            path
        );

        let _ = remove_dir_all(&temp);
    }

    #[test]
    fn test_get_first_image_returns_none_for_empty_folder() {
        let temp = temp_dir().join("test_folder_thumbnail_empty");
        let _ = remove_dir_all(&temp);
        create_dir_all(&temp).unwrap();

        let result = get_first_image_in_folder(temp.to_str().unwrap());
        assert!(result.is_ok());
        assert!(result.unwrap().is_none(), "Empty folder should return None");

        let _ = remove_dir_all(&temp);
    }

    #[test]
    fn test_get_first_image_returns_none_for_non_image_files() {
        let temp = temp_dir().join("test_folder_thumbnail_no_images");
        let _ = remove_dir_all(&temp);
        create_dir_all(&temp).unwrap();

        // 画像以外のファイルのみ
        File::create(temp.join("document.txt")).unwrap();
        File::create(temp.join("data.csv")).unwrap();

        let result = get_first_image_in_folder(temp.to_str().unwrap());
        assert!(result.is_ok());
        assert!(
            result.unwrap().is_none(),
            "Folder with no image files should return None"
        );

        let _ = remove_dir_all(&temp);
    }

    #[test]
    fn test_get_first_image_error_for_nonexistent_folder() {
        let result = get_first_image_in_folder("/nonexistent/folder/path");
        assert!(result.is_err(), "Non-existent folder should return error");
    }
}
