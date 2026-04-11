// サムネイル画像生成のコアロジック

use crate::thumbnail::config::ThumbnailConfig;
use crate::thumbnail::error::{Result, ThumbnailError};
use crate::thumbnail::utils::hash_path;
use image::imageops::FilterType;
use image::{GenericImageView, ImageFormat};
use std::path::{Path, PathBuf};

/// サムネイル画像の生成と管理
pub struct ThumbnailGenerator {
    config: ThumbnailConfig,
    cache_dir: PathBuf,
}

impl ThumbnailGenerator {
    /// 新しいThumbnailGeneratorを作成
    pub fn new(config: ThumbnailConfig, cache_dir: PathBuf) -> Result<Self> {
        config.validate_quality()?;
        config.validate_size()?;
        Ok(Self { config, cache_dir })
    }

    /// デフォルト設定でThumbnailGeneratorを作成
    pub fn with_default_config(cache_dir: PathBuf) -> Result<Self> {
        Self::new(ThumbnailConfig::default(), cache_dir)
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
        let cache_path = self.get_thumbnail_cache_path(image_path);

        // TODO: ifのネストが深い。優先度は低いが、将来的にリファクタリングして早期リターンを増やすことを検討
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
    fn get_thumbnail_cache_path(&self, image_path: &str) -> PathBuf {
        let hash = hash_path(image_path);
        let cache_file = format!("{}.jpg", hash);
        self.cache_dir.join(cache_file)
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
    use crate::test_helper::test_helpers::TempTestDir;
    use std::fs::create_dir_all;

    /// テスト用の ThumbnailGenerator を作成
    fn create_test_generator() -> (ThumbnailGenerator, TempTestDir) {
        let temp = TempTestDir::new_random();
        let cache_dir = temp.path().join("cache");
        create_dir_all(&cache_dir).unwrap();
        let gen = ThumbnailGenerator::with_default_config(cache_dir).unwrap();
        (gen, temp)
    }

    /// テスト用の ThumbnailGenerator（カスタム設定）
    #[allow(dead_code)]
    fn create_test_generator_with_config(
        width: u32,
        height: u32,
    ) -> (ThumbnailGenerator, TempTestDir) {
        let temp = TempTestDir::new_random();
        let cache_dir = temp.path().join("cache");
        create_dir_all(&cache_dir).unwrap();
        let config = ThumbnailConfig::new(width, height, 80, 1024 * 1024 * 1024);
        let gen = ThumbnailGenerator::new(config, cache_dir).unwrap();
        (gen, temp)
    }

    // --- calculate_thumbnail_dimensions テスト ---

    #[test]
    fn test_calculate_thumbnail_dimensions_landscape() {
        // 横長画像（1920x1080）→ ターゲット200x200
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(1920, 1080);
        assert_eq!(w, 200); // 幅がターゲットに一致
        assert!(h < 200); // 高さはターゲット未満（アスペクト比維持）
        assert!(h > 0);
        // 1920/1080 ≈ 1.778、200/1.778 ≈ 112
        assert_eq!(h, 112);
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_portrait() {
        // 縦長画像（1080x1920）→ ターゲット200x200
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(1080, 1920);
        assert!(w < 200);
        assert_eq!(h, 200); // 高さがターゲットに一致
        assert!(w > 0);
        // 1080/1920 ≈ 0.5625、200*0.5625 = 112
        assert_eq!(w, 112);
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_square() {
        // 正方形画像（500x500）→ ターゲット200x200
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(500, 500);
        // 正方形対正方形ターゲットでは width == height == target
        // aspect_ratio (1.0) == target_aspect_ratio (1.0) → else branch
        assert_eq!(w, 200);
        assert_eq!(h, 200);
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_small_image() {
        // ターゲットより小さい画像（50x50）
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(50, 50);
        // アスペクト比計算は入力サイズに関係なく適用
        assert_eq!(w, 200);
        assert_eq!(h, 200);
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_very_wide() {
        // 極端に横長（10000x100）
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(10000, 100);
        assert_eq!(w, 200);
        assert!(h >= 1); // max(1) による下限保証
                         // 10000/100 = 100、200/100 = 2
        assert_eq!(h, 2);
    }

    #[test]
    fn test_calculate_thumbnail_dimensions_very_tall() {
        // 極端に縦長（100x10000）
        let (gen, _temp) = create_test_generator();
        let (w, h) = gen.calculate_thumbnail_dimensions(100, 10000);
        assert_eq!(h, 200);
        assert!(w >= 1); // max(1) による下限保証
                         // 100/10000 = 0.01、200*0.01 = 2
        assert_eq!(w, 2);
    }

    // --- get_or_create_thumbnail エラーテスト ---

    #[test]
    fn test_image_not_found_error() {
        let (gen, _temp) = create_test_generator();
        let result = gen.get_or_create_thumbnail("/nonexistent/path/image.jpg");
        assert!(result.is_err());
        match result.unwrap_err() {
            ThumbnailError::ImageNotFound(path) => {
                assert_eq!(path, "/nonexistent/path/image.jpg");
            }
            other => panic!("Expected ImageNotFound, got: {:?}", other),
        }
    }

    // --- generate_thumbnail 正常系テスト ---

    #[test]
    fn test_generate_thumbnail_success() {
        let temp = TempTestDir::new_random();

        let image_path = temp.path().join("test_image.jpg");
        let img = image::RgbImage::new(100, 100);
        img.save_with_format(&image_path, ImageFormat::Jpeg)
            .unwrap();

        let cache_dir = temp.path().join("cache");
        create_dir_all(&cache_dir).unwrap();

        let gen = ThumbnailGenerator::with_default_config(cache_dir.clone()).unwrap();
        let result = gen.get_or_create_thumbnail(image_path.to_str().unwrap());
        assert!(result.is_ok());

        let thumbnail_path = result.unwrap();
        assert!(thumbnail_path.exists(), "Thumbnail file should be created");
        assert!(
            thumbnail_path.starts_with(&cache_dir),
            "Should be in cache dir"
        );
        assert!(thumbnail_path.extension().unwrap() == "jpg");
    }

    #[test]
    fn test_thumbnail_cache_hit() {
        let temp = TempTestDir::new_random();

        let image_path = temp.path().join("test_cached.jpg");
        let img = image::RgbImage::new(100, 100);
        img.save_with_format(&image_path, ImageFormat::Jpeg)
            .unwrap();

        let cache_dir = temp.path().join("cache");
        create_dir_all(&cache_dir).unwrap();

        let gen = ThumbnailGenerator::with_default_config(cache_dir).unwrap();
        let path1 = gen
            .get_or_create_thumbnail(image_path.to_str().unwrap())
            .unwrap();
        let path2 = gen
            .get_or_create_thumbnail(image_path.to_str().unwrap())
            .unwrap();
        assert_eq!(path1, path2, "Same image should return same cache path");
    }
}
