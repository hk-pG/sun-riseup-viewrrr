// サムネイル生成の設定

/// サムネイル生成の設定
#[derive(Debug, Clone)]
pub struct ThumbnailConfig {
    /// サムネイルの幅（ピクセル）
    pub width: u32,

    /// サムネイルの高さ（ピクセル）
    pub height: u32,

    /// 画像品質（1-100、JPEG用）
    pub quality: u8,

    /// キャッシュの最大サイズ（バイト）
    pub max_cache_size: u64,
}

impl Default for ThumbnailConfig {
    fn default() -> Self {
        Self {
            width: 200,
            height: 200,
            quality: 80,
            max_cache_size: 1024 * 1024 * 1024, // 1GB
        }
    }
}

impl ThumbnailConfig {
    /// 新しい設定を作成
    pub fn new(width: u32, height: u32, quality: u8, max_cache_size: u64) -> Self {
        Self {
            width,
            height,
            quality,
            max_cache_size,
        }
    }

    /// 品質値を検証（1-100の範囲）
    pub fn validate_quality(&self) -> Result<(), String> {
        if self.quality < 1 || self.quality > 100 {
            return Err(format!(
                "Quality must be between 1 and 100, got {}",
                self.quality
            ));
        }
        Ok(())
    }

    /// サイズ値を検証（正の値）
    pub fn validate_size(&self) -> Result<(), String> {
        if self.width == 0 || self.height == 0 {
            return Err(format!(
                "Width and height must be positive, got {}x{}",
                self.width, self.height
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = ThumbnailConfig::default();
        assert_eq!(config.width, 200);
        assert_eq!(config.height, 200);
        assert_eq!(config.quality, 80);
        assert_eq!(config.max_cache_size, 1024 * 1024 * 1024);
    }

    #[test]
    fn test_validate_quality() {
        let config = ThumbnailConfig::new(200, 200, 80, 1024 * 1024 * 1024);
        assert!(config.validate_quality().is_ok());

        let invalid_config = ThumbnailConfig::new(200, 200, 0, 1024 * 1024 * 1024);
        assert!(invalid_config.validate_quality().is_err());

        let invalid_config2 = ThumbnailConfig::new(200, 200, 101, 1024 * 1024 * 1024);
        assert!(invalid_config2.validate_quality().is_err());
    }

    #[test]
    fn test_validate_size() {
        let config = ThumbnailConfig::new(200, 200, 80, 1024 * 1024 * 1024);
        assert!(config.validate_size().is_ok());

        let invalid_config = ThumbnailConfig::new(0, 200, 80, 1024 * 1024 * 1024);
        assert!(invalid_config.validate_size().is_err());

        let invalid_config2 = ThumbnailConfig::new(200, 0, 80, 1024 * 1024 * 1024);
        assert!(invalid_config2.validate_size().is_err());
    }
}
