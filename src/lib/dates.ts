/** Lokales Datum als YYYY-MM-DD */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): string {
  return toIsoDate(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso)
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}

/** Monate abziehen; am Monatsende wird auf den letzten gültigen Tag gekürzt (31.3. - 1 Monat = 28./29.2.) */
export function subMonths(iso: string, months: number): string {
  const d = parseIsoDate(iso)
  const target = new Date(d.getFullYear(), d.getMonth() - months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(d.getDate(), lastDay))
  return toIsoDate(target)
}

export function formatLong(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('de-CH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function formatShort(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

export interface Lookback { label: string; date: string }

/** Rückblicke: vor 1 Monat, 6 Monaten, 1 Jahr, 2 Jahren … (bis 10 Jahre) */
export function lookbacks(iso: string): Lookback[] {
  const list: Lookback[] = [
    { label: 'Vor 1 Monat', date: subMonths(iso, 1) },
    { label: 'Vor 6 Monaten', date: subMonths(iso, 6) },
    { label: 'Vor 1 Jahr', date: subMonths(iso, 12) },
  ]
  for (let y = 2; y <= 10; y++) list.push({ label: `Vor ${y} Jahren`, date: subMonths(iso, 12 * y) })
  return list
}
