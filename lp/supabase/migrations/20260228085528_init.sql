create extension if not exists "uuid-ossp";

-- アフィリエイター
create table public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  code text not null unique,
  commission_rate numeric(5,2) not null default 10.00,
  created_at timestamptz not null default now()
);
create index idx_affiliates_code on public.affiliates (code);

-- 紹介実績
create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  affiliate_code text not null references public.affiliates (code),
  stripe_session_id text not null unique,
  amount integer not null,
  commission integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_referrals_affiliate_code on public.referrals (affiliate_code);

-- 制作依頼
create table public.requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  description text not null,
  budget text not null,
  deadline text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- RLS（公開INSERT/SELECTを許可）
alter table public.affiliates enable row level security;
alter table public.referrals enable row level security;
alter table public.requests enable row level security;

create policy "Allow public insert" on public.affiliates for insert with check (true);
create policy "Allow public select" on public.affiliates for select using (true);
create policy "Allow public insert" on public.referrals for insert with check (true);
create policy "Allow public insert" on public.requests for insert with check (true);
