# Tagebuch

Tägliche Stimmung (🤩😊☹️😩) und eine kurze Notiz, als PWA für Android und den Browser am PC.

**Technik:** React + TypeScript (Vite), PWA (vite-plugin-pwa), Supabase (Google-Login, Postgres mit Row Level Security).

## Lokal starten

```bash
npm install
cp .env.example .env   # Werte aus Supabase > Project Settings > API eintragen
npm run dev
```

## Supabase einrichten

1. Projekt anlegen (Region eu-central-1).
2. Im SQL-Editor die Dateien in `supabase/migrations/` der Reihe nach ausführen.
3. Google-Login: In der Google Cloud Console einen OAuth-Client (Typ „Webanwendung“) anlegen,
   als Redirect-URI `https://<projekt-id>.supabase.co/auth/v1/callback` eintragen.
   Client-ID und Secret unter Supabase > Authentication > Providers > Google einfügen.
4. Unter Authentication > URL Configuration die App-URL (lokal `http://localhost:5173`, produktiv `https://eboreg99.github.io/moment-app/`) eintragen.

## Erinnerungen einrichten

1. Im SQL-Editor `supabase/migrations/0003_push_subscriptions.sql` ausführen.
2. Edge Functions > Deploy a new function > Via Editor: Name `send-reminders`, Inhalt von
   `supabase/functions/send-reminders/index.ts` einfügen und deployen.
   In den Einstellungen der Funktion **Verify JWT** ausschalten (die Funktion prüft stattdessen `CRON_SECRET`).
3. Edge Functions > Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:…`), `CRON_SECRET` anlegen.
   Der öffentliche VAPID-Key steht zusätzlich als `VITE_VAPID_PUBLIC_KEY` in `.env.production`.
4. `supabase/cron_send_reminders.sql` mit eingesetztem `CRON_SECRET` ausführen (stündlicher Aufruf per pg_cron).
5. In der App unten auf „Erinnerungen > Einschalten“ tippen.

## Deployment

Jeder Push auf `main` baut die App und veröffentlicht sie auf GitHub Pages: https://eboreg99.github.io/moment-app/
Die öffentlichen Supabase-Werte stehen in `.env.production`.

## Plan

1. Grundgerüst: PWA, Supabase, Google-Login, Datenmodell
2. Einträge und Home-Screen (heute, Rückblicke, History)
3. Erinnerungen (19:00 Uhr, ab 7:00 Uhr wenn Vortag leer)
4. Statistiken
