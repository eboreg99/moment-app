-- Stündlicher Aufruf der Edge Function "send-reminders".
-- <CRON_SECRET> durch denselben Wert ersetzen, der als Secret CRON_SECRET in Supabase hinterlegt ist.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-reminders',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://zfgwgabzuyfqwxkkssha.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
    body := '{}'::jsonb
  );
  $$
);
