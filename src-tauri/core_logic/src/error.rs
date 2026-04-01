use std::io;

/// コマンドエラー型
#[derive(Debug, serde::Serialize)]
pub enum CommandError {
    Io(String),
    PathNotFound(String),
    NoParent,
}

impl From<io::Error> for CommandError {
    fn from(err: io::Error) -> Self {
        CommandError::Io(err.to_string())
    }
}
