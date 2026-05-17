#!/bin/bash
# Phase 4手動テスト用のテストデータ作成スクリプト
# 100フォルダを作成し、それぞれに画像ファイルをコピー

set -e

TEST_DIR="/home/hk-p/repo/sun-riseup-viewrrr/tests/fixtures/images-large"
SOURCE_IMAGE="/home/hk-p/repo/sun-riseup-viewrrr/tests/fixtures/images/folder_1/1-1.png"

# ソース画像の確認
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: ソース画像が見つかりません: $SOURCE_IMAGE"
    echo "tests/fixtures/images/folder_1/に画像を配置してください"
    exit 1
fi

# テストディレクトリの作成
mkdir -p "$TEST_DIR"

echo "100フォルダのテストデータを作成中..."
for i in $(seq 1 100); do
    FOLDER="$TEST_DIR/test_folder_$(printf "%03d" $i)"
    mkdir -p "$FOLDER"
    
    # 各フォルダに3枚の画像をコピー
    for j in 1 2 3; do
        cp "$SOURCE_IMAGE" "$FOLDER/image_${j}.png"
    done
    
    if [ $((i % 10)) -eq 0 ]; then
        echo "作成完了: ${i}/100 フォルダ"
    fi
done

echo "✓ 完了: 100フォルダ（各3画像）を作成しました"
echo "テストディレクトリ: $TEST_DIR"
echo ""
echo "手動テスト手順:"
echo "1. アプリケーションで「フォルダを開く」をクリック"
echo "2. $TEST_DIR を選択"
echo "3. 可視領域（上位10フォルダ）のサムネイル表示時間を計測"
echo "4. スクロールして全体のサムネイル生成を確認"
echo "5. フォルダを閉じて再度開き、キャッシュ再利用を確認"
