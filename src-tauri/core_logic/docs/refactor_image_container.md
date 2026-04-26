# image_containerのリファクタリング

| # | 懸念 | 具体的な問題 | 対処タイミング |
|:---|:---|:---|:---|
| 1 | **`CommandError` の二重定義** | error.rs と image_container.rs に別々の `CommandError` が存在。Serviceの返り値型が定まらない | **Service実装前（前提）** |
| 2 | **`ArchiveImageContainerConfig` との役割重複** | `ImageContainerConfig { extract_dir }` を新設すると、既存の `ArchiveImageContainerConfig` と設定の二重管理になる。内包するか廃止するか未決定 | **`ImageContainerConfig` 設計時** |
| 3 | **拡張子設定の散在** | アーカイブ対応拡張子 `["zip"]` は `ArchiveImageContainerConfig` に、画像拡張子は folder.rs の定数に散在。Config 集約の恩恵を得るなら一元化の方針を決める必要がある | **`ImageContainerConfig` 設計時** |
| 4 | **旧 `list_images_in_container` 関数の共存** | Service 導入後も image_container.rs の旧関数が残ると「Service 経由」と「直接呼び出し」の2経路が混在する | **Service 動作確認後に削除** |
| 5 | **`get_sibling_containers` の責務帰属** | この関数は「コンテナ操作」でなく「ナビゲーション」。`ImageContainerService` に入れると責務過多になるが、設計ドキュメントに位置付けの言及がない | **Trait / Service 設計時** |
| 6 | **`ImageContainer` Trait の粒度指針** | `list_images` + `get_thumbnail` を同一 Trait に定義すると、メソッドが増えた際に Interface Segregation が崩れる。粒度の指針を決めておかないと Trait が肥大化する | **Trait 設計時** |
| 7 | **`spawn_blocking` と `State` の組み合わせ** | `tokio::task::spawn_blocking` のクロージャは `State<T>` を直接ムーブできない。`Arc::clone` またはフィールドの個別クローンが必要で、実装パターンを決めていないと各コマンドで実装がばらつく | **Tauriコマンド実装時** |
| 8 | **アーカイブキャッシュとFactory設計の衝突** | 「Factoryが毎回新インスタンスを返す」設計は、将来「解凍済みコンテナのキャッシュ」要求が出た場合に Service の責務変更を強いる | **将来（スケーリング時）** |

---

## フェーズ1: 設計決定（コード着手前）

**#1 → #5 → #6 の順で決定する**

| 順 | 懸念# | やること | 理由 |
|:---|:---|:---|:---|
| 1-1 | **#1** | `CommandError` を `image_container.rs` の拡張バリアント版に統一し error.rs を削除 | 全フェーズの型基盤。未解決だと以降の全コードの返り値型が定まらない |
| 1-2 | **#5** | `get_sibling_containers` を `ImageContainerService` 外の独立関数として位置付けを明文化 | Serviceの境界が確定しないとTrait設計に入れない |
| 1-3 | **#6** | `ImageContainer` Traitを `ListImages` / `GetThumbnail` のように操作単位で分割するか単一Traitにするか方針決定 | Trait設計が確定しないとConfig/Service設計に入れない |

---

## フェーズ2: Config / Service 設計

**#2 → #3 → #7 の順で決定する**

| 順 | 懸念# | やること | 理由 |
|:---|:---|:---|:---|
| 2-1 | **#2** | `ImageContainerConfig` が `ArchiveImageContainerConfig` を内包するか置き換えるか決定 | Configの形が決まらないとServiceの `new()` シグネチャが書けない |
| 2-2 | **#3** | 拡張子設定をConfigに含めるか各モジュールに残すか決定 | #2と同じConfigの設計作業。同時に決めると効率的 |
| 2-3 | **#7** | `spawn_blocking` + `State<ImageContainerService>` の実装パターン（`Arc::clone` vs フィールドクローン）をサンプルコードで確定 | Tauriコマンド実装前に共通パターンを確立しないと各コマンドで実装がばらつく |

---

## フェーズ3: 実装

```
Trait定義
  → Config / Service実装
    → FolderContainer / ArchiveContainer（具象クラス）実装
      → Tauriコマンド層の書き換え（#7のパターン適用）
```

---

## フェーズ4: 後処理

| 順 | 懸念# | やること |
|:---|:---|:---|
| 4-1 | **#4** | Service経由で全テストがグリーンになったことを確認後、旧 `list_images_in_container` を削除 |

---

## フェーズ5: 将来対応（今は着手しない）

| 懸念# | 内容 |
|:---|:---|
| **#8** | アーカイブキャッシュ要求が実際に発生した時点でServiceへのキャッシュ層追加を検討 |