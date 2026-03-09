-- ユーザープロファイル（auth.users と連動）
create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'partner' check (role in ('admin', 'partner')),
  partner_id uuid references public.partners (id),
  display_name text,
  created_at timestamptz not null default now()
);

-- 既存partnersにauth連携カラム追加
alter table public.partners add column auth_user_id uuid unique references auth.users (id);

-- admin判定ヘルパー（RLS自己参照の無限再帰を回避）
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS
alter table public.user_profiles enable row level security;
create policy "Users read own" on public.user_profiles for select using (auth.uid() = id);
create policy "Admin read all" on public.user_profiles for select using (public.is_admin());
create policy "Service insert" on public.user_profiles for insert with check (true);
create policy "Admin update" on public.user_profiles for update using (public.is_admin());
