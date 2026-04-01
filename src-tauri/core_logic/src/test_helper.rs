#[cfg(test)]
pub mod test_helpers {
    use std::{
        env::temp_dir,
        fs::{create_dir_all, remove_dir_all, File},
        io::{Read, Write},
        path::{Path, PathBuf},
    };

    use zip::write::SimpleFileOptions;

    pub struct TempTestDir {
        pub path: PathBuf,
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

        pub fn path(&self) -> &PathBuf {
            &self.path
        }
    }

    impl Drop for TempTestDir {
        fn drop(&mut self) {
            let _ = remove_dir_all(&self.path);
        }
    }

    pub fn create_zip<P: AsRef<Path>>(zip_path: P, files: Vec<P>) -> zip::result::ZipResult<()> {
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
