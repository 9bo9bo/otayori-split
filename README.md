# お便り分割

保育園・学校のお便りなどで届く **A3 / B4 PDF** を、家庭用プリンターで印刷できる **A4×2 / B5×2** に中央分割します。

2つの使い方があります。

| 方式 | 向いている人 | 共有シートからPDFを直接渡す |
|------|-------------|------------------------------|
| **A. Safari / PWA** | 追加アプリなしで使いたい | 不可（起動後に再選択） |
| **B. Scriptable × ショートカット** | 共有→分割→印刷を自動化したい | **可能** |

分割ロジックは共通です（pdf-lib、端末内処理）。

## 分割ルール

| 入力 | 出力 | 切り方 |
|------|------|--------|
| A3（ヨコ） | A4×2 | 左右 |
| A3（タテ） | A4×2 | 上下 |
| B4（ヨコ・JIS） | B5×2 | 左右 |
| B4（タテ・JIS） | B5×2 | 上下 |

標準サイズ以外でも「中央で半分」に分割します。文字や図は画像化せず、PDFのまま切り出します。

---

## A. Safari / PWA

1. Safari でこのアプリを開く
2. 共有ボタン → **ホーム画面に追加**
3. PDFを選ぶ → **分割する** → **共有・保存**
4. 印刷時は **実際のサイズ / 100%**（「用紙に合わせる」だと小さくなります）

ショートカット例: 「URLを開く」でアプリを起動（PDFの受け渡しはできないため、起動後に選択）。

---

## B. Scriptable × ショートカット

詳細は [scriptable/SHORTCUTS.md](scriptable/SHORTCUTS.md) を参照。

### 準備

```bash
npm run build:scriptable
```

生成物 `scriptable/お便り分割.js` と `scriptable/otayori-split-engine.html` を iPhone の **Scriptable 書類フォルダ**へコピーします。

### ショートカット（概要）

1. **ファイルブックマークを作成**（Scriptable）… 名前 `OtayoriSplitInput`
2. **スクリプトを実行**（Scriptable）… `お便り分割` ／ **Appで実行: オン**
3. **共有** または **ファイルを保存**

共有シートからお便りPDFを渡すと、分割済みPDFが返ります。

---

## 開発

```bash
npm install
npm run dev
npm run build
npm run build:scriptable
npm test
```

`dist/` は Safari 版の静的配信用です。`base: './'` のためサブディレクトリ配置にも対応しています。

## 技術

- Vite + PWA（Safari版）
- [pdf-lib](https://pdf-lib.js.org/)（ベクトルのままページ分割）
- Scriptable WebView（ショートカット連携版）
