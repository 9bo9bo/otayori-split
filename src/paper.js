/** PDF points (1/72 inch). Japanese school print sizes use ISO A and JIS B. */
export const MM_PER_PT = 25.4 / 72

export const PAPER = {
  A3: { name: 'A3', wMm: 297, hMm: 420 },
  A4: { name: 'A4', wMm: 210, hMm: 297 },
  B4: { name: 'B4', wMm: 257, hMm: 364 }, // JIS B4
  B5: { name: 'B5', wMm: 182, hMm: 257 }, // JIS B5
}

export function ptToMm(pt) {
  return pt * MM_PER_PT
}

export function mmToPt(mm) {
  return (mm * 72) / 25.4
}

/**
 * Match page size to A3/B4 (either orientation) within tolerance.
 * Returns source label, target half-page label, and confidence.
 */
export function detectPaper(widthPt, heightPt, toleranceMm = 8) {
  const shortMm = Math.min(ptToMm(widthPt), ptToMm(heightPt))
  const longMm = Math.max(ptToMm(widthPt), ptToMm(heightPt))

  const candidates = [
    { source: PAPER.A3, target: PAPER.A4 },
    { source: PAPER.B4, target: PAPER.B5 },
  ]

  for (const { source, target } of candidates) {
    const shortOk = Math.abs(shortMm - Math.min(source.wMm, source.hMm)) <= toleranceMm
    const longOk = Math.abs(longMm - Math.max(source.wMm, source.hMm)) <= toleranceMm
    if (shortOk && longOk) {
      return {
        sourceName: source.name,
        targetName: target.name,
        matched: true,
        shortMm,
        longMm,
      }
    }
  }

  return {
    sourceName: `${shortMm.toFixed(0)}×${longMm.toFixed(0)}mm`,
    targetName: '半分サイズ',
    matched: false,
    shortMm,
    longMm,
  }
}

export function formatSizeMm(widthPt, heightPt) {
  return `${ptToMm(widthPt).toFixed(0)}×${ptToMm(heightPt).toFixed(0)}mm`
}
