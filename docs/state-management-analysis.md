# フロントエンド状態管理 - 現状分析と今後の課題・対策

## 📊 現状分析

### プロジェクト概要
- **総ファイル数**: 約79ファイル (TypeScript/TSX)
- **実装コード**: 約4,000行
- **主要技術スタック**: React 19, SWR, Tauri
- **アーキテクチャ**: Feature-based構成

### 状態管理の現状

#### 1. **ローカル状態 (useState)**
**使用箇所**: コンポーネントレベルの状態管理

```typescript
// App.tsx - アプリケーションルート
interface AppState {
  currentFolderPath: string;
  initialImageIndex: number;
}
const [appState, setAppState] = useState<AppState>({...});

// ImageViewer.tsx - 画像閲覧機能
const [currentIndex, setCurrentIndex] = useState(initialIndex);
const [settings, setSettings] = useState<ViewerSettings>(mergedSettings);
const [loading, setLoading] = useState(true);
```

**特徴**:
- ✅ シンプルで理解しやすい
- ✅ コンポーネント内で完結
- ⚠️ 複数コンポーネント間での共有が困難
- ⚠️ 状態のリフトアップが必要になると煩雑化

#### 2. **Context API**
**使用箇所**: グローバル状態の共有

```typescript
// ServiceContext.tsx - DI/サービスレイヤー
const servicesContext = createContext<FileSystemService>(tauriFileSystemService);
export const useServices = (): FileSystemService => useContext(servicesContext);

// ThemeProvider.tsx - テーマ管理
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}
```

**特徴**:
- ✅ 依存性注入パターンの実現（ServiceContext）
- ✅ グローバル設定の共有（ThemeProvider）
- ✅ テスト時のモック化が容易
- ⚠️ 値の更新で全消費者が再レンダリング
- ⚠️ Contextの分割戦略が必要

#### 3. **SWR (データフェッチング)**
**使用箇所**: サーバーサイド・非同期データ管理

```typescript
// useImages.ts - 画像リスト取得
export const useImages = (folderPath?: string | null) => {
  const { data, error, isLoading } = useSWR(
    folderPath ? ['images', folderPath] : null,
    () => fetchImages(folderPath as string, fs),
    {
      revalidateOnFocus: false,
      suspense: false,
      keepPreviousData: true,
    }
  );
  return { images: data, error, isLoading };
};
```

**特徴**:
- ✅ キャッシング・再検証の自動化
- ✅ ローディング・エラー状態の統一管理
- ✅ `keepPreviousData`でちらつき防止
- ✅ React 19のconcurrent features対応済み
- ⚠️ クライアント状態との統合が別管理

#### 4. **useTransition (React 19)**
**使用箇所**: 非ブロッキング更新

```typescript
// App.tsx - フォルダ切り替え
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setAppState(prev => ({...prev, currentFolderPath: folderPath}));
});

// ImageViewer.tsx - ズーム操作
startTransition(() => {
  setSettings(prev => ({ ...prev, zoom: newZoom }));
});
```

**特徴**:
- ✅ 重い処理の非同期化でUI応答性向上
- ✅ 適切な使い分け（画像切り替えには使わない）
- ✅ React 19の最新機能を活用

---

## 🔍 現在の設計の強み

### 1. **明確な責任分離**
- **Feature-based構造**: `app-shell`, `folder-navigation`, `image-viewer`
- **hooks/components/services分離**: 関心事の明確化
- **型安全性**: TypeScriptで厳密な型定義

### 2. **テスタビリティ**
- ServiceContextによるDIパターン
- モック化が容易な設計
- テストファイルが整備済み

### 3. **パフォーマンス最適化**
```typescript
// useMemoで不要な再レンダリング防止
const currentImage = useMemo(
  () => images[currentIndex],
  [images, currentIndex]
);

// useCallbackで関数の参照安定性を保証
const goToNext = useCallback(() => {...}, [currentIndex, images, callbacks]);
```

### 4. **適切な技術選択**
- SWRでサーバー状態を管理
- Context APIでグローバル設定を共有
- useStateでローカル状態を管理

---

## ⚠️ スケール時の課題

### 課題1: **状態の散在と追跡困難性**
**現状**:
- `App.tsx`に`appState`（フォルダパス、画像インデックス）
- `ImageViewer.tsx`に`settings`、`currentIndex`、`loading`
- `ThemeProvider`にテーマ状態
- 状態がコンポーネント間に分散

**スケール時の問題**:
```typescript
// 例: 履歴機能を追加したい場合
// - App.tsxに履歴スタックを追加？
// - ImageViewerの状態も保存する必要がある
// - 複数の状態を同期する複雑性が増大
```

