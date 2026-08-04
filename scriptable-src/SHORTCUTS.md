# お便り分割：詳細手順

## いちばん簡単（ショートカット不要）

1. Release の zip から `お便り分割.js` と `otayori-split-engine.html` を Scriptable フォルダへ入れる
2. お便りPDFを開く → **共有** → **Scriptable** → **お便り分割**
3. 完了後 **共有** から印刷（**実際のサイズ / 100%**）

## インストール詳細

1. App Store で **Scriptable** をインストール
2. Safari で https://github.com/9bo9bo/otayori-split/releases/latest を開く
3. **otayori-split-scriptable.zip** をダウンロード → Files で解凍
4. 次を **このiPhone内 → Scriptable** へ移動
   - `お便り分割.js`（個別DLの `OtayoriSplit.js` はリネーム）
   - `otayori-split-engine.html`
5. Scriptable で「お便り分割」を一度開き、Share Sheet でファイルを受け取れることを確認

### 直リンク

| ファイル | URL |
|---------|-----|
| zip一式 | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-scriptable.zip |
| エンジン | https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-engine.html |
| スクリプト | https://github.com/9bo9bo/otayori-split/releases/latest/download/OtayoriSplit.js |

## （任意）自分でショートカットを作る

共有シートに「お便りをA4分割」として出したいときだけ。

1. ショートカットアプリ → ＋ → 新規ショートカット
2. 上部の ⓘ（またはショートカット名横）→ **共有シートに表示** をオン → 種類で **ファイル** を許可
3. アクションを追加:
   - **スクリプトを実行**（Scriptableアプリ）
     - スクリプト: `お便り分割`
     - 入力: **ショートカット入力**
     - **Appで実行**: オン
   - **共有シートを表示**（上の結果）
4. 名前を `お便りをA4分割` などにする

### 入力が渡らないときだけ追加

「スクリプトを実行」の**前**に:

- **ファイルブックマークを作成**（Scriptable）
  - 名前: `OtayoriSplitInput`（一字一句このまま）
  - ファイル: ショートカット入力

## Scriptableアプリから単体実行

Scriptable で「お便り分割」を実行 → ファイルを選ぶ → 分割 → 共有 / クイックルック。

## 開発者向けビルド

```bash
npm install
npm run build
```

生成物は `scriptable/`。タグ `v*` を push すると Release が作られます。

## トラブルシュート

| 症状 | 対処 |
|------|------|
| 共有に Scriptable が出ない | Scriptable を一度開く。スクリプト設定で Share Sheet 入力を許可 |
| エンジンがない | `otayori-split-engine.html` を Scriptable フォルダへ |
| メモリ不足で落ちる | ショートカット利用時は **Appで実行** をオン |
| 入力PDFがない | 共有シートから実行するか、ブックマーク名 `OtayoriSplitInput` を確認 |
| スクリプト名が英語 | `OtayoriSplit.js` → `お便り分割.js` にリネーム |
| 対応していないタイプの結果 | 最新 Release の JS と HTML を両方入れ直す |
