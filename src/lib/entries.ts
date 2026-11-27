import { supabase } from './supabase'
import type { Entry, Mood } from './types'

export async function getEntry(date: string): Promise<Entry | null> {
  const { data, error } = await supabase.from('entries').select('*').eq('entry_date', date).maybeSingle()
  if (error) throw error
  return data as Entry | null
}

export async function getEntriesByDates(dates: string[]): Promise<Entry[]> {
  const { data, error } = await supabase.from('entries').select('*').in('entry_date', dates)
  if (error) throw error
  return (data ?? []) as Entry[]
}

export async function getEntriesBetween(from: string, to: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries').select('*')
    .gte('entry_date', from).lte('entry_date', to)
    .order('entry_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Entry[]
}

export async function saveEntry(date: string, mood: Mood, note: string): Promise<void> {
  const { error } = await supabase
    .from('entries')
    .upsert({ entry_date: date, mood, note }, { onConflict: 'user_id,entry_date' })
  if (error) throw error
}

export async function deleteEntry(date: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('entry_date', date)
  if (error) throw error
}
