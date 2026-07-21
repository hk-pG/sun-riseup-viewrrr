/**
 * アプリ全体のナビゲーション状態。
 *
 * App.tsx が保持し、メニュー action（app-shell）が更新する。
 * 特定 feature のドメイン型ではないため、feature 配下ではなく src 直下に置く。
 */
export interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}

const DEFAULT_APP_STATE: AppState = {
  currentFolderPath: '',
  initialImageIndex: 0,
};

/**
 * Partial 注入時に undefined でデフォルトを潰さないよう、フィールド単位で合成する。
 */
export function createAppState(initialState?: Partial<AppState>): AppState {
  return {
    currentFolderPath:
      initialState?.currentFolderPath ?? DEFAULT_APP_STATE.currentFolderPath,
    initialImageIndex:
      initialState?.initialImageIndex ?? DEFAULT_APP_STATE.initialImageIndex,
  };
}
