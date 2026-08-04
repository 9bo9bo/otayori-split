/**
 * Builds a self-contained HTML engine for Scriptable WebView,
 * inlining @cantoo/pdf-lib + the shared split logic, and copies the Scriptable script.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'scriptable')
// package exports omit dist/; unpkg points here and UMD still exposes window.PDFLib
const pdfLibPath = join(root, 'node_modules/@cantoo/pdf-lib/dist/pdf-lib.min.js')

const paperSrc = readFileSync(join(root, 'src/paper.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')

const splitSrc = readFileSync(join(root, 'src/splitPdf.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')

const pdfLib = readFileSync(pdfLibPath, 'utf8')

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>お便り分割 Engine</title>
</head>
<body>
<script>
${pdfLib}
</script>
<script>
(function () {
  var lib = window.PDFLib;
  if (!lib || !lib.PDFDocument) {
    throw new Error('PDFLib failed to load in WebView');
  }
  var PDFDocument = lib.PDFDocument;

${paperSrc}

${splitSrc}

  /**
   * Called from Scriptable via WebView.evaluateJavaScript.
   * Returns a plain JSON-serializable object (base64 string + summary).
   * Scriptable completion() only accepts simple types — stringify on the caller side.
   */
  async function splitPdfBase64(inputBase64) {
    var binary = atob(inputBase64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    var result = await splitLargePdf(bytes);
    var out = '';
    var chunk = 0x8000;
    for (var j = 0; j < result.bytes.length; j += chunk) {
      out += String.fromCharCode.apply(null, result.bytes.subarray(j, j + chunk));
    }
    // Avoid non-JSON values (undefined) that break Scriptable bridges
    return {
      base64: btoa(out),
      pageCount: result.pageCount,
      outputPages: result.outputPages,
      summary: {
        sourceLabel: String(result.summary.sourceLabel || ''),
        targetLabel: String(result.summary.targetLabel || ''),
        allMatched: !!result.summary.allMatched,
      },
    };
  }

  window.splitPdfBase64 = splitPdfBase64;
  window.__otayoriEngineReady = true;
})();
</script>
</body>
</html>
`

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'otayori-split-engine.html'), html)

copyFileSync(join(root, 'scriptable-src/お便り分割.js'), join(outDir, 'お便り分割.js'))
copyFileSync(join(root, 'scriptable-src/SHORTCUTS.md'), join(outDir, 'SHORTCUTS.md'))

console.log('Wrote scriptable/otayori-split-engine.html', Buffer.byteLength(html), 'bytes')
console.log('Copied お便り分割.js and SHORTCUTS.md')
