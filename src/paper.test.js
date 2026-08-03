import { detectPaper, mmToPt } from './paper.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

// A3 landscape
{
  const r = detectPaper(mmToPt(420), mmToPt(297))
  assert(r.matched && r.sourceName === 'A3' && r.targetName === 'A4', 'A3 landscape')
}

// A3 portrait
{
  const r = detectPaper(mmToPt(297), mmToPt(420))
  assert(r.matched && r.sourceName === 'A3' && r.targetName === 'A4', 'A3 portrait')
}

// JIS B4 landscape
{
  const r = detectPaper(mmToPt(364), mmToPt(257))
  assert(r.matched && r.sourceName === 'B4' && r.targetName === 'B5', 'B4 landscape')
}

// Unknown size
{
  const r = detectPaper(mmToPt(200), mmToPt(200))
  assert(!r.matched, 'unknown size should not match')
}

console.log('paper.test.js: ok')
