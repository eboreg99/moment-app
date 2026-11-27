// Supabase Edge Function: wird stündlich per pg_cron aufgerufen und verschickt Erinnerungen.
// - ab 19:00 Uhr (lokal), wenn der heutige Tag noch nicht erfasst ist
// - ab 07:00 Uhr (lokal), wenn der Vortag nicht erfasst ist
// Jede Erinnerung höchstens einmal pro Tag und Gerät.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const EVENING_HOUR = 19
const MORNING_HOUR = 7
const APP_URL = 'https://eboreg99.github.io/moment-app/'

interface Subscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  timezone: string
  last_evening_sent: string | null
  last_morning_sent: string | null
}

function localParts(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}

function previousDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com',
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*')
  if (error) return new Response(error.message, { status: 500 })

  const results: Record<string, string> = {}

  for (const sub of (subs ?? []) as Subscription[]) {
    let tz = sub.timezone
    try { localParts(tz) } catch { tz = 'Europe/Zurich' }
    const { date, hour } = localParts(tz)
    const yesterday = previousDay(date)

    let kind: 'evening' | 'morning' | null = null
    let checkDate = date
    if (hour >= EVENING_HOUR && sub.last_evening_sent !== date) {
      kind = 'evening'
    } else if (hour >= MORNING_HOUR && hour < EVENING_HOUR && sub.last_morning_sent !== date) {
      kind = 'morning'
      checkDate = yesterday
    }
    if (!kind) continue

    const { count } = await supabase
      .from('entries').select('id', { count: 'exact', head: true })
      .eq('user_id', sub.user_id).eq('entry_date', checkDate)

    const column = kind === 'evening' ? 'last_evening_sent' : 'last_morning_sent'
    if ((count ?? 0) > 0) {
      // Schon erfasst: für heute als erledigt markieren
      await supabase.from('push_subscriptions').update({ [column]: date }).eq('id', sub.id)
      results[sub.id] = `${kind}: already logged`
      continue
    }

    const payload = kind === 'evening'
      ? { title: 'Wie war dein Tag?', body: 'Erfasse kurz deine Stimmung für heute.', url: `${APP_URL}#/entry/${date}` }
      : { title: 'Gestern fehlt noch', body: 'Du hast den gestrigen Tag noch nicht erfasst.', url: `${APP_URL}#/entry/${yesterday}` }

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      )
      await supabase.from('push_subscriptions').update({ [column]: date }).eq('id', sub.id)
      results[sub.id] = `${kind}: sent`
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode
      if (status === 404 || status === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        results[sub.id] = `${kind}: subscription expired, removed`
      } else {
        results[sub.id] = `${kind}: error ${status ?? ''} ${(e as Error).message}`
      }
    }
  }

  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } })
})
