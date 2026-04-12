#[cfg(test)]
pub mod test_helpers {
    use std::{
        env::temp_dir,
        fs::{create_dir_all, remove_dir_all, File},
        io::{Read, Write},
        path::{Path, PathBuf},
    };

    use zip::write::SimpleFileOptions;

    use crate::image_container::archive::{ArchiveImageContainer, ArchiveImageContainerConfig};

    pub struct TempTestDir {
        path: PathBuf,
    }

    impl TempTestDir {
        pub fn new(name: &str) -> Self {
            let path = temp_dir().join(name);
            create_dir_all(&path).unwrap();
            TempTestDir { path }
        }

        pub fn new_random() -> Self {
            let name = uuid::Uuid::new_v4().to_string();
            Self::new(&name)
        }

        pub fn path(&self) -> &Path {
            self.path.as_path()
        }

        pub fn create_zip<P: AsRef<Path>>(
            zip_path: P,
            files: Vec<P>,
        ) -> zip::result::ZipResult<()> {
            let zip_file = File::create(zip_path)?;
            let mut zip = zip::ZipWriter::new(zip_file);

            let options = SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated)
                .large_file(false);

            for file in files {
                let file_path = file.as_ref();
                let name = file_path
                    .file_name()
                    .unwrap()
                    .to_string_lossy()
                    .into_owned();

                zip.start_file(&name, options)?;

                let mut f = File::open(file_path)?;
                let mut buffer = Vec::new();
                f.read_to_end(&mut buffer)?;
                zip.write_all(&buffer)?;
            }

            zip.finish()?;
            Ok(())
        }
    }

    impl Drop for TempTestDir {
        fn drop(&mut self) {
            let _ = remove_dir_all(&self.path);
        }
    }

    pub struct ZipTestEnv {
        pub temp_dir: TempTestDir,
        pub extract_dir: TempTestDir,
        pub zip_path: PathBuf,
    }

    impl ZipTestEnv {
        /// 指定したファイル名の空画像ファイルを含む zip 環境を構築する
        pub fn with_images(file_names: &[&str]) -> Self {
            let temp_dir = TempTestDir::new_random();
            let image_paths: Vec<PathBuf> = file_names
                .iter()
                .map(|name| {
                    let p = temp_dir.path().join(name);
                    File::create(&p).unwrap();
                    p
                })
                .collect();

            let zip_path = temp_dir.path().join("file.zip");
            let refs: Vec<&PathBuf> = image_paths.iter().collect();
            TempTestDir::create_zip(&zip_path, refs).unwrap();

            let extract_dir = TempTestDir::new_random();
            ZipTestEnv {
                temp_dir,
                extract_dir,
                zip_path,
            }
        }
    }
}
