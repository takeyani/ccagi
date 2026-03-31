-- ASPアフィリエイトサービス（外部サイト連携）

create table public.asp_advertisers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text not null,
  api_key text unique not null,
  api_secret text not null,
  commission_rate numeric(5,2) not null default 5.00,
  cookie_days integer not null default 30,
  status text not null default '有効' check (status in ('有効', '審査中', '停止')),
  contact_email text not null,
  webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_asp_advertisers_api_key on public.asp_advertisers (api_key);

create table public.asp_programs (
  id uuid primary key default uuid_generate_v4(),
  advertiser_id uuid not null references public.asp_advertisers (id) on delete cascade,
  name text not null,
  description text,
  landing_url text not null,
  commission_type text not null default '成果報酬' check (commission_type in ('成果報酬', 'クリック報酬', 'リード報酬')),
  commission_amount integer not null default 0,
  commission_rate numeric(5,2),
  status text not null default '募集中' check (status in ('募集中', '停止', '終了')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_asp_programs_advertiser on public.asp_programs (advertiser_id);

create table public.asp_conversions (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references public.asp_programs (id),
  affiliate_code text not null references public.affiliates (code),
  click_id text unique not null,
  order_id text,
  amount integer not null default 0,
  commission integer not null default 0,
  status text not null default '発生' check (status in ('発生', '承認', '却下', '支払済み')),
  converted_at timestamptz not null default now(),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_asp_conversions_program on public.asp_conversions (program_id);
create index idx_asp_conversions_affiliate on public.asp_conversions (affiliate_code);
create index idx_asp_conversions_click on public.asp_conversions (click_id);

create table public.asp_clicks (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references public.asp_programs (id),
  affiliate_code text not null,
  click_id text unique not null,
  referrer_url text,
  landing_url text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_asp_clicks_click_id on public.asp_clicks (click_id);

alter table public.asp_advertisers enable row level security;
alter table public.asp_programs enable row level security;
alter table public.asp_conversions enable row level security;
alter table public.asp_clicks enable row level security;
create policy "Admin can manage asp_advertisers" on public.asp_advertisers for all using (public.is_admin());
create policy "Admin can manage asp_programs" on public.asp_programs for all using (public.is_admin());
create policy "Admin can manage asp_conversions" on public.asp_conversions for all using (public.is_admin());
create policy "Admin can manage asp_clicks" on public.asp_clicks for all using (public.is_admin());
create policy "Public can select active programs" on public.asp_programs for select using (status = '募集中');
create policy "Public can insert clicks" on public.asp_clicks for insert with check (true);
create policy "Public can insert conversions" on public.asp_conversions for insert with check (true);
