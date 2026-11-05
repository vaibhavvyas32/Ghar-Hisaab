const pad = (n) => String(n).padStart(2, '0')

export const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}` // m is 0-based
export const monthKey = (y, m) => `${y}-${pad(m + 1)}`

export function todayKey() {
  const t = new Date()
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate())
}

export function currentMonth() {
  const t = new Date()
  return { y: t.getFullYear(), m: t.getMonth() }
}

export function shiftMonth({ y, m }, step) {
  const d = new Date(y, m + step, 1)
  return { y: d.getFullYear(), m: d.getMonth() }
}

export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()

// All date keys of a month, e.g. ['2026-11-01', ...]
export function monthDays(y, m) {
  return Array.from({ length: daysInMonth(y, m) }, (_, i) => dateKey(y, m, i + 1))
}

export function monthLabel(y, m) {
  return new Date(y, m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function prettyDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function money(amount, currency) {
  const n = Math.round(amount * 100) / 100
  return `${currency}${n.toLocaleString('en-IN')}`
}

// Total cost + item count of one clothes entry
export function clothesEntryTotal(entry) {
  let cost = 0
  let count = 0
  if (entry?.s === 'y') {
    Object.values(entry.items || {}).forEach((it) => {
      cost += it.price * it.count
      count += it.count
    })
  }
  return { cost, count }
}
