import { MOODS, type Mood } from '../lib/types'

export function MoodPicker({ value, onChange }: { value: Mood | null; onChange: (m: Mood) => void }) {
  return (
    <div className="moods" role="radiogroup" aria-label="Stimmung">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value === m.value}
          aria-label={m.label}
          title={m.label}
          className={value === m.value ? 'mood selected' : 'mood'}
          onClick={() => onChange(m.value)}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  )
}
