import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MoodPicker } from '../components/MoodPicker'
import { formatLong, today } from '../lib/dates'
import { deleteEntry, getEntry, saveEntry } from '../lib/entries'
import type { Mood } from '../lib/types'

export function EntryEditor() {
  const params = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState(params.date ?? today())
  const [mood, setMood] = useState<Mood | null>(null)
  const [note, setNote] = useState('')
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getEntry(date)
      .then((e) => {
        if (cancelled) return
        setMood(e?.mood ?? null)
        setNote(e?.note ?? '')
        setExists(Boolean(e))
      })
      .catch((e) => !cancelled && setError(String(e.message ?? e)))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [date])

  const onSave = async () => {
    if (!mood) return
    setSaving(true)
    setError(null)
    try {
      await saveEntry(date, mood, note.trim())
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  const onDelete = async () => {
    setSaving(true)
    try {
      await deleteEntry(date)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  return (
    <main>
      <header className="bar">
        <Link to="/" className="back">‹ Zurück</Link>
      </header>
      <h1>{exists ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h1>

      <label className="field">
        <span>Datum</span>
        <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <small>{formatLong(date)}</small>
      </label>

      {loading ? <p>Lädt…</p> : (
        <>
          <div className="field">
            <span>Stimmung</span>
            <MoodPicker value={mood} onChange={setMood} />
          </div>
          <label className="field">
            <span>Notiz</span>
            <textarea rows={6} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Was war heute los?" />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" onClick={() => navigate('/')} disabled={saving}>Abbrechen</button>
            <button type="button" className="primary" onClick={onSave} disabled={!mood || saving}>
              {saving ? 'Speichert…' : 'Speichern'}
            </button>
          </div>
          {exists && (
            <button type="button" className="danger-link" onClick={onDelete} disabled={saving}>Eintrag löschen</button>
          )}
        </>
      )}
    </main>
  )
}
