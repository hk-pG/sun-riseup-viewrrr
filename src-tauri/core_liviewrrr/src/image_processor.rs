use image::{DynamicImage, GenericImageView};

pub struct ImageProcessor;

impl ImageProcessor {
    pub fn generate_thumbnail(image_path: &str, thumb_path: &str, width: u32, height: u32) {
        let img = image::open(image_path).expect("Failed to open image file");
        let resized = img.resize(width, height, image::imageops::FilterType::Lanczos3);

        resized.save(thumb_path).expect("Failed to save thumbnail");
    }
}
