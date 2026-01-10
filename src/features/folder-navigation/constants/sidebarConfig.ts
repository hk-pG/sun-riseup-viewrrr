/**
 * サイドバー関連の設定定数
 * マジックナンバーを一元管理し、FolderListとSidebarの設定を同期
 */
export const SIDEBAR_CONFIG = {
  /** フォルダリストの初期表示件数 */
  INITIAL_VISIBLE_COUNT: 20,

  /** 「さらに読み込む」で追加する件数 */
  LOAD_MORE_INCREMENT: 20,

  /** プリフェッチ開始までの遅延（ms） - UIの初期レンダリングを優先 */
  PREFETCH_DELAY_MS: 100,

  /** サイドバーのデフォルト幅（px） */
  DEFAULT_WIDTH: 250,

  /** サムネイルのデフォルトサイズ（px） */
  DEFAULT_THUMBNAIL_SIZE: 100,
} as const;

/** 設定値の型 */
export type SidebarConfig = typeof SIDEBAR_CONFIG;
