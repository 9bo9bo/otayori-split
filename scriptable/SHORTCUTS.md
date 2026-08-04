# お便り分割：セットアップ詳細

## iPhone への入れ方（GitHub Releases）

1. App Store で **Scriptable** をインストール
2. Safari で **https://github.com/9bo9bo/otayori-split/releases/latest** を開く
3. **otayori-split-scriptable.zip** をダウンロード
4. **Files** で解凍
5. 次の2ファイルを **このiPhone内 → Scriptable** へ移動
   - `お便り分割.js`（zip内。個別DLの `OtayoriSplit.js` はリネーム）
   - `otayori-split-engine.html`（必須）
6. Scriptable を開き、「お便り分割」があることを確認

### 直リンク

| ファイル | URL |
|---------|-----|
| zip一式 | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-scriptable.zip |
| エンジン | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-engine.html |
| スクリプト | https://github.com/9bo9bo/otayori-split/releases/latest/download/OtayoriSplit.js |

## ショートカット手順

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

## 開発者向けビルド

```bash
npm install
npm run build
```

生成物は `scriptable/` です。タグ `v*` を push すると GitHub Actions が Release を作成します。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| エンジンがない | `otayori-split-engine.html` を Scriptable 書類フォルダへコピー |
| 入力PDFがない | ショートカットに「ファイルブックマークを作成」（名前は正確に `OtayoriSplitInput`）があるか確認 |
| メモリ不足で落ちる | 「スクリプトを実行」の **Appで実行** をオン |
| ブックマークが効かない | Scriptable設定内のブックマークではなく、**Shortcutsの Scriptable アクション**で作成する |
| スクリプト名が英語 | `OtayoriSplit.js` を `お便り分割.js` にリネーム |
| 対応していないタイプの結果 | 最新 Release の JS と HTML を両方入れ直す |
