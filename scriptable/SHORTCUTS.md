# Scriptable × ショートカット：お便り分割

Safari版と違い、**共有シートからPDFを渡して分割まで自動化**できます。

## iPhone への入れ方（推奨：GitHub Releases）

ビルド済みファイルを Release から直接ダウンロードできます。

1. App Store で **Scriptable** をインストール
2. iPhone の Safari で次を開く（常に最新）:
   - **https://github.com/9bo9bo/otayori-split/releases/latest**
3. **otayori-split-scriptable.zip** をタップ → ダウンロード
4. **Files** アプリで zip を解凍
5. 次の2ファイルを **このiPhone内 → Scriptable** へ移動
   - `お便り分割.js`（または `OtayoriSplit.js` を `お便り分割.js` にリネーム）
   - `otayori-split-engine.html`（必須・分割エンジン）
6. Scriptable を開き、「お便り分割」が出ることを確認

### 個別ファイルの直リンク

| ファイル | URL |
|---------|-----|
| zip一式 | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-scriptable.zip |
| エンジン | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-engine.html |
| スクリプト | https://github.com/9bo9bo/otayori-split/releases/latest/download/OtayoriSplit.js |

> Release は GitHub Actions がタグ `v*` 推時（または手動実行時）に自動作成します。

## 開発者向け：ローカルビルド

```bash
npm run build:scriptable
```

生成物は `scriptable/` です。

## ショートカット手順（推奨）

新規ショートカットを作成し、入力を **ファイル**（PDF）にします。

| # | アクション | 設定 |
|---|-----------|------|
| 1 | **ファイルブックマークを作成**（Scriptable） | ブックマーク名: `OtayoriSplitInput` / ファイル: ショートカットの入力 |
| 2 | **スクリプトを実行**（Scriptable） | スクリプト: `お便り分割` / **Appで実行: オン** |
| 3 | **ファイルを保存** または **共有シートを表示** | 入力: スクリプトの結果 |

名前例: `お便りをA4分割`

### 使い方

1. メールやFilesのお便りPDFを開く
2. 共有 → **お便りをA4分割**
3. 分割PDFが返り、保存・印刷・AirDrop へ進める

印刷時は **実際のサイズ / 100%** を選んでください。

## Scriptableアプリ単体でも可

Scriptable で「お便り分割」を実行 → ファイル選択 → 分割 → 共有 / クイックルック。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| エンジンがない | `otayori-split-engine.html` を Scriptable 書類フォルダへコピー |
| 入力PDFがない | ショートカットに「ファイルブックマークを作成」（名前は正確に `OtayoriSplitInput`）があるか確認 |
| メモリ不足で落ちる | 「スクリプトを実行」の **Appで実行** をオン |
| ブックマークが効かない | Scriptable設定内のブックマークではなく、**Shortcutsの Scriptable アクション**で作成する |
| スクリプト名が英語 | Release の `OtayoriSplit.js` を `お便り分割.js` にリネームして Scriptable フォルダへ |

## Safari版との違い

| | Safari / PWA | Scriptable + Shortcuts |
|--|--------------|------------------------|
| 追加アプリ | 不要 | Scriptable が必要 |
| 共有シートからPDFを直接渡す | 不可（起動後に再選択） | **可能** |
| オフライン | ホーム画面追加後は可 | エンジンHTMLを入れれば可 |
| 向いている人 | 手軽さ優先 | 自動化・印刷まで一気にやりたい |
