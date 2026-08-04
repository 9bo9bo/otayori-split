# お便り分割（Scriptable × ショートカット）

保育園・学校のお便りなどで届く **A3 / B4 PDF** を、家庭用プリンター向けの **A4×2 / B5×2** に中央分割します。

iPhone の **Scriptable** と **ショートカット** 連携専用です。共有シートからPDFを渡して分割まで自動化できます。

## 分割ルール

| 入力 | 出力 | 切り方 |
|------|------|--------|
| A3（ヨコ） | A4×2 | 左右 |
| A3（タテ） | A4×2 | 上下 |
| B4（ヨコ・JIS） | B5×2 | 左右 |
| B4（タテ・JIS） | B5×2 | 上下 |

標準サイズ以外でも中央で半分に分割します。文字や図は画像化せず、PDFのまま切り出します。

## iPhone への入れ方

1. App Store で **Scriptable** をインストール
2. Safari で [最新 Release](https://github.com/9bo9bo/otayori-split/releases/latest) を開く
3. **otayori-split-scriptable.zip** をダウンロード → Files で解凍
4. 次を **このiPhone内 → Scriptable** へ移動
   - `お便り分割.js`
   - `otayori-split-engine.html`

直リンク（常に最新）:

https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-scriptable.zip

## ショートカット

入力を **ファイル**（PDF）にしたショートカットを作成します。

| # | アクション | 設定 |
|---|-----------|------|
| 1 | **ファイルブックマークを作成**（Scriptable） | 名前 `OtayoriSplitInput` |
| 2 | **スクリプトを実行**（Scriptable） | `お便り分割` ／ **Appで実行: オン** |
| 3 | **共有** または **ファイルを保存** | スクリプトの結果 |

使い方: お便りPDFを共有 → ショートカット実行 → 分割PDFを印刷（**実際のサイズ / 100%**）。

詳細・トラブルシュートは [scriptable/SHORTCUTS.md](scriptable/SHORTCUTS.md) を参照。

## 開発

```bash
npm install
npm test    # 分割ロジック検証 + Scriptable成果物ビルド
npm run build
```

| パス | 内容 |
|------|------|
| `src/` | 用紙判定・PDF分割ロジック |
| `scriptable-src/` | Scriptable スクリプトのソース |
| `scriptable/` | `npm run build` の生成物（Release にも添付） |
| `.github/workflows/` | タグ `v*` で Release 自動作成 |

## 技術

- [pdf-lib](https://pdf-lib.js.org/)（ベクトルのままページ分割）
- Scriptable WebView（端末内で完結）
- GitHub Actions → Releases（iPhone向け配布）
