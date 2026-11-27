import { addDays, parseIsoDate, toIsoDate } from './dates'
import type { Entry } from './types'

export interface Streak { length: number; start: string | null; end: string | null }

/** Längste und aktuelle Serie aufeinanderfolgender Tage, die `match` erfüllen. */
export function streaks(entries: Entry[], todayIso: string, match: (e: Entry) => boolean) {
  const dates = new Set(entries.filter(match).map((e) => e.entry_date))
  const sorted = [...dates].sort()
  let longest: Streak = { length: 0, start: null, end: null }
  let runStart: string | null = null
  let prev: string | null = null
  let len = 0
  for (const d of sorted) {
    if (prev && addDays(prev, 1) === d) len++
    else { len = 1; runStart = d }
    if (len > longest.length) longest = { length: len, start: runStart, end: d }
    prev = d
  }
  // Aktuelle Serie: endet heute oder (falls heute noch offen) gestern
  let end = dates.has(todayIso) ? todayIso : addDays(todayIso, -1)
  let current = 0
  while (dates.has(end)) { current++; end = addDays(end, -1) }
  return { current, longest }
}

export type PeriodMode = 'month' | 'year'

export interface Period { mode: PeriodMode; from: string; to: string; label: string }

export function period(mode: PeriodMode, offset: number, todayIso: string): Period {
  const t = parseIsoDate(todayIso)
  if (mode === 'month') {
    const start = new Date(t.getFullYear(), t.getMonth() + offset, 1)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    return {
      mode, from: toIsoDate(start), to: toIsoDate(end),
      label: start.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }),
    }
  }
  const y = t.getFullYear() + offset
  return { mode, from: `${y}-01-01`, to: `${y}-12-31`, label: String(y) }
}

export function datesInRange(from: string, to: string): string[] {
  const out: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
  return out
}

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/** Wochentag 0 = Montag … 6 = Sonntag */
export function weekdayIndex(iso: string): number {
  return (parseIsoDate(iso).getDay() + 6) % 7
}

export function weekdayAverages(entries: Entry[]): { day: string; avg: number | null; count: number }[] {
  const sums = Array(7).fill(0)
  const counts = Array(7).fill(0)
  for (const e of entries) {
    const i = weekdayIndex(e.entry_date)
    sums[i] += e.mood
    counts[i]++
  }
  return WEEKDAYS.map((day, i) => ({ day, avg: counts[i] ? sums[i] / counts[i] : null, count: counts[i] }))
}
