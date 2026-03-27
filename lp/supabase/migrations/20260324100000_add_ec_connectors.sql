-- EC連携コネクタテーブル

create table public.ec_connectors (
  id uuid primary key default uuid_generate_v4(),
  connector_type text not null, -- 'next_engine', 'shopify', 'base', 'stores', 'makeshop', 'colorme', 'rakuten', 'yahoo'
  name text not null, -- 表示名（例: "ネクストエンジン本店"）
  credentials jsonb not null default '{}', -- OAuth/API認証情報（client_id, client_secret, access_token, refresh_token）
  settings jsonb not null default '{}', -- コネクタ固有設定
  is_active boolean not null default false,
  last_synced_at timestamptz,
  sync_interval_minutes integer not null default 30, -- 同期間隔（分）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 同期ログ
create table public.ec_connector_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  connector_id uuid not null references public.ec_connectors(id) on delete cascade,
  orders_fetched integer not null default 0,
  events_created integer not null default 0,
  errors text[],
  synced_at timestamptz not null default now()
);

alter table public.ec_connectors enable row level security;
alter table public.ec_connector_sync_logs enable row level security;

create policy "Admin can manage ec_connectors" on public.ec_connectors for all using (public.is_admin());
create policy "Admin can manage ec_connector_sync_logs" on public.ec_connector_sync_logs for all using (public.is_admin());
