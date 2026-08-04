// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: cut;
// share-sheet-inputs: file-url;
//
// お便り分割 — A3/B4 PDF を A4×2 / B5×2 に中央分割
// 必要ファイル: Scriptable 書類フォルダ内の otayori-split-engine.html
// （リポジトリの npm run build で生成）

const BOOKMARK_INPUT = 'OtayoriSplitInput'
const ENGINE_NAME = 'otayori-split-engine.html'

async function main() {
  const fm = bestFileManager()
  const enginePath = await ensureEngine(fm)
  const { path: inputPath, name: inputName, fm: inputFm } = await resolveInput(fm)

  if (!inputFm.fileExists(inputPath)) {
    throw new Error('入力PDFが見つかりません: ' + inputPath)
  }
  if (inputFm.isFileStoredIniCloud && inputFm.isFileStoredIniCloud(inputPath)) {
    await inputFm.downloadFileFromiCloud(inputPath)
  }

  const inputData = inputFm.read(inputPath)
  if (!inputData) {
    throw new Error(
      'PDFを読み込めませんでした。Shortcuts から実行する場合は「Appで実行」をオンにしてください。',
    )
  }

  const inputBase64 = inputData.toBase64String()
  const result = await runSplitInWebView(enginePath, inputBase64)

  const outName = buildOutputFilename(inputName)
  const outPath = fm.joinPath(fm.documentsDirectory(), outName)
  fm.write(outPath, Data.fromBase64String(result.base64))

  const summary = `${result.summary.sourceLabel} → ${result.summary.targetLabel} ／ ${result.pageCount}頁 → ${result.outputPages}頁`
  console.log(summary)

  // Shortcuts へはファイルパスを返す
  Script.setShortcutOutput(outPath)

  if (config.runsFromShortcut) {
    Script.complete()
    return
  }

  const alert = new Alert()
  alert.title = '分割完了'
  alert.message = summary + '\n\n' + outName
  alert.addAction('共有')
  alert.addAction('クイックルック')
  alert.addCancelAction('閉じる')
  const picked = await alert.present()
  if (picked === 0) {
    await ShareSheet.present([outPath])
  } else if (picked === 1) {
    await QuickLook.present(outPath)
  }
  Script.complete()
}

function bestFileManager() {
  // Scriptable 書類は iCloud 同期が一般的
  try {
    const icloud = FileManager.iCloud()
    if (icloud.documentsDirectory()) return icloud
  } catch (e) {
    // fall through
  }
  return FileManager.local()
}

async function ensureEngine(fm) {
  const managers = [fm, FileManager.iCloud(), FileManager.local()]
  for (const candidate of managers) {
    try {
      const path = candidate.joinPath(candidate.documentsDirectory(), ENGINE_NAME)
      if (!candidate.fileExists(path)) continue
      if (candidate.isFileStoredIniCloud && candidate.isFileStoredIniCloud(path)) {
        await candidate.downloadFileFromiCloud(path)
      }
      return path
    } catch (e) {
      // try next
    }
  }

  throw new Error(
    'otayori-split-engine.html が Scriptable の書類フォルダにありません。\n' +
      'Mac/PC で npm run build を実行し、scriptable/ 内の HTML を Scriptable フォルダへコピーしてください。',
  )
}

async function resolveInput(preferredFm) {
  // 1) 共有シートの file URL
  if (args.fileURLs && args.fileURLs.length > 0) {
    const url = args.fileURLs[0]
    const path = decodeURIComponent(('' + url).replace(/^file:\/\//, ''))
    return { path, name: preferredFm.fileName(path), fm: FileManager.local() }
  }

  // 2) Shortcuts の「ファイルブックマークを作成」(推奨)
  //    Shortcuts 由来ブックマークは local / 実行コンテキスト側で見える
  for (const fm of [FileManager.local(), FileManager.iCloud()]) {
    try {
      if (fm.bookmarkExists(BOOKMARK_INPUT)) {
        const path = fm.bookmarkedPath(BOOKMARK_INPUT)
        return { path, name: fm.fileName(path), fm }
      }
    } catch (e) {
      // continue
    }
  }

  // 3) shortcutParameter がパス文字列の場合
  if (args.shortcutParameter != null) {
    const param = '' + args.shortcutParameter
    if (param && (param.startsWith('/') || param.indexOf('file:') === 0)) {
      const path = decodeURIComponent(param.replace(/^file:\/\//, ''))
      return { path, name: preferredFm.fileName(path), fm: FileManager.local() }
    }
  }

  // 4) アプリ内実行: ファイル選択
  if (!config.runsFromShortcut) {
    const paths = await DocumentPicker.open(['com.adobe.pdf', 'public.pdf'])
    if (!paths || paths.length === 0) {
      throw new Error('PDFが選択されませんでした')
    }
    const path = paths[0]
    return { path, name: preferredFm.fileName(path), fm: FileManager.local() }
  }

  throw new Error(
    '入力PDFがありません。\n' +
      'おすすめ: PDFの共有シート → Scriptable → お便り分割\n' +
      'ショートカット利用時: 入力にPDFを渡すか、' +
      `「ファイルブックマークを作成」（名前: ${BOOKMARK_INPUT}）を挟んでください。`,
  )
}

async function runSplitInWebView(enginePath, inputBase64) {
  const wv = new WebView()
  await wv.loadFile(enginePath)

  // Scriptable は completion / 戻り値にオブジェクトや Promise を渡せない。
  // 必ず JSON 文字列で返し、同期側の最終式も "" にする。
  const js = `
    (async function() {
      try {
        if (!window.__otayoriEngineReady) {
          completion(JSON.stringify({ error: 'エンジンの読み込みに失敗しました' }));
          return;
        }
        const result = await splitPdfBase64(${JSON.stringify(inputBase64)});
        completion(JSON.stringify(result));
      } catch (e) {
        completion(JSON.stringify({
          error: String(e && e.message ? e.message : e)
        }));
      }
    })();
    ""
  `
  const raw = await wv.evaluateJavaScript(js, true)
  let result
  try {
    result = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e) {
    throw new Error('エンジンからの応答を解析できませんでした: ' + String(raw).slice(0, 120))
  }
  if (!result || result.error) {
    throw new Error((result && result.error) || '分割に失敗しました')
  }
  if (!result.base64) {
    throw new Error('分割結果のPDFデータが空です')
  }
  return result
}

function buildOutputFilename(originalName) {
  const base = (originalName || 'document.pdf').replace(/\.pdf$/i, '')
  return `${base}_A4orB5分割.pdf`
}

main().catch(async (err) => {
  console.error(err)
  const alert = new Alert()
  alert.title = 'お便り分割エラー'
  alert.message = String(err && err.message ? err.message : err)
  alert.addAction('OK')
  await alert.present()
  if (config.runsFromShortcut) {
    Script.setShortcutOutput('')
  }
  Script.complete()
})
