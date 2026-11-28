-- Probe-Benachrichtigung an alle angemeldeten Geräte senden.
-- <CRON_SECRET> durch den Wert des Secrets ersetzen. Antwort danach mit der Abfrage unten ansehen.
select net.http_post(
  url := 'https://zfgwgabzuyfqwxkkssha.supabase.co/functions/v1/send-reminders',
  headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
  body := '{"test": true}'::jsonb
);

-- ein paar Sekunden warten, dann:
select id, status_code, content::text, error_msg, created
from net._http_response order by created desc limit 1;
