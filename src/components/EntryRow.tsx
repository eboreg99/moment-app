import { Link } from 'react-router-dom'
import { formatShort } from '../lib/dates'
import { moodEmoji, type Entry } from '../lib/types'

export function EntryRow({ date, entry, label }: { date: string; entry?: Entry; label?: string }) {
  return (
    <Link to={`/entry/${date}`} className="row">
      <span className="row-emoji">{entry ? moodEmoji(entry.mood) : '＋'}</span>
      <span className="row-body">
        <span className="row-date">{label ? `${label} · ${formatShort(date)}` : formatShort(date)}</span>
        <span className="row-note">{entry ? entry.note || 'Ohne Notiz' : 'Noch nicht erfasst'}</span>
      </span>
    </Link>
  )
}
