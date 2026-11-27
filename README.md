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
2. Im SQL-Editor `supabase/migrations/0001_entries.sql` ausführen.
3. Google-Login: In der Google Cloud Console einen OAuth-Client (Typ „Webanwendung“) anlegen,
   als Redirect-URI `https://<projekt-id>.supabase.co/auth/v1/callback` eintragen.
   Client-ID und Secret unter Supabase > Authentication > Providers > Google einfügen.
4. Unter Authentication > URL Configuration die App-URL (lokal `http://localhost:5173`, produktiv `https://eboreg99.github.io/moment-app/`) eintragen.

## Deployment

Jeder Push auf `main` baut die App und veröffentlicht sie auf GitHub Pages: https://eboreg99.github.io/moment-app/
Die Supabase-Werte kommen aus den Repository-Variablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`
(Settings > Secrets and variables > Actions > Variables).

## Plan

1. Grundgerüst: PWA, Supabase, Google-Login, Datenmodell
2. Einträge und Home-Screen (heute, Rückblicke, History)
3. Erinnerungen (19:00 Uhr, ab 7:00 Uhr wenn Vortag leer)
4. Statistiken
