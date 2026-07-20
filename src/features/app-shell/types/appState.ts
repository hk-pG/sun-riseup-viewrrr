/**
 * アプリケーション全体のナビゲーション状態。
 * 現在のフォルダパスとビューアの初期画像インデックスを保持する。
 */
export interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}

export const DEFAULT_APP_STATE: AppState = {
  currentFolderPath: '',
  initialImageIndex: 0,
};

export function createAppState(
  initialState?: Partial<AppState>,
): AppState {
  return {
    ...DEFAULT_APP_STATE,
    ...initialState,
  };
}
