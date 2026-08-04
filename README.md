# お便り分割（Scriptable）

保育園・学校のお便りなどで届く **A3 / B4 PDF** を、家庭用プリンター向けの **A4×2 / B5×2** に中央分割します。

iPhone の **Scriptable** アプリで動かします（共有シートからPDFを渡せます）。

## 分割ルール

| 入力 | 出力 | 切り方 |
|------|------|--------|
| A3（ヨコ） | A4×2 | 左右 |
| A3（タテ） | A4×2 | 上下 |
| B4（ヨコ・JIS） | B5×2 | 左右 |
| B4（タテ・JIS） | B5×2 | 上下 |

標準サイズ以外でも中央で半分に分割します。文字や図は画像化せず、PDFのまま切り出します。

---

## 1. インストール（初回だけ）

1. App Store で **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)** を入れる
2. Safari で [最新Release](https://github.com/9bo9bo/otayori-split/releases/latest) を開く
3. **otayori-split-scriptable.zip** をダウンロードし、Files で解凍
4. 次の2つを **Files → このiPhone内 → Scriptable** に入れる
   - `お便り分割.js`
   - `otayori-split-engine.html`
5. Scriptable を開く → 「お便り分割」が見えればOK  
   （初回はスクリプトを一度開き、必要なら「Share Sheet」でファイルを受け取る設定をオン）

直リンク:

https://github.com/9bo9bo/otayori-split/releases/latest/download/otayori-split-scriptable.zip

---

## 2. 使い方（おすすめ・ショートカット不要）

作成済みショートカットは不要です。iPhoneの共有シートから直接実行できます。

1. メールやFilesでお便りPDFを開く
2. **共有** ボタンをタップ
3. **Scriptable** を選ぶ
4. **お便り分割** を選ぶ
5. 終わったら **共有** → 印刷、または Files に保存
6. 印刷設定は **実際のサイズ** または **100%**（「用紙に合わせる」だと小さくなります）
7. 出てきた2枚を並べて貼ると元の大きさになります

```text
PDFを開く → 共有 → Scriptable → お便り分割 → 共有/印刷
```

---

## 3. ショートカットの作成手順

共有シートに独自の名前で出したいとき用です。

1. ショートカットアプリ → ＋ → 新規ショートカット
2. ⓘ（情報）→ **共有シートに表示** をオン → 種類で **ファイル** を許可
3. アクション **スクリプトを実行**（Scriptable）
   - スクリプト: `お便り分割`
   - 入力: ショートカットの入力
   - **Appで実行: オン**（大きいPDF向け）
4. アクション **共有シートを表示**（スクリプトの結果）
5. 名前を `お便りをA4分割` などにする

あとは PDF の共有メニューからそのショートカットを選ぶだけです。

入力が渡らないときは、「スクリプトを実行」の前に Scriptable の **ファイルブックマークを作成**（名前は必ず `OtayoriSplitInput`）を挟んでください。

詳しいトラブルシュートは [scriptable/SHORTCUTS.md](scriptable/SHORTCUTS.md) を参照。

---

## 開発

```bash
npm install
npm test
npm run build
```

| パス | 内容 |
|------|------|
| `src/` | 用紙判定・PDF分割ロジック |
| `scriptable-src/` | Scriptable スクリプトのソース |
| `scriptable/` | `npm run build` の生成物 |
| `.github/workflows/` | タグ `v*` で Release 自動作成 |

## 技術

- [@cantoo/pdf-lib](https://www.npmjs.com/package/@cantoo/pdf-lib)（pdf-lib 継続フォーク。ベクトルのままページ分割）
- Scriptable WebView（端末内で完結）
- GitHub Actions → Releases（iPhone向け配布）