### 課題2: **Props Drilling**
**現状**:
```typescript
// App.tsx → ImageViewer → ImageDisplay → ...
<ImageViewer 
  folderPath={appState.currentFolderPath}
  initialIndex={appState.initialImageIndex}
  callbacks={...}
/>
```

**将来的な問題**:
- 中間コンポーネントが増えるとpropsの受け渡しが煩雑
- コンポーネントの再利用性が低下

### 課題3: **グローバル状態の更新による過剰な再レンダリング**
**現状**:
```typescript
// ThemeProvider - 全消費者が再レンダリング
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
```

**将来的な問題**:
- Context値更新時、全useTheme()呼び出し箇所が再レンダリング
- セレクタ機能がないため部分購読不可

### 課題4: **複雑な状態遷移の管理**
**将来の機能追加例**:
- お気に入り管理
- プレイリスト機能
- タグ・メタデータ編集
- 複数ウィンドウ対応

**問題**:
- useStateでは複雑な状態遷移の管理が困難
- 状態更新ロジックが分散しデバッグが困難

### 課題5: **永続化の欠如**
**現状**:
- アプリ再起動で全状態がリセット
- `@tauri-apps/plugin-store`の統合が未完

**必要な機能**:
- 最後に開いたフォルダの記憶
- 閲覧位置の保存
- 設定の永続化

---

## 🚀 スケール戦略・対策

### 戦略A: **段階的なZustand導入** (推奨)

#### なぜZustandか？
- ✅ 軽量（1KB未満）で既存コードへの影響が小さい
- ✅ Redux DevToolsで状態の可視化が可能
- ✅ セレクタによる部分購読で再レンダリング最適化
- ✅ ミドルウェアで永続化が容易
- ✅ TypeScript完全対応

#### フェーズ1: グローバル状態の統合
```typescript
// src/shared/stores/appStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // フォルダ・画像管理
  currentFolderPath: string;
  currentImageIndex: number;
  recentFolders: string[];
  
  // アクション
  setFolder: (path: string, index?: number) => void;
  setImageIndex: (index: number) => void;
  addRecentFolder: (path: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        currentFolderPath: '',
        currentImageIndex: 0,
        recentFolders: [],
        
        setFolder: (path, index = 0) =>
          set({ currentFolderPath: path, currentImageIndex: index }),
        
        setImageIndex: (index) =>
          set({ currentImageIndex: index }),
        
        addRecentFolder: (path) =>
          set((state) => ({
            recentFolders: [
              path,
              ...state.recentFolders.filter((p) => p !== path)
            ].slice(0, 10),
          })),
      }),
      { name: 'app-storage' }
    )
  )
);
```

**移行例**:
```typescript
// Before (App.tsx)
const [appState, setAppState] = useState<AppState>({...});

// After
const { currentFolderPath, currentImageIndex, setFolder } = useAppStore(
  (state) => ({
    currentFolderPath: state.currentFolderPath,
    currentImageIndex: state.currentImageIndex,
    setFolder: state.setFolder,
  })
);
```

#### フェーズ2: 機能別ストアの分割
```typescript
// src/features/image-viewer/stores/viewerStore.ts
interface ViewerState {
  settings: ViewerSettings;
  zoom: number;
  rotation: number;
  fitMode: FitMode;
  
  setZoom: (zoom: number) => void;
  resetView: () => void;
}

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      zoom: 1,
      rotation: 0,
      fitMode: 'both',
      
      setZoom: (zoom) => set({ zoom }),
      resetView: () => set({ zoom: 1, rotation: 0 }),
    }),
    { name: 'viewer-settings' }
  )
);
```

#### フェーズ3: Tauri Plugin Storeとの統合
```typescript
// src/shared/stores/middleware/tauriPersist.ts
import { Store } from '@tauri-apps/plugin-store';

export const tauriPersist = (config) => (set, get, api) => {
  const store = new Store('settings.json');
  
  // 初期化時に読み込み
  store.get('state').then((savedState) => {
    if (savedState) set(savedState);
  });
  
  // 状態変更時に保存
  api.subscribe((state) => {
    store.set('state', state);
    store.save();
  });
  
  return config(set, get, api);
};
```

### 戦略B: **Context最適化（小規模拡張の場合）**

#### 1. Context分割
```typescript
// 読み取り専用と書き込み用を分離
const ThemeStateContext = createContext<Theme>(undefined);
const ThemeActionsContext = createContext<{setTheme: ...}>(undefined);

// 更新関数を使わないコンポーネントは再レンダリングされない
export const useThemeState = () => useContext(ThemeStateContext);
export const useThemeActions = () => useContext(ThemeActionsContext);
```

