-- Die Edge Function "send-reminders" arbeitet mit der service_role.
-- Neuere Supabase-Projekte vergeben auch dieser Rolle keine Tabellenrechte automatisch.
grant select, insert, update, delete on table public.push_subscriptions to service_role;
grant select on table public.entries to service_role;
