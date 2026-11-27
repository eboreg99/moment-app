-- Neuere Supabase-Projekte vergeben für neue Tabellen keine Rechte mehr automatisch.
-- Angemeldete Benutzer dürfen auf die Tabelle zugreifen; welche Zeilen, regeln die RLS-Policies.
grant select, insert, update, delete on table public.entries to authenticated;
