import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { EntryRow } from '../components/EntryRow'
import { ReminderToggle } from '../components/ReminderToggle'
import { addDays, formatLong, lookbacks, today } from '../lib/dates'
import { getEntriesBetween, getEntriesByDates } from '../lib/entries'
import { supabase } from '../lib/supabase'
import { moodEmoji, type Entry } from '../lib/types'

export function Home({ session }: { session: Session }) {
  const todayIso = today()
  const lbs = useMemo(() => lookbacks(todayIso), [todayIso])
  const [recent, setRecent] = useState<Entry[]>([])
  const [past, setPast] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getEntriesBetween(addDays(todayIso, -10), todayIso),
      getEntriesByDates(lbs.map((l) => l.date)),
    ])
      .then(([r, p]) => { setRecent(r); setPast(p) })
      .catch((e) => setError(String(e.message ?? e)))
      .finally(() => setLoading(false))
  }, [todayIso, lbs])

  const byDate = (list: Entry[]) => new Map(list.map((e) => [e.entry_date, e]))
  const recentMap = byDate(recent)
  const pastMap = byDate(past)
  const todayEntry = recentMap.get(todayIso)
  const history = Array.from({ length: 10 }, (_, i) => addDays(todayIso, -(i + 1)))
  const foundLookbacks = lbs.filter((l) => pastMap.has(l.date))
  const firstName = (session.user.user_metadata?.full_name as string | undefined)?.split(' ')[0]

  return (
    <main>
      <header className="bar">
        <h1>📔 Tagebuch</h1>
        <div className="header-actions">
          <Link to="/stats" className="header-link">📊 Statistik</Link>
          <button onClick={() => supabase.auth.signOut()}>Abmelden</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="card today">
        <p className="muted">{firstName ? `Hallo ${firstName}, ` : ''}{formatLong(todayIso)}</p>
        {loading ? <p>Lädt…</p> : todayEntry ? (
          <Link to={`/entry/${todayIso}`} className="today-entry">
            <span className="big-emoji">{moodEmoji(todayEntry.mood)}</span>
            <span>{todayEntry.note || 'Ohne Notiz'}</span>
            <span className="muted">Bearbeiten ›</span>
          </Link>
        ) : (
          <Link to={`/entry/${todayIso}`} className="primary button-link">Wie war dein Tag?</Link>
        )}
      </section>

      {!loading && foundLookbacks.length > 0 && (
        <section>
          <h2>Rückblick</h2>
          {foundLookbacks.map((l) => (
            <EntryRow key={l.date} date={l.date} entry={pastMap.get(l.date)} label={l.label} />
          ))}
        </section>
      )}

      <section>
        <h2>Letzte 10 Tage</h2>
        {!loading && history.map((d) => <EntryRow key={d} date={d} entry={recentMap.get(d)} />)}
      </section>

      <section className="card">
        <ReminderToggle />
      </section>
    </main>
  )
}
