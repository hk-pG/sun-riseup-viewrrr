# ImageViewerライブラリ分離 - 実現可能性分析

## 🔍 現状の依存関係分析

### ImageViewer → 外部依存

#### 1. **データフェッチング層への依存（重要）**
```typescript
// ImageViewer.tsx
import { useImages } from '@/shared/hooks/data/useImages';

// useImages.ts内部
import { LocalFolderContainer } from '../../../features/folder-navigation';
import { useServices } from '../../context/ServiceContext';
```
**問題点**:
- ImageViewerが直接`useImages`フックに依存
- `useImages`が`folder-navigation`と`ServiceContext`に依存
- Tauriのファイルシステムに密結合

#### 2. **UIコンポーネントへの依存**
```typescript
// ViewerControls.tsx
import { Button } from '@/shared/components/ui/button';
```
**問題点**:
- shadcn/uiのButtonコンポーネントに依存
- ライブラリとして配布する際、UIライブラリも含める必要がある

#### 3. **型定義の越境依存**
```typescript
// viewerTypes.ts
import type { ImageFile } from '../../folder-navigation/types/folderTypes';
```
**問題点**:
- `folder-navigation`の型定義に依存
- ライブラリとして分離すると型が使えなくなる

### App → ImageViewer依存

```typescript
// App.tsx
import { ImageViewer } from './features/image-viewer';

<ImageViewer 
  folderPath={appState.currentFolderPath}
  initialIndex={appState.initialImageIndex}
/>
```
**良好な点**:
- Propsベースのインターフェース
- 単方向のデータフロー
- コールバックで状態を外部管理可能

---

## ✅ 分離可能性の評価

### 結論: **実現可能だが、重要なリファクタリングが必要**

現在の実装は70%程度ライブラリ化可能な設計ですが、以下の課題があります：

#### 🟢 分離しやすい部分（70%）
1. **コアUIコンポーネント**
   - ImageDisplay.tsx
   - ViewerControls.tsx
   - ImageViewer.tsx（条件付き）

2. **内部ロジック**
   - useControlsVisibility
   - useKeyboardHandler
   
3. **型定義**
   - ImageSource
   - ViewerSettings
   - KeyboardMapping

#### 🟡 修正が必要な部分（25%）
1. **データ層の抽象化**
   - `useImages`の依存を除去
   - データ取得を外部化（Props経由）

2. **UIコンポーネントの依存解決**
   - ButtonをPeer Dependencyにするか独自実装

3. **型定義の重複解消**
   - ImageFileを独自定義するか、共通パッケージへ

#### 🔴 設計変更が必要な部分（5%）
1. **データフェッチングの責務**
   - 現在: ImageViewer内でfolderPathからデータ取得
   - 理想: 親コンポーネントから配列を受け取る

---

## 🚀 分離戦略

### 戦略1: **完全分離（推奨）**

#### Step 1: データ取得の外部化
```typescript
// ❌ 現在（データ取得が内部）
export interface ImageViewerProps {
  folderPath: string;  // フォルダパスを受け取る
  initialIndex?: number;
}

// ✅ 理想（データは外部から）
export interface ImageViewerProps {
  images: ImageSource[];  // 画像配列を受け取る
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}
```

**メリット**:
- データ取得方法に依存しない（Tauri/Web/任意のAPI）
- 真の再利用性
- テストが容易

**変更箇所**:
```typescript
// Before: ImageViewer内部でデータ取得
const { images, isLoading, error } = useImages(folderPath);

// After: 親から受け取る
export function ImageViewer({ images, currentIndex, onIndexChange }: Props) {
  // データ取得ロジックは削除
}
```

#### Step 2: 型定義の独立化
```typescript
// packages/image-viewer/src/types/index.ts
export interface ImageSource {
  path: string;
  name: string;
  url?: string;      // データURL or ファイルURL
  size?: number;
  lastModified?: Date;
}

// ImageFileと互換性のある型
```

#### Step 3: UIコンポーネントの対処

**オプションA**: shadcn/uiをPeer Dependency
```json
{
  "peerDependencies": {
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0"
  }
}
```

**オプションB**: 独自の軽量Button実装
```typescript
// packages/image-viewer/src/components/internal/Button.tsx
export const Button = ({ children, onClick, ...props }) => (
  <button 
    className="image-viewer-button" 
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);
```

**オプションC**: Render Propsパターン
```typescript
interface ViewerControlsProps {
  renderButton?: (props: ButtonProps) => React.ReactNode;
}
```

#### Step 4: パッケージ構成
```
packages/
├── image-viewer/           # 独立ライブラリ
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageViewer.tsx
│   │   │   ├── ImageDisplay.tsx
│   │   │   └── ViewerControls.tsx
│   │   ├── hooks/
│   │   │   ├── useControlsVisibility.ts
│   │   │   └── useKeyboardHandler.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   └── README.md
│
└── sun-riseup-viewrrr/     # アプリケーション
    ├── src/
    │   ├── App.tsx
    │   ├── features/
    │   │   └── folder-navigation/
    │   └── shared/
    └── package.json         # image-viewerを依存に追加
```

---

## 📋 移行ロードマップ

### Phase 1: インターフェース設計（1週間）
- [ ] ImageViewerの理想的なProps APIを設計
- [ ] 型定義の独立化
- [ ] データフェッチング分離の設計

### Phase 2: App側のリファクタリング（1-2週間）
```typescript
// App.tsx - データ取得を親側で実施
function App() {
  const [folderPath, setFolderPath] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // データ取得はApp側の責務
  const { images, isLoading, error } = useImages(folderPath);
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return (
    <ImageViewer
      images={images}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      settings={viewerSettings}
    />
  );
}
```

