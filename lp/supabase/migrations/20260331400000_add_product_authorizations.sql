-- 商品承認フロー: メーカー↔代理店/クリエイター間の双方向承認

-- 1. 商品承認テーブル
create table public.product_authorizations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  authorized_party_type text not null check (authorized_party_type in ('代理店', 'クリエイター')),
  authorized_party_id uuid not null,
  status text not null default '申請中' check (status in ('申請中', '承認済み', '却下', '取消')),
  requested_by text not null check (requested_by in ('メーカー', '代理店', 'クリエイター')),
  request_message text,
  response_message text,
  authorized_actions text[] not null default '{販売,LP作成}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, authorized_party_type, authorized_party_id)
);

-- 2. updated_at トリガー
create trigger product_authorizations_updated_at
  before update on public.product_authorizations
  for each row execute function public.handle_updated_at();

-- 3. インデックス
create index idx_product_auth_product on public.product_authorizations(product_id);
create index idx_product_auth_partner on public.product_authorizations(partner_id);
create index idx_product_auth_party on public.product_authorizations(authorized_party_type, authorized_party_id);
create index idx_product_auth_status on public.product_authorizations(status);

-- 4. RLS
alter table public.product_authorizations enable row level security;

-- メーカー（partner_id の所有者）: 自社商品の承認を全操作可能
create policy "partner_auth_select" on public.product_authorizations
  for select using (
    public.is_admin()
    or partner_id = public.get_user_partner_id()
    or (authorized_party_type = '代理店' and authorized_party_id = public.get_user_partner_id())
    or (authorized_party_type = 'クリエイター')
  );

create policy "partner_auth_insert" on public.product_authorizations
  for insert with check (
    public.is_admin()
    or partner_id = public.get_user_partner_id()
    or (authorized_party_type = '代理店' and authorized_party_id = public.get_user_partner_id())
  );

create policy "partner_auth_update" on public.product_authorizations
  for update using (
    public.is_admin()
    or partner_id = public.get_user_partner_id()
    or (authorized_party_type = '代理店' and authorized_party_id = public.get_user_partner_id())
  );

-- シードデータは seed.sql に記載
