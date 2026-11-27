-- Ein Eintrag pro Benutzer und Tag
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  entry_date  date not null,
  mood        smallint not null check (mood between 1 and 4), -- 1 = 😩, 2 = ☹️, 3 = 😊, 4 = 🤩
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index entries_user_date_idx on public.entries (user_id, entry_date desc);

-- updated_at automatisch setzen
create function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- Jeder sieht und ändert nur seine eigenen Einträge
alter table public.entries enable row level security;

create policy "entries_select_own" on public.entries for select using (auth.uid() = user_id);
create policy "entries_insert_own" on public.entries for insert with check (auth.uid() = user_id);
create policy "entries_update_own" on public.entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "entries_delete_own" on public.entries for delete using (auth.uid() = user_id);