### Phase 3: ImageViewerの独立化（2週間）
- [ ] `useImages`依存を削除
- [ ] Props経由でimages配列を受け取る
- [ ] ローディング/エラー表示を親に委譲
- [ ] 型定義を独自パッケージに移動

### Phase 4: パッケージ分離（1週間）
- [ ] モノレポ構成（pnpm workspace）
- [ ] package.jsonの設定
- [ ] ビルド設定（tsup/Viteなど）
- [ ] READMEとドキュメント

### Phase 5: 公開準備（1週間）
- [ ] Storybookの整備
- [ ] npmパッケージとして公開
- [ ] デモサイトの構築

---

## 🎯 具体的な実装例

### 修正前（現在）
```typescript
// ImageViewer.tsx
export function ImageViewer({ folderPath, initialIndex }: ImageViewerProps) {
  const { images, isLoading, error } = useImages(folderPath); // ❌ 内部でデータ取得
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // ...
}

// App.tsx
<ImageViewer 
  folderPath="/path/to/folder"  // ❌ フォルダパスを渡す
  initialIndex={0}
/>
```

### 修正後（ライブラリ化対応）
```typescript
// packages/image-viewer/src/ImageViewer.tsx
export interface ImageViewerProps {
  images: ImageSource[];              // ✅ データは外部から
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  settings?: Partial<ViewerSettings>;
  keyboardMapping?: KeyboardMapping;
  loading?: boolean;                  // ✅ ローディング状態も外部から
  error?: Error;
  onError?: (error: Error) => void;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
}

export function ImageViewer({
  images,
  currentIndex = 0,
  onIndexChange,
  settings,
  loading,
  error,
  renderLoading,
  renderError,
}: ImageViewerProps) {
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  
  const handleIndexChange = (newIndex: number) => {
    setInternalIndex(newIndex);
    onIndexChange?.(newIndex);
  };
  
  if (loading && renderLoading) return renderLoading();
  if (error && renderError) return renderError(error);
  if (images.length === 0) return <EmptyState />;
  
  return (
    <div className="image-viewer">
      <ImageDisplay image={images[internalIndex]} settings={settings} />
      <ViewerControls 
        currentIndex={internalIndex}
        totalImages={images.length}
        onNext={() => handleIndexChange(internalIndex + 1)}
        onPrevious={() => handleIndexChange(internalIndex - 1)}
      />
    </div>
  );
}

// sun-riseup-viewrrr/src/App.tsx
function App() {
  const [folderPath, setFolderPath] = useState('');
  const { images, isLoading, error } = useImages(folderPath); // ✅ App側で取得
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <ImageViewer
      images={images || []}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      loading={isLoading}
      error={error}
      renderLoading={() => <div>読み込み中...</div>}
      renderError={(err) => <div>エラー: {err.message}</div>}
    />
  );
}
```

---

## 💡 推奨事項

### 短期（今すぐ実施）
1. **データ取得の外部化を検証**
   - App.tsxで`useImages`を呼び出し
   - ImageViewerにimages配列を渡す実験

2. **型定義の整理**
   - ImageFileとImageSourceの関係を明確化
   - 共通型を`src/shared/types`に移動

### 中期（1-2ヶ月）
1. **完全なデータ分離**
   - ImageViewerからuseImagesを削除
   - Props APIの安定化

2. **モノレポ構成**
   - pnpm workspaceで`packages/image-viewer`を作成
   - 段階的に移行

### 長期（3-6ヶ月）
1. **npm公開**
   - @your-org/image-viewerとして公開
   - 他プロジェクトでも利用可能に

2. **エコシステム構築**
   - データアダプタパターン（Tauri/Web/S3など）
   - プラグインシステム

---

## ⚠️ 注意点

### やってはいけないこと
- ❌ ImageViewer内でTauriのAPIを直接呼び出す
- ❌ アプリ固有のビジネスロジックを含める
- ❌ グローバル状態管理（Zustand/Context）に依存する

### やるべきこと
- ✅ 純粋なコンポーネント（Pure Component）として設計
- ✅ 必要なデータはすべてPropsで受け取る
- ✅ 状態変更はコールバックで親に通知
- ✅ スタイルは外部からカスタマイズ可能に

---

## 📊 分離難易度マトリクス

| 要素 | 現状 | 難易度 | 工数 | 優先度 |
|------|------|--------|------|--------|
| ImageDisplay | 独立 | 低 | 0.5日 | 高 |
| ViewerControls | Button依存 | 中 | 1日 | 高 |
| ImageViewer | useImages依存 | 高 | 3日 | 最高 |
| useControlsVisibility | 独立 | 低 | 0日 | 中 |
| useKeyboardHandler | 独立 | 低 | 0日 | 中 |
| 型定義 | 越境依存 | 中 | 1日 | 高 |
| パッケージ化 | 未実施 | 中 | 2日 | 中 |

**合計工数**: 約7-10日

---

## 🎉 結論

**実現可能性**: ⭐⭐⭐⭐☆ (4/5)

現在の実装は比較的良好な設計で、ライブラリ化は十分可能です。
最大の課題は**データフェッチングの分離**ですが、これは設計上の問題であり技術的な障壁はありません。

**推奨アプローチ**:
1. まずApp側でuseImagesを呼び出す形に変更（1-2日）
2. ImageViewerをimages配列を受け取る形に変更（2-3日）
3. 型定義を整理・独立化（1日）
4. モノレポ構成でパッケージ分離（2日）

この順序で進めれば、**1-2週間で基本的な分離が完了**し、既存機能を壊さずに段階的に移行できます。

---

## 🔗 関連ドキュメント

- [状態管理分析](./state-management-analysis.md) - グローバル状態管理の今後の方針
- [Feature-based Architecture](../README.md) - 現在のプロジェクト構造
