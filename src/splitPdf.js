import { PDFDocument } from '@cantoo/pdf-lib'
import { detectPaper, formatSizeMm } from './paper.js'

/**
 * Split each page of a large PDF into two halves (A3→A4×2, B4→B5×2).
 * Landscape pages: left then right. Portrait pages: top then bottom.
 * Vector content is preserved via @cantoo/pdf-lib page embedding.
 */
export async function splitLargePdf(inputBytes, options = {}) {
  const { onProgress } = options
  // ignoreEncryption: 閲覧用パスワードなし／所有者パスワードのみの
  // お便りPDFを開けるようにする（端末内のユーザー自身のファイル向け）。
  const src = await PDFDocument.load(inputBytes, { ignoreEncryption: true })
  const out = await PDFDocument.create()
  const pageCount = src.getPageCount()

  if (pageCount === 0) {
    throw new Error('PDFにページがありません')
  }

  const pageReports = []
  let outputPages = 0

  for (let i = 0; i < pageCount; i++) {
    onProgress?.({
      phase: 'splitting',
      current: i + 1,
      total: pageCount,
    })

    const srcPage = src.getPage(i)
    const { width, height } = srcPage.getSize()
    const detection = detectPaper(width, height)
    const landscape = width >= height

    const [embedded] = await out.embedPages([srcPage])

    if (landscape) {
      const halfW = width / 2
      const left = out.addPage([halfW, height])
      left.drawPage(embedded, { x: 0, y: 0, width, height })
      const right = out.addPage([halfW, height])
      right.drawPage(embedded, { x: -halfW, y: 0, width, height })
      pageReports.push({
        index: i + 1,
        orientation: 'landscape',
        split: '左右',
        inputSize: formatSizeMm(width, height),
        outputSize: formatSizeMm(halfW, height),
        ...detection,
      })
    } else {
      const halfH = height / 2
      // PDF origin is bottom-left: shift down to show the top half first.
      const top = out.addPage([width, halfH])
      top.drawPage(embedded, { x: 0, y: -halfH, width, height })
      const bottom = out.addPage([width, halfH])
      bottom.drawPage(embedded, { x: 0, y: 0, width, height })
      pageReports.push({
        index: i + 1,
        orientation: 'portrait',
        split: '上下',
        inputSize: formatSizeMm(width, height),
        outputSize: formatSizeMm(width, halfH),
        ...detection,
      })
    }

    outputPages += 2
  }

  onProgress?.({ phase: 'saving', current: pageCount, total: pageCount })
  const bytes = await out.save({ useObjectStreams: true })

  const matched = pageReports.filter((p) => p.matched)
  const sourceNames = [...new Set(matched.map((p) => p.sourceName))]
  const targetNames = [...new Set(matched.map((p) => p.targetName))]

  return {
    bytes,
    pageCount,
    outputPages,
    pageReports,
    summary: {
      sourceLabel: sourceNames.length ? sourceNames.join(' / ') : pageReports[0]?.sourceName,
      targetLabel: targetNames.length ? targetNames.join(' / ') : pageReports[0]?.targetName,
      allMatched: matched.length === pageCount,
    },
  }
}

export function buildOutputFilename(originalName) {
  const base = (originalName || 'document.pdf').replace(/\.pdf$/i, '')
  return `${base}_A4orB5分割.pdf`
}
