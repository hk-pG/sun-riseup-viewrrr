# CD環境・自動アップデートのセットアップ手順

このドキュメントでは、Tauri v2 ベースのCD（継続的デリバリー）環境と自動アップデート機能のセットアップ手順を説明します。

## 概要

| 項目 | 内容 |
|---|---|
| CIツール | GitHub Actions |
| リリース先 | GitHub Releases（ドラフト → 手動公開） |
| 対象プラットフォーム | macOS (Apple Silicon / Intel)、Windows、Linux |
| アップデート署名 | Tauri Signer（必須） |

---

## 1. 署名キーの生成（初回のみ）

### 1-1. Tauri CLI でキーペアを生成

```bash
pnpm tauri signer generate -w ~/.tauri/sun-riseup-viewrrr.key
```

実行すると、以下の2つのファイルが生成されます：
- `~/.tauri/sun-riseup-viewrrr.key` — **秘密鍵**（絶対に公開しないこと）
- `~/.tauri/sun-riseup-viewrrr.key.pub` — **公開鍵**

### 1-2. 公開鍵を `tauri.conf.json` に設定

生成された公開鍵の内容を確認し、`src-tauri/tauri.conf.json` の `plugins.updater.pubkey` に貼り付けます：

```bash
cat ~/.tauri/sun-riseup-viewrrr.key.pub
```

```json
{
  "plugins": {
    "updater": {
      "pubkey": "ここに公開鍵の内容を貼り付ける",
      ...
    }
  }
}
```

---

## 2. GitHub Secrets の設定

リポジトリの **Settings → Secrets and variables → Actions** で以下のシークレットを追加します：

### 必須

| シークレット名 | 内容 |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | `~/.tauri/sun-riseup-viewrrr.key` の内容 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | キー生成時に設定したパスワード。**パスワードなしで生成した場合はこのシークレットを作成する必要はありません。** |

### 任意（macOS コード署名 / Apple Developer Program 加入時のみ）

| シークレット名 | 内容 |
|---|---|
| `APPLE_CERTIFICATE` | Developer ID Application 証明書（base64エンコード） |
| `APPLE_CERTIFICATE_PASSWORD` | 証明書のパスワード |
| `APPLE_SIGNING_IDENTITY` | 署名ID（例: `Developer ID Application: Your Name (TEAMID)`） |
| `APPLE_ID` | Apple ID（メールアドレス） |
| `APPLE_PASSWORD` | App-specific パスワード |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

---

## 3. リリースの実行

### バージョンタグをプッシュ

```bash
# package.json と tauri.conf.json のバージョンを更新してからコミット
git add src-tauri/tauri.conf.json package.json
git commit -m "chore: バージョンを v0.2.0 に更新"

# タグをプッシュ（v*.*.* 形式のタグで CD ワークフローがトリガーされる）
git tag v0.2.0
git push origin v0.2.0
```

### ワークフローの動作

1. `v*.*.*` 形式のタグが push されると `release.yml` が起動
2. macOS (arm64 / x86_64)、Windows、Linux の各プラットフォームで並列ビルド
3. 各プラットフォームのインストーラーと署名済みアップデートマニフェスト（`latest.json`）を GitHub Releases にアップロード
4. **ドラフト状態で作成されるため、内容を確認してから手動で公開する**

---

## 4. 自動アップデートの仕組み

アプリ起動後 3 秒後に GitHub Releases の `latest.json` を確認します：

```
https://github.com/hk-pG/sun-riseup-viewrrr/releases/latest/download/latest.json
```

新バージョンが見つかった場合、ユーザーにダイアログで確認を求め、同意があればダウンロード・インストールを実行します。インストール後は手動でアプリを再起動する必要があります。

> **注意**: 開発環境（`pnpm tauri dev`）では自動アップデートチェックは実行されません。

---

## 5. トラブルシューティング

### ビルドエラー: `TAURI_SIGNING_PRIVATE_KEY` が未設定

GitHub Secrets に `TAURI_SIGNING_PRIVATE_KEY` が設定されていない場合、リリースビルドが失敗します。
上記 **手順 2** に従いシークレットを設定してください。

### アップデートが検出されない

- `tauri.conf.json` の `plugins.updater.pubkey` が正しく設定されているか確認
- GitHub Releases に `latest.json` がアップロードされているか確認（リリースを公開状態にする必要あり）
- バージョン番号が `0.1.0` のような semver 形式になっているか確認

### macOS で「開発元を確認できません」のエラー

Apple Developer Program に加入し、コード署名を設定してください（上記 **手順 2** の任意シークレット参照）。
または、システム環境設定 → プライバシーとセキュリティ から手動で許可することも可能です。
