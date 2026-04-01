// バッチサムネイル生成のための並列処理実装

use crate::thumbnail::config::ThumbnailConfig;
use crate::thumbnail::error::{Result, ThumbnailError};
use crate::thumbnail::generator::ThumbnailGenerator;
use rayon::{ThreadPool, ThreadPoolBuilder};
use std::path::PathBuf;
use std::sync::Arc;

/// 優先度レベル
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum TaskPriority {
    High = 3,   // 可視領域のサムネイル
    Normal = 2, // 近傍のサムネイル
    Low = 1,    // バックグラウンド生成
}

/// バッチ生成タスク
#[derive(Debug, Clone)]
pub struct BatchTask {
    pub image_path: String,
    pub priority: TaskPriority,
}

impl BatchTask {
    pub fn new(image_path: String, priority: TaskPriority) -> Self {
        Self {
            image_path,
            priority,
        }
    }
}

/// バッチサムネイル生成結果
#[derive(Debug, Clone)]
pub struct BatchResult {
    pub image_path: String,
    pub thumbnail_path: Option<PathBuf>,
    pub error: Option<String>,
}

impl BatchResult {
    pub fn success(image_path: String, thumbnail_path: PathBuf) -> Self {
        Self {
            image_path,
            thumbnail_path: Some(thumbnail_path),
            error: None,
        }
    }

    pub fn failure(image_path: String, error: String) -> Self {
        Self {
            image_path,
            thumbnail_path: None,
            error: Some(error),
        }
    }
}

/// バッチサムネイル生成マネージャー
pub struct BatchThumbnailGenerator {
    thread_pool: Arc<ThreadPool>,
    generator: Arc<ThumbnailGenerator>,
}

impl BatchThumbnailGenerator {
    /// 新しいBatchThumbnailGeneratorを作成
    ///
    /// # Arguments
    /// * `config` - サムネイル設定
    /// * `cache_dir` - サムネイルキャッシュディレクトリのパス
    ///
    /// # Returns
    /// 初期化されたBatchThumbnailGenerator
    pub fn new(config: ThumbnailConfig, cache_dir: PathBuf) -> Result<Self> {
        // 動的スレッド数の計算: min(max(2, num_cpus), 8)
        let num_cpus = num_cpus::get();
        let thread_count = num_cpus.clamp(2, 8);

        // rayon ThreadPoolの初期化
        let thread_pool = ThreadPoolBuilder::new()
            .num_threads(thread_count)
            .thread_name(|i| format!("thumbnail-worker-{}", i))
            .build()
            .map_err(|e| {
                ThumbnailError::GenerationError(format!("Failed to build thread pool: {}", e))
            })?;

        // ThumbnailGeneratorの作成
        let generator = ThumbnailGenerator::new(config, cache_dir)?;

        Ok(Self {
            thread_pool: Arc::new(thread_pool),
            generator: Arc::new(generator),
        })
    }

    /// デフォルト設定でBatchThumbnailGeneratorを作成
    pub fn with_default_config(cache_dir: PathBuf) -> Result<Self> {
        Self::new(ThumbnailConfig::default(), cache_dir)
    }

    /// 複数の画像のサムネイルをバッチ生成
    ///
    /// # Arguments
    /// * `tasks` - 生成タスクのリスト（優先度付き）
    ///
    /// # Returns
    /// 各画像の生成結果のベクタ
    pub fn batch_create_thumbnails(&self, mut tasks: Vec<BatchTask>) -> Vec<BatchResult> {
        // 優先度でソート（High -> Normal -> Low）
        tasks.sort_by(|a, b| b.priority.cmp(&a.priority));

        // rayonの並列イテレータで処理
        use rayon::prelude::*;

        let generator = Arc::clone(&self.generator);

        self.thread_pool.install(|| {
            tasks
                .par_iter()
                .map(
                    |task| match generator.get_or_create_thumbnail(&task.image_path) {
                        Ok(thumbnail_path) => {
                            BatchResult::success(task.image_path.clone(), thumbnail_path)
                        }
                        Err(e) => BatchResult::failure(task.image_path.clone(), e.to_string()),
                    },
                )
                .collect()
        })
    }

    /// スレッドプールのスレッド数を取得
    pub fn thread_count(&self) -> usize {
        self.thread_pool.current_num_threads()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_priority_ordering() {
        assert!(TaskPriority::High > TaskPriority::Normal);
        assert!(TaskPriority::Normal > TaskPriority::Low);
        assert!(TaskPriority::High > TaskPriority::Low);
    }

    #[test]
    fn test_batch_task_creation() {
        let task = BatchTask::new("/path/to/image.jpg".to_string(), TaskPriority::High);
        assert_eq!(task.image_path, "/path/to/image.jpg");
        assert_eq!(task.priority, TaskPriority::High);
    }

    #[test]
    fn test_batch_result_success() {
        let result = BatchResult::success(
            "/path/to/image.jpg".to_string(),
            PathBuf::from("/cache/thumbnail.jpg"),
        );
        assert_eq!(result.image_path, "/path/to/image.jpg");
        assert!(result.thumbnail_path.is_some());
        assert!(result.error.is_none());
    }

    #[test]
    fn test_batch_result_failure() {
        let result = BatchResult::failure(
            "/path/to/image.jpg".to_string(),
            "Failed to generate".to_string(),
        );
        assert_eq!(result.image_path, "/path/to/image.jpg");
        assert!(result.thumbnail_path.is_none());
        assert!(result.error.is_some());
    }
}
