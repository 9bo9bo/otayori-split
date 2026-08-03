import './style.css'
import { registerSW } from 'virtual:pwa-register'
import { splitLargePdf, buildOutputFilename } from './splitPdf.js'

registerSW({ immediate: true })

const app = document.querySelector('#app')

app.innerHTML = `
  <header class="brand">
    <div class="brand-mark" aria-hidden="true">
      ${brandMark()}
      <h1>お便り分割</h1>
    </div>
    <p>A3・B4のお便りPDFを、家庭用プリンター向けのA4×2／B5×2に中央で分割します。ファイルは端末内だけで処理されます。</p>
  </header>

  <main class="stage">
    <label class="dropzone" id="dropzone" for="file-input" tabindex="0">
      <div>
        <strong>PDFを選択</strong>
        <span>タップするか、ファイルをドロップ</span>
        <span class="hint">対応: A3 → A4×2 ／ B4 → B5×2（中央で半分）</span>
      </div>
      <input class="file-input" id="file-input" type="file" accept="application/pdf,.pdf" />
    </label>

    <div class="actions">
      <button type="button" class="btn-primary" id="btn-split" disabled>分割する</button>
      <button type="button" class="btn-accent" id="btn-share" disabled hidden>共有・保存</button>
      <a class="button btn-secondary" id="btn-download" hidden>ダウンロード</a>
      <button type="button" class="btn-secondary" id="btn-reset" hidden>やり直す</button>
    </div>

    <div class="progress" id="progress" aria-hidden="true"><i></i></div>
    <p class="status" id="status" role="status"></p>

    <section class="result" id="result" aria-live="polite">
      <h2>分割できました</h2>
      <p class="result-meta" id="result-meta"></p>
      <ul class="page-list" id="page-list"></ul>
      <p class="result-meta">印刷時は「実際のサイズ」または「100%」を選び、余白で縮小されないようにしてください。2枚を並べて貼り合わせると元の大きさになります。</p>
    </section>
  </main>

  <section class="howto">
    <h2>iPhoneショートカットでの使い方</h2>
    <ol>
      <li>Safariでこのページを開き、共有ボタン → <strong>ホーム画面に追加</strong> します（オフラインでも使えます）。</li>
      <li>ショートカットアプリで新規作成し、「アプリを開く」で <strong>お便り分割</strong> を選ぶか、このページのURLを開くアクションを入れます。</li>
      <li>お便りPDFの共有メニューからそのショートカットを実行 → アプリが開いたら同じPDFを選択 →「分割する」→「共有・保存」から印刷やFilesへ保存します。</li>
    </ol>
  </section>
`

function brandMark() {
  return `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="56" height="44" rx="8" fill="#2F6F5E"/>
      <path d="M32 10V54" stroke="#F3C4A4" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 22h10M14 30h12M14 38h9" stroke="#E7F0EB" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 22h10M38 30h12M41 38h9" stroke="#E7F0EB" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `
}

const dropzone = document.querySelector('#dropzone')
const fileInput = document.querySelector('#file-input')
const btnSplit = document.querySelector('#btn-split')
const btnShare = document.querySelector('#btn-share')
const btnDownload = document.querySelector('#btn-download')
const btnReset = document.querySelector('#btn-reset')
const statusEl = document.querySelector('#status')
const progressEl = document.querySelector('#progress')
const progressBar = progressEl.querySelector('i')
const resultEl = document.querySelector('#result')
const resultMeta = document.querySelector('#result-meta')
const pageList = document.querySelector('#page-list')

let selectedFile = null
let outputBlob = null
let outputName = ''
let objectUrl = null

function setStatus(message, tone = '') {
  statusEl.textContent = message
  statusEl.dataset.tone = tone
}

function setProgress(ratio, active) {
  progressEl.classList.toggle('is-active', active)
  progressEl.setAttribute('aria-hidden', active ? 'false' : 'true')
  progressBar.style.width = `${Math.round(ratio * 100)}%`
}

function revokeUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function resetOutput() {
  outputBlob = null
  outputName = ''
  revokeUrl()
  btnShare.hidden = true
  btnShare.disabled = true
  btnDownload.hidden = true
  btnReset.hidden = true
  resultEl.classList.remove('is-visible')
  pageList.innerHTML = ''
}

function selectFile(file) {
  if (!file) return
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    setStatus('PDFファイルを選んでください', 'error')
    return
  }
  selectedFile = file
  resetOutput()
  btnSplit.disabled = false
  setStatus(`選択中: ${file.name}`)
}

dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault()
  dropzone.classList.add('is-dragover')
})
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('is-dragover')
})
dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('is-dragover')
})
dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.classList.remove('is-dragover')
  const file = e.dataTransfer?.files?.[0]
  selectFile(file)
})

dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fileInput.click()
  }
})

fileInput.addEventListener('change', () => {
  selectFile(fileInput.files?.[0])
})

btnSplit.addEventListener('click', async () => {
  if (!selectedFile) return

  btnSplit.disabled = true
  resetOutput()
  setProgress(0.05, true)
  setStatus('分割しています…')

  try {
    const inputBytes = new Uint8Array(await selectedFile.arrayBuffer())
    const result = await splitLargePdf(inputBytes, {
      onProgress: ({ phase, current, total }) => {
        if (phase === 'splitting') {
          setProgress(0.1 + (current / total) * 0.75, true)
          setStatus(`ページ ${current} / ${total} を分割中…`)
        } else if (phase === 'saving') {
          setProgress(0.92, true)
          setStatus('PDFを書き出しています…')
        }
      },
    })

    outputBlob = new Blob([result.bytes], { type: 'application/pdf' })
    outputName = buildOutputFilename(selectedFile.name)
    revokeUrl()
    objectUrl = URL.createObjectURL(outputBlob)

    btnDownload.href = objectUrl
    btnDownload.download = outputName
    btnDownload.hidden = false
    btnDownload.textContent = 'ダウンロード'
    btnShare.hidden = false
    btnShare.disabled = false
    btnReset.hidden = false

    const warn = result.summary.allMatched
      ? ''
      : ' ※標準のA3/B4とサイズが少し違うページがありますが、中央で半分に分割しました。'

    resultMeta.textContent = `${result.summary.sourceLabel} → ${result.summary.targetLabel} ／ 入力 ${result.pageCount} ページ → 出力 ${result.outputPages} ページ${warn}`

    pageList.innerHTML = result.pageReports
      .map(
        (p) => `
        <li>
          <span><strong>p.${p.index}</strong> ${p.inputSize}（${p.split}）</span>
          <span>${p.matched ? p.sourceName + '→' + p.targetName : '半分'} ${p.outputSize}×2</span>
        </li>`,
      )
      .join('')

    resultEl.classList.add('is-visible')
    setProgress(1, true)
    setStatus('完了しました。共有・保存またはダウンロードできます。', 'ok')
    setTimeout(() => setProgress(1, false), 500)
  } catch (err) {
    console.error(err)
    setProgress(0, false)
    setStatus(err?.message || '分割に失敗しました', 'error')
  } finally {
    btnSplit.disabled = !selectedFile
  }
})

btnShare.addEventListener('click', async () => {
  if (!outputBlob) return
  const file = new File([outputBlob], outputName, { type: 'application/pdf' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: outputName })
      setStatus('共有シートを開きました', 'ok')
      return
    } catch (err) {
      if (err?.name === 'AbortError') return
      console.warn(err)
    }
  }

  // Fallback: trigger download
  btnDownload.click()
  setStatus('この端末では共有できないため、ダウンロードしました', 'ok')
})

btnReset.addEventListener('click', () => {
  selectedFile = null
  fileInput.value = ''
  btnSplit.disabled = true
  resetOutput()
  setProgress(0, false)
  setStatus('新しいPDFを選択してください')
})
