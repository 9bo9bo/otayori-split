import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { writeFileSync, mkdirSync } from 'fs'
import { splitLargePdf } from '../src/splitPdf.js'
import { mmToPt } from '../src/paper.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function makeSample(widthMm, heightMm, label) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([mmToPt(widthMm), mmToPt(heightMm)])
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width / 2,
    height,
    color: rgb(0.85, 0.93, 0.9),
  })
  page.drawRectangle({
    x: width / 2,
    y: 0,
    width: width / 2,
    height,
    color: rgb(0.96, 0.9, 0.82),
  })
  page.drawText(`${label} LEFT`, { x: 48, y: height / 2, size: 28, font, color: rgb(0.12, 0.3, 0.25) })
  page.drawText(`${label} RIGHT`, {
    x: width / 2 + 48,
    y: height / 2,
    size: 28,
    font,
    color: rgb(0.45, 0.25, 0.12),
  })
  return doc.save()
}

mkdirSync('tmp', { recursive: true })

// A3 landscape
{
  const input = await makeSample(420, 297, 'A3')
  writeFileSync('tmp/sample-a3.pdf', input)
  const result = await splitLargePdf(input)
  assert(result.outputPages === 2, 'A3 should yield 2 pages')
  assert(result.summary.sourceLabel === 'A3', 'detect A3')
  assert(result.summary.targetLabel === 'A4', 'target A4')
  const out = await PDFDocument.load(result.bytes)
  const p0 = out.getPage(0).getSize()
  assert(Math.abs(p0.width - mmToPt(210)) < 1, 'half width ~A4')
  assert(Math.abs(p0.height - mmToPt(297)) < 1, 'height ~A4')
  writeFileSync('tmp/sample-a3-split.pdf', result.bytes)
}

// B4 landscape (JIS)
{
  const input = await makeSample(364, 257, 'B4')
  const result = await splitLargePdf(input)
  assert(result.summary.sourceLabel === 'B4', 'detect B4')
  assert(result.summary.targetLabel === 'B5', 'target B5')
  const out = await PDFDocument.load(result.bytes)
  const p0 = out.getPage(0).getSize()
  assert(Math.abs(p0.width - mmToPt(182)) < 1, 'half width ~B5')
  assert(Math.abs(p0.height - mmToPt(257)) < 1, 'height ~B5')
}

// A3 portrait (top/bottom)
{
  const doc = await PDFDocument.create()
  const page = doc.addPage([mmToPt(297), mmToPt(420)])
  page.drawText('TOP', { x: 40, y: mmToPt(350), size: 24 })
  page.drawText('BOTTOM', { x: 40, y: mmToPt(40), size: 24 })
  const result = await splitLargePdf(await doc.save())
  assert(result.pageReports[0].split === '上下', 'portrait splits vertically')
  const out = await PDFDocument.load(result.bytes)
  const p0 = out.getPage(0).getSize()
  assert(Math.abs(p0.height - mmToPt(210)) < 1, 'half height ~A4 short side')
}

console.log('split-smoke.mjs: ok')
