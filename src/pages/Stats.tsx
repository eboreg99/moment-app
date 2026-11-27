import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EntryRow } from '../components/EntryRow'
import { Heatmap, MoodLegend, TrendChart, WeekdayChart } from '../components/charts'
import { formatShort, lookbacks, today } from '../lib/dates'
import { getAllEntries } from '../lib/entries'
import { period, streaks, weekdayAverages, type PeriodMode } from '../lib/stats'
import type { Entry } from '../lib/types'

function StatTile({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="tile">
      <span className="tile-value">{value}</span>
      <span className="tile-label">{label}</span>
      {sub && <span className="tile-sub">{sub}</span>}
    </div>
  )
}

const days = (n: number) => (n === 1 ? '1 Tag' : `${n} Tage`)
const range = (s: { start: string | null; end: string | null }) =>
  s.start && s.end ? `${formatShort(s.start)} – ${formatShort(s.end)}` : undefined

export function Stats() {
  const todayIso = today()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<PeriodMode>('month')
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    getAllEntries().then(setEntries).catch((e) => setError(String(e.message ?? e))).finally(() => setLoading(false))
  }, [])

  const p = period(mode, offset, todayIso)
  const inPeriod = useMemo(() => entries.filter((e) => e.entry_date >= p.from && e.entry_date <= p.to), [entries, p.from, p.to])
  const logged = streaks(entries, todayIso, () => true)
  const top = streaks(entries, todayIso, (e) => e.mood === 4)
  const worst = streaks(entries, todayIso, (e) => e.mood === 1)
  const avg = inPeriod.length ? inPeriod.reduce((s, e) => s + e.mood, 0) / inPeriod.length : null
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))
  const lbs = lookbacks(todayIso).filter((l, i) => i < 3 || (entries[0] && l.date >= entries[0].entry_date))

  return (
    <main>
      <header className="bar">
        <Link to="/" className="back">‹ Zurück</Link>
      </header>
      <h1>Statistik</h1>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Lädt…</p> : (
        <>
          <h2>Serien</h2>
          <div className="tiles">
            <StatTile value={days(logged.current)} label="Aktuell erfasst in Folge" />
            <StatTile value={days(logged.longest.length)} label="Längste Serie erfasst" sub={range(logged.longest)} />
            <StatTile value={days(top.longest.length)} label="Längste Serie 🤩" sub={top.current ? `aktuell ${days(top.current)}` : range(top.longest)} />
            <StatTile value={days(worst.longest.length)} label="Längste Serie 😩" sub={worst.current ? `aktuell ${days(worst.current)}` : range(worst.longest)} />
          </div>

          <div className="period">
            <div className="segmented" role="tablist">
              <button role="tab" aria-selected={mode === 'month'} className={mode === 'month' ? 'on' : ''} onClick={() => { setMode('month'); setOffset(0) }}>Monat</button>
              <button role="tab" aria-selected={mode === 'year'} className={mode === 'year' ? 'on' : ''} onClick={() => { setMode('year'); setOffset(0) }}>Jahr</button>
            </div>
            <div className="stepper">
              <button aria-label="Zurück" onClick={() => setOffset(offset - 1)}>‹</button>
              <span>{p.label}</span>
              <button aria-label="Weiter" onClick={() => setOffset(offset + 1)} disabled={offset >= 0}>›</button>
            </div>
          </div>
          <p className="muted small">
            {inPeriod.length} {inPeriod.length === 1 ? 'Eintrag' : 'Einträge'}{avg !== null ? ` · Ø ${avg.toFixed(2)}` : ''}
          </p>

          <h2>Verlauf</h2>
          <TrendChart entries={inPeriod} from={p.from} to={p.to} />

          <h2>Ø pro Wochentag</h2>
          <WeekdayChart data={weekdayAverages(inPeriod)} />

          <h2>Heatmap</h2>
          <Heatmap entries={inPeriod} from={p.from} to={p.to} mode={mode} />
          <MoodLegend />

          <h2>Rückblicke</h2>
          {lbs.map((l) => <EntryRow key={l.date} date={l.date} entry={byDate.get(l.date)} label={l.label} />)}
        </>
      )}
    </main>
  )
}
