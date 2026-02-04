# GitHub機能を使った中期的な計画管理ガイド

このドキュメントでは、sun-riseup-viewrrr プロジェクトにおいて、アプリケーション全体やテスト部分など広範囲にわたる改善案や中期的な計画を管理するための GitHub 機能について説明します。

## 目次

1. [GitHub Issues: アイデアと改善案の記録](#github-issues-アイデアと改善案の記録)
2. [GitHub Projects: 視覚的なタスク管理](#github-projects-視覚的なタスク管理)
3. [GitHub Milestones: バージョン管理と期限設定](#github-milestones-バージョン管理と期限設定)
4. [GitHub Discussions: 議論と意思決定](#github-discussions-議論と意思決定)
5. [推奨ワークフロー](#推奨ワークフロー)

---

## GitHub Issues: アイデアと改善案の記録

### 概要

**GitHub Issues** は個別のタスク、バグ、機能リクエスト、アイデアを記録・追跡するための基本的なツールです。

### 使い方

#### 既存のIssueテンプレート

このリポジトリには以下の3種類のIssueテンプレートが用意されています：

1. **Bug Report** (`bug-report.yml`): バグの報告
2. **Feature Request** (`feature-request.yml`): 新機能のリクエスト
3. **Idea** (`idea.yml`): 実装は未定だが記録しておきたいアイデア

#### 広範囲な改善案の記録方法

**広範囲にわたる改善案**（例：テストアーキテクチャの見直し、状態管理の再設計など）には、以下のようにIssueを活用できます：

```markdown
タイトル: [Architecture] テスト戦略の全体的な見直し

## 概要
現在のテスト構成を見直し、より保守しやすいテスト基盤を構築する

## 背景
- テストの実行時間が長い
- テストの可読性が低い
- モックの管理が複雑

## 提案内容
### Phase 1: 現状分析
- [ ] 既存テストの棚卸し
- [ ] ボトルネックの特定

### Phase 2: 改善実装
- [ ] テストユーティリティの共通化
- [ ] モック管理の改善

### Phase 3: ドキュメント整備
- [ ] テスト作成ガイドの作成
- [ ] ベストプラクティスの文書化

## 関連Issue
- #10: パフォーマンス問題
- #11: リファクタリング案
```

#### Issueのラベル活用

適切なラベルを使用して分類・検索を容易にします：

- `enhancement`: 機能改善
- `refactor`: リファクタリング
- `architecture`: アーキテクチャに関する議論
- `testing`: テストに関する改善
- `documentation`: ドキュメント関連
- `performance`: パフォーマンス改善
- `priority:high/medium/low`: 優先度

**カスタムラベルの追加方法**:
1. リポジトリの「Issues」タブ → 「Labels」
2. 「New label」をクリック
3. 名前、説明、色を設定

---

## GitHub Projects: 視覚的なタスク管理

### 概要

**GitHub Projects** は、複数のIssueを視覚的に管理できるカンバンボード形式のプロジェクト管理ツールです。中期的な計画の進捗を一目で把握できます。

### 推奨される使用方法

#### プロジェクトの作成

1. リポジトリページの「Projects」タブをクリック
2. 「New project」をクリック
3. テンプレートを選択（例：「Board」、「Table」、「Roadmap」）

#### プロジェクトの構成例

##### 例1: 機能別プロジェクト

**プロジェクト名**: "v2.0 機能開発"

**カラム構成**:
- **Backlog**: 着手前のアイデア
- **In Progress**: 作業中
- **Review**: レビュー待ち
- **Done**: 完了

**活用方法**:
- 各Issueをカードとしてボードに追加
- ドラッグ&ドロップで進捗を管理
- カラムごとに自動化ルールを設定（例：PRがマージされたら自動的に「Done」に移動）

##### 例2: 四半期計画プロジェクト

**プロジェクト名**: "2026 Q1 Roadmap"

**ビュー構成**:
- **Board View**: カンバンボード形式
- **Table View**: 詳細情報を含む一覧
- **Roadmap View**: タイムライン形式（ガントチャート風）

**カスタムフィールド**:
- 優先度（Priority）: High / Medium / Low
- カテゴリ（Category）: UI / Backend / Testing / Documentation
- 推定工数（Estimate）: 1日 / 3日 / 1週間 / 2週間以上
- 四半期（Quarter）: Q1 / Q2 / Q3 / Q4

#### 既存Issueの活用例

このリポジトリの既存Issue（#11, #10, #6など）を使って以下のようなプロジェクトを作成できます：

**プロジェクト名**: "アーキテクチャ改善計画"

| Issue | カテゴリ | 優先度 | ステータス |
|-------|---------|--------|-----------|
| #11: AppMenuBarEvent管理のリファクタリング | Architecture | Low | Backlog |
| #10: 仮想スクロール実装 | Performance | Medium | In Progress |
| #6: カレントディレクトリの再設計 | Architecture | Medium | Backlog |

---

## GitHub Milestones: バージョン管理と期限設定

### 概要

**GitHub Milestones** は、特定のバージョンやリリースに向けた複数のIssueをグループ化し、進捗を追跡するための機能です。

### 使い方

#### マイルストーンの作成

1. リポジトリの「Issues」タブ → 「Milestones」
2. 「New milestone」をクリック
3. タイトル、説明、期限を設定

#### マイルストーンの構成例

##### 例1: バージョンリリース

**マイルストーン名**: "v1.1.0 Release"
**期限**: 2026年3月31日
**説明**:
```
パフォーマンス改善とUI/UX向上を含むマイナーリリース

主要な変更:
- 仮想スクロールの導入（#10）
- サムネイル表示の最適化
- ダークモードの改善
```

**含まれるIssue**:
- #10: 仮想スクロール実装
- #XX: サムネイル最適化
- #XX: テーマ切り替え改善

##### 例2: テーマ別マイルストーン

**マイルストーン名**: "Testing Infrastructure Improvement"
**期限**: なし（継続的改善）
**説明**:
```
テスト基盤の全面的な改善

目標:
- テスト実行時間を50%削減
- テストカバレッジを80%以上に向上
- テスト作成のガイドライン整備
```

#### 進捗の可視化

マイルストーンページでは以下が自動的に表示されます：
- 完了したIssueの割合（プログレスバー）
- 未完了/完了したIssueの数
- クローズしたPRの数

---

## GitHub Discussions: 議論と意思決定

### 概要

**GitHub Discussions** は、Issueよりもカジュアルに議論や質問、アイデアの共有ができるフォーラム機能です。

### 有効化方法

1. リポジトリの「Settings」タブ
2. 「Features」セクションの「Discussions」にチェック
3. 保存

### 使用例

#### ディスカッションカテゴリの設定

- **General**: 一般的な議論
- **Ideas**: アイデアの提案と投票
- **Q&A**: 質問と回答
- **Show and tell**: 実装した機能のデモ
- **Architecture Decisions**: アーキテクチャに関する意思決定

#### 活用シーン

##### シーン1: アーキテクチャの方向性議論

```markdown
タイトル: [Discussion] 状態管理ライブラリの選定

現在はuseStateとSWRで管理していますが、複雑化してきたため
ZustandやJotaiの導入を検討しています。

皆さんの意見を聞かせてください：
- Zustand: シンプルで軽量
- Jotai: Atom-based, React 19と相性良好
- そのまま: 現状維持

投票機能を使って意見を集約しましょう 👍👎
```

##### シーン2: 実装前の設計レビュー

```markdown
タイトル: [RFC] 仮想スクロールの実装設計

Issue #10で提案された仮想スクロールの実装について、
詳細設計をレビューしてほしいです。

## 実装案
[コードスニペット]

## 懸念点
- パフォーマンスへの影響
- 既存コードとの統合

フィードバックをお願いします！
```

---

## 推奨ワークフロー

以下は、このプロジェクトで中期的な計画を管理する推奨ワークフローです。

### ステップ1: アイデアの記録

1. **小規模な改善**: Issueテンプレート「Idea」を使用
2. **広範囲な改善**: 詳細なIssueを作成（チェックリスト形式）
3. **議論が必要**: GitHub Discussionsで提案

### ステップ2: 優先順位付けと分類

1. 適切なラベルを付与（`enhancement`, `architecture`, `testing`など）
2. 優先度ラベルを追加（`priority:high/medium/low`）
3. 関連するIssueをリンク

### ステップ3: プロジェクトボードで管理

1. 四半期ごとのプロジェクトを作成
2. IssueをBacklogカラムに追加
3. 着手時にIn Progressに移動
4. 完了時にDoneに移動

### ステップ4: マイルストーンでグルーピング

1. バージョンリリースごとにマイルストーンを作成
2. 関連するIssueをマイルストーンに割り当て
3. 期限を設定して進捗を追跡

### ステップ5: 定期的なレビュー

- **週次**: プロジェクトボードを更新
- **月次**: マイルストーンの進捗確認
- **四半期**: 次の四半期の計画策定

---

## 実践例: 既存Issueの整理

### ステップ1: マイルストーンの作成

```
マイルストーン: "v1.1.0 - Performance & Architecture"
期限: 2026年3月31日

含まれるIssue:
- #10: 仮想スクロール実装（High）
- #11: AppMenuBarEventリファクタリング（Low）
```

### ステップ2: プロジェクトボードの作成

```
プロジェクト: "Q1 2026 Roadmap"

Backlog:
- #6: カレントディレクトリ再設計
- #11: Command Registryパターン

In Progress:
- #10: 仮想スクロール実装

Done:
- （完了したタスク）
```

### ステップ3: ラベルの整理

```
#10: [performance, ui, priority:high]
#11: [architecture, refactor, priority:low]
#6: [architecture, enhancement, priority:medium]
```

---

## まとめ

### 各機能の使い分け

| 機能 | 用途 | 推奨される使用シーン |
|------|------|---------------------|
| **Issues** | 個別タスクの記録 | バグ、機能リクエスト、アイデアの記録 |
| **Projects** | 視覚的な進捗管理 | 複数タスクの進捗を一覧で確認 |
| **Milestones** | バージョン管理 | リリース計画、期限付きタスクのグループ化 |
| **Discussions** | 議論と意思決定 | アーキテクチャ決定、設計レビュー |

### 中期計画に最適な組み合わせ

**広範囲な改善計画（例：テストアーキテクチャの見直し）** の場合：

1. **Discussion**: 初期の議論と方向性の決定
2. **Issue**: 具体的なタスクに分割（チェックリスト形式）
3. **Project**: 全体の進捗を視覚的に管理
4. **Milestone**: 完了目標とスケジュールを設定

### 次のステップ

1. リポジトリの設定でDiscussionsを有効化（任意）
2. 必要なカスタムラベルを追加
3. 四半期プロジェクトを作成
4. 既存Issueをプロジェクトとマイルストーンに整理

---

## 参考リンク

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub Milestones Documentation](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)
- [GitHub Discussions Documentation](https://docs.github.com/en/discussions)
