export type Mood = 1 | 2 | 3 | 4

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 4, emoji: '🤩', label: 'Super' },
  { value: 3, emoji: '😊', label: 'Gut' },
  { value: 2, emoji: '☹️', label: 'Schlecht' },
  { value: 1, emoji: '😩', label: 'Sehr schlecht' },
]

export interface Entry {
  id: string
  user_id: string
  entry_date: string // YYYY-MM-DD
  mood: Mood
  note: string
  created_at: string
  updated_at: string
}
