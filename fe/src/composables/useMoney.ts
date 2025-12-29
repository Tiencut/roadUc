import { ref } from 'vue'

const audToVnd = ref<number>(16500)

export function parseCostStr(costStr: string | null | undefined) {
  if (!costStr) return null
  let s = String(costStr).replace(/\u00A0/g, ' ').trim()
  s = s.replace(/AUD|VND|AUD\:|VND\:/gi, '')
  s = s.replace(/[^0-9\-,.\s]/g, '')
  s = s.replace(/,/g, '')
  s = s.replace(/(\d)\.(?=\d{3}(?:\D|$))/g, '$1')
  s = s.replace(/\s+/g, ' ')

  const rangeMatch = s.match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10)
    const max = parseInt(rangeMatch[2], 10)
    if (!Number.isNaN(min) && !Number.isNaN(max)) return { min, max }
  }

  const numMatch = s.match(/(\d+)/)
  if (numMatch) {
    const v = parseInt(numMatch[1], 10)
    if (!Number.isNaN(v)) return { min: v, max: v }
  }
  return null
}

export function formatDigits(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatRange(r: { min: number; max: number } | null) {
  if (!r) return '-'
  if (r.min === r.max) return `${formatDigits(r.min)} AUD`
  return `${formatDigits(r.min)} - ${formatDigits(r.max)} AUD`
}

export function formatRangeVnd(r: { min: number; max: number } | null) {
  if (!r) return '-'
  const minVnd = Math.round(r.min * audToVnd.value)
  const maxVnd = Math.round(r.max * audToVnd.value)

  // If amounts are in millions, show as "x - y triệu VND" rounded to whole millions
  if (minVnd >= 1_000_000 && maxVnd >= 1_000_000) {
    const minM = Math.round(minVnd / 1_000_000)
    const maxM = Math.round(maxVnd / 1_000_000)
    return minM === maxM ? `${minM} triệu VND` : `${minM} - ${maxM} triệu VND`
  }

  if (minVnd === maxVnd) return `${formatDigits(minVnd)} VND`
  return `${formatDigits(minVnd)} - ${formatDigits(maxVnd)} VND`
}

export function useMoney() {
  return { audToVnd, parseCostStr, formatDigits, formatRange, formatRangeVnd }
}
