# Scriptable × ショートカット：お便り分割

Safari版と違い、**共有シートからPDFを渡して分割まで自動化**できます。

## 事前準備

1. App Store で **Scriptable** をインストール
2. Mac/PC でリポジトリを開き、次を実行:

```bash
npm run build:scriptable
```

3. 生成された `scriptable/` を Scriptable の書類フォルダへ入れる  
   （Files アプリ → 「このiPhone内」→ Scriptable）
   - `お便り分割.js`
   - `otayori-split-engine.html`（必須・分割エンジン）
4. Scriptable で「お便り分割」を開き、設定で次を確認:
   - **Share Sheet** で File URLs を許可
   - 大きなPDF用に Shortcuts 側で **Appで実行** をオン

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

## Safari版との違い

| | Safari / PWA | Scriptable + Shortcuts |
|--|--------------|------------------------|
| 追加アプリ | 不要 | Scriptable が必要 |
| 共有シートからPDFを直接渡す | 不可（起動後に再選択） | **可能** |
| オフライン | ホーム画面追加後は可 | エンジンHTMLを入れれば可 |
| 向いている人 | 手軽さ優先 | 自動化・印刷まで一気にやりたい |
