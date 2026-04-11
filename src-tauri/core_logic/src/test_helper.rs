#[cfg(test)]
pub mod test_helpers {
    use std::{
        env::temp_dir,
        fs::{create_dir_all, remove_dir_all},
        path::{Path, PathBuf},
    };

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
            &self.path
        }
    }

    impl Drop for TempTestDir {
        fn drop(&mut self) {
            let _ = remove_dir_all(&self.path);
        }
    }
}
