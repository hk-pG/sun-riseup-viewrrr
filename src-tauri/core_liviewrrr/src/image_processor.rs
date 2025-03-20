pub struct ImageProcessor;

impl ImageProcessor {
    pub fn generate_thumbnail(image_path: &str, thumb_path: &str, width: u32, height: u32) {
        let img = image::open(image_path).expect("Failed to open image file");
        let resized = img.resize(width, height, image::imageops::FilterType::Lanczos3);

        resized.save(thumb_path).expect("Failed to save thumbnail");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_thumbnail() {
        let image_path = "test_assets/test.png";
        let thumb_path = "test_assets/test_thumb.png";

        ImageProcessor::generate_thumbnail(image_path, thumb_path, 100, 100);

        assert!(std::path::Path::new(thumb_path).exists());

        std::fs::remove_file(thumb_path).expect("Failed to remove thumbnail");
    }
}
