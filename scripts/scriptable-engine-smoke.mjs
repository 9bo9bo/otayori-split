/**
 * Smoke-test the generated Scriptable engine HTML by executing its scripts in Node.
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib'
import { mmToPt } from '../src/paper.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'scriptable/otayori-split-engine.html'), 'utf8')
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
if (scripts.length < 2) throw new Error('engine HTML missing scripts')

const sandbox = {
  window: {},
  self: {},
  atob,
  btoa,
  Uint8Array,
  String,
  Math,
  console,
}
sandbox.window = sandbox
sandbox.self = sandbox
sandbox.globalThis = sandbox
vm.createContext(sandbox)

// First script is @cantoo/pdf-lib UMD — avoid CommonJS branch
sandbox.module = undefined
sandbox.exports = undefined
vm.runInContext(scripts[0], sandbox)
vm.runInContext(scripts[1], sandbox)

if (!sandbox.window.__otayoriEngineReady) {
  throw new Error('engine did not become ready')
}

const doc = await PDFDocument.create()
const page = doc.addPage([mmToPt(420), mmToPt(297)])
const font = await doc.embedFont(StandardFonts.Helvetica)
page.drawText('A3', { x: 40, y: 200, size: 24, font })
const input = await doc.save()
const inputBase64 = Buffer.from(input).toString('base64')

const result = await sandbox.window.splitPdfBase64(inputBase64)
if (!result.base64) throw new Error('no base64 output')
if (result.summary.sourceLabel !== 'A3') throw new Error('expected A3, got ' + result.summary.sourceLabel)
if (result.outputPages !== 2) throw new Error('expected 2 pages')

const out = await PDFDocument.load(Buffer.from(result.base64, 'base64'))
if (out.getPageCount() !== 2) throw new Error('output page count mismatch')

console.log('scriptable-engine-smoke.mjs: ok')
