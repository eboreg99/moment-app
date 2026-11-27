-- Push-Abos pro Gerät/Browser
create table public.push_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade default auth.uid(),
  endpoint           text not null unique,
  p256dh             text not null,
  auth               text not null,
  timezone           text not null default 'Europe/Zurich',
  last_evening_sent  date, -- Datum (lokal), an dem die 19-Uhr-Erinnerung zuletzt verschickt wurde
  last_morning_sent  date, -- Datum (lokal), an dem die 7-Uhr-Erinnerung zuletzt verschickt wurde
  created_at         timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

grant select, insert, update, delete on table public.push_subscriptions to authenticated;

alter table public.push_subscriptions enable row level security;

create policy "push_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_update_own" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);
