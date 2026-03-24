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