#### 2. useSyncExternalStoreの活用
```typescript
// React 19の新機能でContextの欠点を補完
import { useSyncExternalStore } from 'react';

const store = {
  state: { theme: 'light' },
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  getSnapshot() {
    return this.state;
  },
  setState(newState) {
    this.state = newState;
    this.listeners.forEach(l => l());
  }
};

export const useTheme = () => useSyncExternalStore(
  store.subscribe,
  store.getSnapshot
);
```

### 戦略C: **データフェッチングの強化**

#### 1. SWRの高度な活用
```typescript
// 楽観的更新
const { data, mutate } = useSWR('/api/favorites');
const addFavorite = async (item) => {
  mutate([...data, item], false); // UI即座更新
  await api.addFavorite(item); // バックグラウンド同期
  mutate(); // 再検証
};

// プリフェッチ
const { data: currentImages } = useImages(currentFolder);
const nextFolder = folders[currentIndex + 1];
useSWR(nextFolder ? ['images', nextFolder] : null, fetcher); // 先読み
```

#### 2. TanStack Query（代替案）
```typescript
// より強力な機能が必要な場合
import { useQuery, useMutation } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['images', folderPath],
  queryFn: () => fetchImages(folderPath),
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
});
```

---

## 📋 実装ロードマップ

### Phase 1: 基盤整備（1-2週間）
- [ ] Zustandのインストールと設定
- [ ] `appStore`の作成（フォルダ・画像インデックス管理）
- [ ] `App.tsx`の移行
- [ ] Redux DevToolsの統合

### Phase 2: 機能別ストア（2-3週間）
- [ ] `viewerStore`の作成（閲覧設定）
- [ ] `ImageViewer`の移行
- [ ] 永続化ミドルウェアの実装
- [ ] Tauri Plugin Storeとの統合

### Phase 3: 高度な機能（3-4週間）
- [ ] 履歴機能の実装
- [ ] お気に入り管理
- [ ] 最近開いたフォルダ
- [ ] undo/redo機能

### Phase 4: 最適化（1-2週間）
- [ ] セレクタの最適化
- [ ] 不要な再レンダリングの削除
- [ ] パフォーマンス測定と改善
- [ ] ドキュメント整備

---

## 🎯 推奨アクション

### 短期（今すぐ実施可能）
1. **Context最適化**: ThemeProviderを読み取り/書き込みで分割
2. **useMemoの追加**: 高頻度で計算される値をメモ化
3. **永続化の検討**: Tauri Plugin Storeの調査・PoC

### 中期（1-2ヶ月）
1. **Zustand導入**: 段階的にグローバル状態を移行
2. **DevToolsの活用**: 状態の可視化とデバッグ効率化
3. **ドキュメント化**: 状態管理のベストプラクティスを文書化

### 長期（3-6ヶ月）
1. **完全なZustand移行**: すべてのグローバル状態を統合
2. **高度な機能**: 履歴・お気に入り・タグ管理
3. **マルチウィンドウ対応**: 状態の共有戦略

---

## 📚 参考資料

### 学習リソース
- [Zustand公式ドキュメント](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React 19 - useTransition](https://react.dev/reference/react/useTransition)
- [SWR ドキュメント](https://swr.vercel.app/ja)

### ベストプラクティス
- [Redux Style Guide](https://redux.js.org/style-guide/) - 状態管理の原則
- [React Performance](https://react.dev/learn/render-and-commit) - 再レンダリング最適化

### 技術選定の比較
| 技術 | 学習コスト | バンドルサイズ | 機能性 | React 19対応 |
|------|----------|-------------|--------|-------------|
| Zustand | 低 | 1KB | 中 | ✅ |
| Redux Toolkit | 中 | 10KB | 高 | ✅ |
| Jotai | 低 | 3KB | 中 | ✅ |
| Context API | 最低 | 0KB | 低 | ✅ |
| TanStack Query | 中 | 12KB | データフェッチ特化 | ✅ |

---

## 💡 結論

**現状の評価**: 
- 現在の設計は小〜中規模アプリとして適切
- Feature-basedアーキテクチャは維持すべき
- React 19の最新機能を活用済み

**推奨方針**:
1. **まずZustandを小規模導入** - appStateの移行から開始
2. **段階的移行** - 既存機能を壊さず1つずつ移行
3. **永続化を優先** - ユーザー体験向上の即効性が高い
4. **DevToolsで可視化** - 開発効率の大幅向上

**避けるべきこと**:
- ❌ 全面的な書き換え（リスクが高い）
- ❌ 過度に複雑な状態管理（オーバーエンジニアリング）
- ❌ Contextの乱立（パフォーマンス低下）

この分析を基に、プロジェクトの成長に合わせて適切なタイミングで状態管理をスケールさせることができます。
