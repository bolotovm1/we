create extension if not exists pgcrypto;

create table public.app_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_snapshots enable row level security;
create policy "users own snapshots" on public.app_snapshots for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  timezone text not null default 'Europe/Moscow',
  morning_enabled boolean not null default true,
  evening_enabled boolean not null default true,
  last_morning_at date,
  last_evening_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "users own push subscriptions" on public.push_subscriptions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table public.finance_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  cash numeric(18,2) not null,
  assets numeric(18,2) not null,
  liabilities numeric(18,2) not null,
  net_worth numeric(18,2) generated always as (cash+assets-liabilities) stored,
  created_at timestamptz not null default now(),
  unique(user_id,snapshot_date)
);
alter table public.finance_history enable row level security;
create policy "users own finance history" on public.finance_history for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create index app_snapshots_updated_idx on public.app_snapshots(updated_at);
create index push_subscriptions_user_idx on public.push_subscriptions(user_id);
create index finance_history_user_date_idx on public.finance_history(user_id,snapshot_date desc);

-- In Supabase Dashboard enable pg_cron + pg_net, then schedule the function every minute:
-- select cron.schedule('personal-os-push','* * * * *', $$ select net.http_post(
--   url := 'https://PROJECT.supabase.co/functions/v1/send-reminders',
--   headers := jsonb_build_object('Authorization','Bearer ' || current_setting('app.settings.service_role_key')),
--   body := '{}'::jsonb) $$);
