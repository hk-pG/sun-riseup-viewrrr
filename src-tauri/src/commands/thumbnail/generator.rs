// サムネイル画像生成のコアロジック

use super::config::ThumbnailConfig;
use super::error::{Result, ThumbnailError};
use super::utils::{get_cache_dir, hash_path};
use image::imageops::FilterType;
use image::{GenericImageView, ImageFormat};
use std::path::{Path, PathBuf};

/// サムネイル画像の生成と管理
pub struct ThumbnailGenerator {
    config: ThumbnailConfig,
}

impl ThumbnailGenerator {
    /// 新しいThumbnailGeneratorを作成
    pub fn new(config: ThumbnailConfig) -> Result<Self> {
        config.validate_quality()?;
        config.validate_size()?;
        Ok(Self { config })
    }

    /// デフォルト設定でThumbnailGeneratorを作成
    pub fn default() -> Result<Self> {
        Self::new(ThumbnailConfig::default())
    }

    /// 画像のサムネイルを生成または取得
    ///
    /// # Arguments
    /// * `image_path` - ソース画像のパス
    ///
    /// # Returns
    /// サムネイルのキャッシュパス
    pub fn get_or_create_thumbnail(&self, image_path: &str) -> Result<PathBuf> {
        // 画像ファイルの存在確認
        let source_path = Path::new(image_path);
        if !source_path.exists() {
            return Err(ThumbnailError::ImageNotFound(image_path.to_string()));
        }

        // サムネイルのキャッシュパスを計算
        let cache_path = self.get_thumbnail_cache_path(image_path)?;

        // キャッシュが存在し、ソースより新しい場合はそれを返す
        if cache_path.exists() {
            if let (Ok(cache_metadata), Ok(source_metadata)) = (
                std::fs::metadata(&cache_path),
                std::fs::metadata(source_path),
            ) {
                if let (Ok(cache_modified), Ok(source_modified)) =
                    (cache_metadata.modified(), source_metadata.modified())
                {
                    if cache_modified >= source_modified {
                        return Ok(cache_path);
                    }
                }
            }
        }

        // サムネイルを生成
        self.generate_thumbnail(image_path, &cache_path)?;
        Ok(cache_path)
    }

    /// サムネイルのキャッシュパスを計算
    fn get_thumbnail_cache_path(&self, image_path: &str) -> Result<PathBuf> {
        let cache_dir = get_cache_dir()?;
        let hash = hash_path(image_path);
        let cache_file = format!("{}.jpg", hash);
        Ok(cache_dir.join(cache_file))
    }

    /// サムネイルを生成してキャッシュに保存
    ///
    /// # Arguments
    /// * `image_path` - ソース画像のパス
    /// * `output_path` - サムネイルの保存先パス
    fn generate_thumbnail(&self, image_path: &str, output_path: &Path) -> Result<()> {
        // 画像を読み込み
        let img = image::open(image_path).map_err(|e| {
            ThumbnailError::DecodeError(format!("Failed to open image {}: {}", image_path, e))
        })?;

        // サムネイルサイズを計算（アスペクト比を維持）
        let (width, height) = img.dimensions();
        let (thumb_width, thumb_height) = self.calculate_thumbnail_dimensions(width, height);

        // Lanczos3フィルターでリサイズ（高品質）
        let thumbnail = img.resize(thumb_width, thumb_height, FilterType::Lanczos3);

        // 出力ディレクトリが存在することを確認
        if let Some(parent) = output_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // JPEGとして保存
        thumbnail
            .save_with_format(output_path, ImageFormat::Jpeg)
            .map_err(|e| {
                ThumbnailError::GenerationError(format!(
                    "Failed to save thumbnail to {:?}: {}",
                    output_path, e
                ))
            })?;

        Ok(())
    }

    /// サムネイルの寸法を計算（アスペクト比を維持）
    ///
    /// # Arguments
    /// * `width` - 元の画像の幅
    /// * `height` - 元の画像の高さ
    ///
    /// # Returns
    /// (サムネイルの幅, サムネイルの高さ)
    fn calculate_thumbnail_dimensions(&self, width: u32, height: u32) -> (u32, u32) {
        let target_width = self.config.width;
        let target_height = self.config.height;

        // アスペクト比を計算
        let aspect_ratio = width as f64 / height as f64;
        let target_aspect_ratio = target_width as f64 / target_height as f64;

        if aspect_ratio > target_aspect_ratio {
            // 横長の画像：幅を基準にリサイズ
            let new_height = (target_width as f64 / aspect_ratio) as u32;
            (target_width, new_height.max(1))
        } else {
            // 縦長の画像：高さを基準にリサイズ
            let new_width = (target_height as f64 * aspect_ratio) as u32;
            (new_width.max(1), target_height)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_thumbnail_dimensions_landscape() {
        let generator = ThumbnailGenerator::default().unwrap();

        // 横長の画像（4000x3000）
        let (width, height) = generator.calculate_thumbnail_dimensions(4000, 3000);
        assert_eq!(width, 200, "Width should be 200");
        assert_eq!(height, 150, "Height should maintain aspect ratio");
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_portrait() {
        let generator = ThumbnailGenerator::default().unwrap();

        // 縦長の画像（3000x4000）
        let (width, height) = generator.calculate_thumbnail_dimensions(3000, 4000);
        assert_eq!(width, 150, "Width should maintain aspect ratio");
        assert_eq!(height, 200, "Height should be 200");
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_square() {
        let generator = ThumbnailGenerator::default().unwrap();

        // 正方形の画像（3000x3000）
        let (width, height) = generator.calculate_thumbnail_dimensions(3000, 3000);
        assert_eq!(width, 200, "Width should be 200");
        assert_eq!(height, 200, "Height should be 200");
    }

    #[test]
    fn test_image_not_found_error() {
        let generator = ThumbnailGenerator::default().unwrap();
        let result = generator.get_or_create_thumbnail("/nonexistent/image.jpg");
        assert!(result.is_err());
        match result.unwrap_err() {
            ThumbnailError::ImageNotFound(path) => {
                assert_eq!(path, "/nonexistent/image.jpg");
            }
            _ => panic!("Expected ImageNotFound error"),
        }
    }
}
