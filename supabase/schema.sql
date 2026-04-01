-- HabitPulse Supabase schema
-- Run this script in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Player',
  level integer not null default 1 check (level >= 1),
  experience integer not null default 0 check (experience >= 0),
  strength integer not null default 0 check (strength >= 0),
  agility integer not null default 0 check (agility >= 0),
  inteligent integer not null default 0 check (inteligent >= 0),
  gold numeric not null default 0 check (gold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  dates text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_habit_updated_at on public.habit;
create trigger set_habit_updated_at
before update on public.habit
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.habit enable row level security;

drop policy if exists "Users can manage own profile" on public.profiles;
create policy "Users can manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can manage own habits" on public.habit;
create policy "Users can manage own habits"
on public.habit
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ==============================
-- Idle Game System
-- ==============================

-- Static upgrade definitions (seeded once)
create table if not exists public.idle_upgrades (
  id text primary key,
  name text not null,
  description text,
  base_cost numeric not null default 10 check (base_cost > 0),
  cost_multiplier numeric not null default 1.15 check (cost_multiplier > 1),
  effect_type text not null check (effect_type in ('damage', 'speed', 'critical')),
  effect_value numeric not null default 1 check (effect_value > 0),
  max_level integer default null,
  sort_order integer not null default 0
);

-- Per-user idle game progress
create table if not exists public.idle_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enemy_hp numeric not null default 100 check (enemy_hp >= 0),
  enemy_max_hp numeric not null default 100 check (enemy_max_hp > 0),
  enemy_level integer not null default 1 check (enemy_level >= 1),
  enemies_defeated integer not null default 0 check (enemies_defeated >= 0),
  total_gold_earned numeric not null default 0 check (total_gold_earned >= 0),
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-user purchased upgrade levels
create table if not exists public.user_upgrades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upgrade_id text not null references public.idle_upgrades(id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, upgrade_id)
);

-- Triggers for updated_at
drop trigger if exists set_idle_state_updated_at on public.idle_state;
create trigger set_idle_state_updated_at
before update on public.idle_state
for each row execute function public.set_updated_at();

drop trigger if exists set_user_upgrades_updated_at on public.user_upgrades;
create trigger set_user_upgrades_updated_at
before update on public.user_upgrades
for each row execute function public.set_updated_at();

-- RLS
alter table public.idle_upgrades enable row level security;
alter table public.idle_state enable row level security;
alter table public.user_upgrades enable row level security;

-- idle_upgrades: readable by all authenticated users (static content)
drop policy if exists "Authenticated users can read upgrades" on public.idle_upgrades;
create policy "Authenticated users can read upgrades"
on public.idle_upgrades
for select
using (auth.role() = 'authenticated');

-- idle_state: users can only manage their own
drop policy if exists "Users can manage own idle state" on public.idle_state;
create policy "Users can manage own idle state"
on public.idle_state
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- user_upgrades: users can only manage their own
drop policy if exists "Users can manage own upgrades" on public.user_upgrades;
create policy "Users can manage own upgrades"
on public.user_upgrades
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Seed initial upgrade definitions
insert into public.idle_upgrades (id, name, description, base_cost, cost_multiplier, effect_type, effect_value, sort_order)
values
  ('attack_power', 'Attack Power', 'Increase damage per hit', 10, 1.15, 'damage', 2, 1),
  ('attack_speed', 'Attack Speed', 'Hit faster', 25, 1.20, 'speed', 0.1, 2),
  ('critical_chance', 'Critical Strike', 'Chance for double damage', 50, 1.30, 'critical', 1, 3)
on conflict (id) do nothing;
