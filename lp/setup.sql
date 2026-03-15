create extension if not exists "uuid-ossp";

-- アフィリエイター
create table public.affiliates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  code text not null unique,
  commission_rate numeric(5,2) not null default 10.00,
  is_creator boolean not null default false,
  avatar_url text,
  bio text,
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

-- ========================================
-- 取引先マスタ
-- ========================================
create table public.partners (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  postal_code text,
  address text,
  contract_start_date date,
  payment_terms text,
  memo text,
  partner_type text not null default 'メーカー' check (partner_type in ('メーカー', '代理店')),
  parent_partner_id uuid references public.partners (id),
  certification_number text,
  certification_document_url text,
  certification_status text not null default '未認証' check (certification_status in ('未認証', '認証済み', '期限切れ')),
  certification_expiry date,
  certified_at timestamptz,
  auth_user_id uuid unique,
  invoice_registration_number text,
  invoice_registration_date date,
  created_at timestamptz not null default now(),
  CONSTRAINT chk_invoice_reg_number CHECK (invoice_registration_number IS NULL OR invoice_registration_number ~ '^T\d{13}$')
);

-- ========================================
-- ユーザープロファイル
-- ========================================
create table public.user_profiles (
  id uuid primary key,
  role text not null default 'partner' check (role in ('admin', 'partner', 'buyer')),
  partner_id uuid references public.partners (id),
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
create policy "Users read own" on public.user_profiles for select using (true);
create policy "Service insert" on public.user_profiles for insert with check (true);
create policy "Admin update" on public.user_profiles for update using (true);

-- ========================================
-- 商品マスタ
-- ========================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid references public.partners (id),
  name text not null,
  master_name text,
  description text,
  category1 text,
  category2 text,
  category3 text,
  image_url text,
  image_url2 text,
  image_url3 text,
  image_url4 text,
  image_url5 text,
  jan_code text,
  product_code text,
  country_of_origin text,
  base_price integer not null,
  carton_quantity integer,
  width_mm numeric,
  depth_mm numeric,
  height_mm numeric,
  net_weight_kg numeric,
  gross_weight_kg numeric,
  material text,
  product_page_url text,
  notes text,
  is_new_or_renewal boolean default false,
  stripe_price_id text,
  slug text unique not null,
  is_active boolean not null default true,
  min_order_quantity integer default 1,
  min_order_amount integer,
  order_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_slug on public.products (slug);
create index idx_products_partner_id on public.products (partner_id);

-- ========================================
-- ロット
-- ========================================
create table public.lots (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id),
  lot_number text not null,
  stock integer not null default 0,
  expiration_date date,
  status text not null default '販売中' check (status in ('販売中', '売切れ', '期限切れ')),
  price integer,
  stripe_price_id text,
  purchase_date date,
  purchase_price integer,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, lot_number)
);
create index idx_lots_product_id on public.lots (product_id);

-- ========================================
-- 購入記録（在庫デクリメント冪等性保証用）
-- ========================================
create table public.lot_purchases (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id),
  stripe_session_id text unique not null,
  created_at timestamptz not null default now()
);
create index idx_lot_purchases_lot_id on public.lot_purchases (lot_id);

-- ========================================
-- RLS（商品・ロットは公開SELECT許可）
-- ========================================
alter table public.partners enable row level security;
alter table public.products enable row level security;
alter table public.lots enable row level security;
alter table public.lot_purchases enable row level security;

create policy "Allow public select" on public.partners for select using (true);
create policy "Allow public select" on public.products for select using (true);
create policy "Allow public select" on public.lots for select using (true);
create policy "Allow public insert" on public.lot_purchases for insert with check (true);
create policy "Allow public select" on public.lot_purchases for select using (true);

-- ========================================
-- 在庫デクリメントRPC
-- ========================================
create or replace function public.decrement_lot_stock(p_lot_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_stock integer;
  v_status text;
begin
  select stock, status into v_stock, v_status
  from public.lots
  where id = p_lot_id
  for update;

  if not found then
    return false;
  end if;

  if v_status <> '販売中' or v_stock <= 0 then
    return false;
  end if;

  update public.lots
  set stock = stock - 1,
      status = case when stock - 1 = 0 then '売切れ' else status end,
      updated_at = now()
  where id = p_lot_id;

  return true;
end;
$$;

-- ========================================
-- オークション
-- ========================================
create table public.auctions (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id) unique,
  start_price integer not null,
  buy_now_price integer,
  min_bid_increment integer not null default 100,
  current_price integer not null,
  status text not null default '出品中' check (status in ('出品中', '落札済み', 'キャンセル')),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index idx_auctions_lot_id on public.auctions (lot_id);

-- ========================================
-- 入札
-- ========================================
create table public.bids (
  id uuid primary key default uuid_generate_v4(),
  auction_id uuid not null references public.auctions (id),
  bidder_name text not null,
  bidder_email text not null,
  amount integer not null,
  is_buy_now boolean not null default false,
  buyer_id uuid,
  agent_result_id uuid,
  created_at timestamptz not null default now()
);
create index idx_bids_auction_id on public.bids (auction_id);
create index idx_bids_buyer_id on public.bids (buyer_id);
create index idx_bids_agent_result_id on public.bids (agent_result_id);

-- ========================================
-- RLS（オークション・入札）
-- ========================================
alter table public.auctions enable row level security;
alter table public.bids enable row level security;

create policy "Allow public select" on public.auctions for select using (true);
create policy "Allow public update" on public.auctions for update using (true);
create policy "Allow public insert" on public.auctions for insert with check (true);
create policy "Allow public select" on public.bids for select using (true);
create policy "Allow public insert" on public.bids for insert with check (true);

-- ========================================
-- 入札RPC（原子性保証）
-- ========================================
create or replace function public.place_bid(
  p_auction_id uuid,
  p_bidder_name text,
  p_bidder_email text,
  p_amount integer,
  p_is_buy_now boolean default false,
  p_buyer_id uuid default null,
  p_agent_result_id uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_auction record;
  v_bid_id uuid;
begin
  select * into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'オークションが見つかりません');
  end if;

  if v_auction.status <> '出品中' then
    return jsonb_build_object('success', false, 'error', 'このオークションは終了しています');
  end if;

  if v_auction.ends_at <= now() then
    if v_auction.current_price > v_auction.start_price or exists (
      select 1 from public.bids where auction_id = p_auction_id
    ) then
      update public.auctions set status = '落札済み' where id = p_auction_id;
      return jsonb_build_object('success', false, 'error', 'オークションは終了しました');
    else
      return jsonb_build_object('success', false, 'error', 'オークションは終了しました（入札なし）');
    end if;
  end if;

  if p_is_buy_now then
    if v_auction.buy_now_price is null then
      return jsonb_build_object('success', false, 'error', '即決価格が設定されていません');
    end if;

    insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
    values (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true, p_buyer_id, p_agent_result_id)
    returning id into v_bid_id;

    update public.auctions
    set current_price = v_auction.buy_now_price, status = '落札済み'
    where id = p_auction_id;

    if p_agent_result_id is not null then
      update public.agent_results set status = '確認済み' where id = p_agent_result_id;
    end if;

    return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  end if;

  if p_amount < v_auction.current_price + v_auction.min_bid_increment then
    return jsonb_build_object(
      'success', false,
      'error', format('入札金額は¥%s以上にしてください', (v_auction.current_price + v_auction.min_bid_increment))
    );
  end if;

  if v_auction.buy_now_price is not null and p_amount >= v_auction.buy_now_price then
    insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
    values (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true, p_buyer_id, p_agent_result_id)
    returning id into v_bid_id;

    update public.auctions
    set current_price = v_auction.buy_now_price, status = '落札済み'
    where id = p_auction_id;

    if p_agent_result_id is not null then
      update public.agent_results set status = '確認済み' where id = p_agent_result_id;
    end if;

    return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  end if;

  insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
  values (p_auction_id, p_bidder_name, p_bidder_email, p_amount, false, p_buyer_id, p_agent_result_id)
  returning id into v_bid_id;

  update public.auctions
  set current_price = p_amount
  where id = p_auction_id;

  if p_agent_result_id is not null then
    update public.agent_results set status = '確認済み' where id = p_agent_result_id;
  end if;

  return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', p_amount, 'status', '出品中');
end;
$$;

-- ========================================
-- グループウェア: お知らせ
-- ========================================
create table public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
create policy "Allow public select" on public.announcements for select using (true);
create policy "Allow public insert" on public.announcements for insert with check (true);
create policy "Allow public update" on public.announcements for update using (true);
create policy "Allow public delete" on public.announcements for delete using (true);

-- ========================================
-- グループウェア: メッセージ
-- ========================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null,
  sender_id uuid not null,
  recipient_id uuid not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Allow public select" on public.messages for select using (true);
create policy "Allow public insert" on public.messages for insert with check (true);
create policy "Allow public update" on public.messages for update using (true);

-- ========================================
-- グループウェア: タスク
-- ========================================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default '未着手' check (status in ('未着手', '進行中', '完了')),
  priority text not null default '中' check (priority in ('高', '中', '低')),
  assigned_to uuid,
  assigned_partner_id uuid references public.partners (id),
  due_date date,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Allow public select" on public.tasks for select using (true);
create policy "Allow public insert" on public.tasks for insert with check (true);
create policy "Allow public update" on public.tasks for update using (true);
create policy "Allow public delete" on public.tasks for delete using (true);

-- ========================================
-- グループウェア: ファイル共有
-- ========================================
create table public.shared_files (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  uploaded_by uuid not null,
  partner_id uuid references public.partners (id),
  created_at timestamptz not null default now()
);

alter table public.shared_files enable row level security;
create policy "Allow public select" on public.shared_files for select using (true);
create policy "Allow public insert" on public.shared_files for insert with check (true);
create policy "Allow public delete" on public.shared_files for delete using (true);

-- ========================================
-- 5層証明チェーン
-- ========================================

-- 1. 主体証明
create table public.entity_proofs (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners (id) on delete cascade,
  proof_type text not null check (proof_type in ('生産者署名', '代理店署名', '販売権証明', '事業許可証')),
  document_url text,
  issuer text,
  issued_at timestamptz,
  expires_at timestamptz,
  signature_hash text,
  status text not null default '未検証' check (status in ('未検証', '検証済み', '失効')),
  verified_by uuid,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.entity_proofs enable row level security;
create policy "Allow public select" on public.entity_proofs for select using (true);
create policy "Allow public insert" on public.entity_proofs for insert with check (true);
create policy "Allow public update" on public.entity_proofs for update using (true);
create policy "Allow public delete" on public.entity_proofs for delete using (true);

-- 2. 商品証明
create table public.product_proofs (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  proof_type text not null check (proof_type in ('成分表', 'スペックシート', '試験成績書', '品質証明書')),
  document_url text,
  spec_data jsonb,
  lab_name text,
  tested_at timestamptz,
  valid_until timestamptz,
  status text not null default '未検証' check (status in ('未検証', '検証済み', '失効')),
  verified_by uuid,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.product_proofs enable row level security;
create policy "Allow public select" on public.product_proofs for select using (true);
create policy "Allow public insert" on public.product_proofs for insert with check (true);
create policy "Allow public update" on public.product_proofs for update using (true);
create policy "Allow public delete" on public.product_proofs for delete using (true);

-- 3. 在庫証明（lots拡張 + 検証履歴）
create table public.inventory_proofs (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  verified_stock integer not null,
  warehouse_code text,
  location_detail text,
  verification_method text not null check (verification_method in ('目視', 'バーコード', 'WMS連動', 'IoTセンサー')),
  photo_url text,
  verified_by uuid not null,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.inventory_proofs enable row level security;
create policy "Allow public select" on public.inventory_proofs for select using (true);
create policy "Allow public insert" on public.inventory_proofs for insert with check (true);

-- 4. 所有証明
create table public.ownership_records (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id),
  lot_purchase_id uuid references public.lot_purchases (id),
  auction_id uuid references public.auctions (id),
  from_partner_id uuid references public.partners (id),
  to_entity_type text not null check (to_entity_type in ('partner', 'buyer')),
  to_entity_id text not null,
  to_entity_name text,
  quantity integer not null default 1,
  transfer_type text not null check (transfer_type in ('出品', '購入', '落札', '移管', '返品')),
  stripe_payment_id text,
  transferred_at timestamptz not null default now(),
  tx_hash text,
  status text not null default '確定' check (status in ('仮確定', '確定', '取消')),
  created_at timestamptz not null default now()
);
alter table public.ownership_records enable row level security;
create policy "Allow public select" on public.ownership_records for select using (true);
create policy "Allow public insert" on public.ownership_records for insert with check (true);
create policy "Allow public update" on public.ownership_records for update using (true);

-- 5. 配送証明
create table public.delivery_proofs (
  id uuid primary key default uuid_generate_v4(),
  lot_purchase_id uuid references public.lot_purchases (id),
  ownership_record_id uuid references public.ownership_records (id),
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  received_by text,
  signature_url text,
  photo_url text,
  status text not null default '準備中' check (status in ('準備中', '発送済み', '配達中', '配達完了', '受領確認済み')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.delivery_proofs enable row level security;
create policy "Allow public select" on public.delivery_proofs for select using (true);
create policy "Allow public insert" on public.delivery_proofs for insert with check (true);
create policy "Allow public update" on public.delivery_proofs for update using (true);

-- ========================================
-- タグマスタ
-- ========================================
create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  tag_type text not null default 'キーワード'
    check (tag_type in ('生産者', 'メーカー', 'カテゴリ', 'キーワード')),
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tags_slug on public.tags (slug);
create index idx_tags_tag_type on public.tags (tag_type);

-- ========================================
-- 商品タグ中間テーブル
-- ========================================
create table public.product_tags (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, tag_id)
);
create index idx_product_tags_product_id on public.product_tags (product_id);
create index idx_product_tags_tag_id on public.product_tags (tag_id);

alter table public.tags enable row level security;
alter table public.product_tags enable row level security;

create policy "Allow public select" on public.tags for select using (true);
create policy "Allow public insert" on public.tags for insert with check (true);
create policy "Allow public update" on public.tags for update using (true);
create policy "Allow public delete" on public.tags for delete using (true);

create policy "Allow public select" on public.product_tags for select using (true);
create policy "Allow public insert" on public.product_tags for insert with check (true);
create policy "Allow public delete" on public.product_tags for delete using (true);

-- ========================================
-- 商品属性（成分・特徴）
-- ========================================
create table public.product_attributes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  attribute_name text not null
    check (attribute_name in ('成分', '原材料', '原産地', '製造方法', '特徴', '規格', '認定・規格', 'アレルゲン')),
  attribute_value text not null,
  created_at timestamptz not null default now()
);
create index idx_product_attributes_product on public.product_attributes (product_id);
create index idx_product_attributes_name on public.product_attributes (attribute_name);

alter table public.product_attributes enable row level security;
create policy "Allow public select" on public.product_attributes for select using (true);
create policy "Allow public insert" on public.product_attributes for insert with check (true);
create policy "Allow public delete" on public.product_attributes for delete using (true);

-- ========================================
-- 購買エージェント設定
-- ========================================
create table public.buying_agents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,
  name text not null,
  description text,
  -- 検索条件（その他）
  keyword text,
  target_tag_ids jsonb default '[]'::jsonb,
  min_price integer,
  max_price integer,
  -- 認証関係フィルタ
  require_certified boolean not null default false,
  require_entity_proof boolean not null default false,
  require_product_proof boolean not null default false,
  -- 成分・特徴条件
  spec_requirements jsonb default '[]'::jsonb,
  -- 重み設定
  certification_weight integer not null default 80
    check (certification_weight between 0 and 100),
  proof_chain_weight integer not null default 60
    check (proof_chain_weight between 0 and 100),
  preferred_partner_type text
    check (preferred_partner_type is null or preferred_partner_type in ('メーカー', '代理店')),
  require_in_stock boolean not null default true,
  -- 最低スコアしきい値
  min_total_score numeric(5,2),
  -- 自動入札設定
  auto_bid_enabled boolean not null default false,
  auto_bid_max_price integer,
  status text not null default '有効' check (status in ('有効', '一時停止')),
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_auto_bid_config check (not auto_bid_enabled or auto_bid_max_price is not null)
);
create index idx_buying_agents_owner on public.buying_agents (owner_id);

-- ========================================
-- エージェント実行結果
-- ========================================
create table public.agent_results (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.buying_agents (id) on delete cascade,
  lot_id uuid not null references public.lots (id),
  product_id uuid not null references public.products (id),
  certification_score numeric(5,2) not null default 0,
  proof_chain_score numeric(5,2) not null default 0,
  tag_match_score numeric(5,2) not null default 0,
  price_match_score numeric(5,2) not null default 0,
  spec_match_score numeric(5,2) not null default 0,
  total_score numeric(5,2) not null default 0,
  score_details jsonb default '{}'::jsonb,
  status text not null default '未確認' check (status in ('未確認', '確認済み', '購入済み', '却下')),
  created_at timestamptz not null default now(),
  unique (agent_id, lot_id)
);
create index idx_agent_results_agent on public.agent_results (agent_id);
create index idx_agent_results_total on public.agent_results (total_score desc);

alter table public.buying_agents enable row level security;
alter table public.agent_results enable row level security;

create policy "Allow public select" on public.buying_agents for select using (true);
create policy "Allow public insert" on public.buying_agents for insert with check (true);
create policy "Allow public update" on public.buying_agents for update using (true);
create policy "Allow public delete" on public.buying_agents for delete using (true);

create policy "Allow public select" on public.agent_results for select using (true);
create policy "Allow public insert" on public.agent_results for insert with check (true);
create policy "Allow public update" on public.agent_results for update using (true);

-- ========================================
-- スコアリング RPC
-- ========================================
create or replace function public.run_buying_agent(p_agent_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_agent record;
  v_lot record;
  v_cert_score numeric(5,2);
  v_proof_score numeric(5,2);
  v_tag_score numeric(5,2);
  v_price_score numeric(5,2);
  v_spec_score numeric(5,2);
  v_total numeric(5,2);
  v_weight_sum integer;
  v_tag_weight integer := 50;
  v_price_weight integer := 30;
  v_spec_weight integer := 40;
  v_target_tags text[];
  v_matched_tags integer;
  v_total_target_tags integer;
  v_entity_verified integer;
  v_entity_total integer;
  v_product_verified integer;
  v_product_total integer;
  v_has_inventory boolean;
  v_spec_reqs jsonb;
  v_spec_total integer;
  v_spec_matched integer;
  v_spec_val text;
  v_count integer := 0;
  v_details jsonb;
begin
  select * into v_agent
  from public.buying_agents
  where id = p_agent_id and status = '有効';

  if not found then
    raise exception 'Agent not found or not active';
  end if;

  delete from public.agent_results
  where agent_id = p_agent_id and status = '未確認';

  select array_agg(elem::text)
  into v_target_tags
  from jsonb_array_elements_text(coalesce(v_agent.target_tag_ids, '[]'::jsonb)) as elem;

  v_total_target_tags := coalesce(array_length(v_target_tags, 1), 0);

  v_spec_reqs := coalesce(v_agent.spec_requirements, '[]'::jsonb);
  v_spec_total := jsonb_array_length(v_spec_reqs);

  for v_lot in
    select
      l.id as lot_id, l.product_id, l.price as lot_price, l.stock, l.status as lot_status,
      p.name as product_name, p.description as product_description, p.base_price, p.partner_id,
      pa.certification_status, pa.partner_type, pa.id as pa_id
    from public.lots l
    join public.products p on p.id = l.product_id and p.is_active = true
    left join public.partners pa on pa.id = p.partner_id
    where (not v_agent.require_in_stock or (l.status = '販売中' and l.stock > 0))
      and (v_agent.keyword is null or v_agent.keyword = ''
           or p.name ilike '%' || v_agent.keyword || '%'
           or p.description ilike '%' || v_agent.keyword || '%')
      and (v_agent.min_price is null or coalesce(l.price, p.base_price) >= v_agent.min_price)
      and (v_agent.max_price is null or coalesce(l.price, p.base_price) <= v_agent.max_price)
      and (v_agent.preferred_partner_type is null or pa.partner_type = v_agent.preferred_partner_type)
      and (not v_agent.require_certified or pa.certification_status = '認証済み')
      and (not v_agent.require_entity_proof or exists (
        select 1 from public.entity_proofs ep where ep.partner_id = pa.id and ep.status = '検証済み'))
      and (not v_agent.require_product_proof or exists (
        select 1 from public.product_proofs pp where pp.product_id = p.id and pp.status = '検証済み'))
  loop
    v_cert_score := case v_lot.certification_status
      when '認証済み' then 100 when '未認証' then 30 when '期限切れ' then 10 else 30 end;

    select count(*) filter (where status = '検証済み'), count(*)
    into v_entity_verified, v_entity_total
    from public.entity_proofs where partner_id = v_lot.partner_id;

    select count(*) filter (where status = '検証済み'), count(*)
    into v_product_verified, v_product_total
    from public.product_proofs where product_id = v_lot.product_id;

    select exists(select 1 from public.inventory_proofs where lot_id = v_lot.lot_id)
    into v_has_inventory;

    v_proof_score :=
      (case when v_entity_total > 0 then (v_entity_verified::numeric / v_entity_total) * 100 * 0.3 else 0 end)
      + (case when v_product_total > 0 then (v_product_verified::numeric / v_product_total) * 100 * 0.4 else 0 end)
      + (case when v_has_inventory then 100 * 0.3 else 0 end);

    if v_total_target_tags > 0 then
      select count(*) into v_matched_tags
      from public.product_tags pt
      where pt.product_id = v_lot.product_id and pt.tag_id::text = any(v_target_tags);
      v_tag_score := (v_matched_tags::numeric / v_total_target_tags) * 100;
    else
      v_tag_score := 100;
    end if;

    if v_agent.min_price is not null and v_agent.max_price is not null
       and v_agent.max_price > v_agent.min_price then
      v_price_score := greatest(0, least(100,
        (1 - (coalesce(v_lot.lot_price, v_lot.base_price)::numeric - v_agent.min_price)
             / (v_agent.max_price - v_agent.min_price)) * 100));
    else
      v_price_score := 100;
    end if;

    -- 成分・特徴マッチスコア (product_attributes テーブルで構造的にマッチング)
    if v_spec_total > 0 then
      v_spec_matched := 0;
      for i in 0..v_spec_total - 1 loop
        v_spec_val := v_spec_reqs->i->>'value';
        if v_spec_val is not null and v_spec_val <> '' then
          if exists (
            select 1 from public.product_attributes pa2
            where pa2.product_id = v_lot.product_id
              and pa2.attribute_name = (v_spec_reqs->i->>'label')
              and pa2.attribute_value ilike '%' || v_spec_val || '%'
          ) then
            v_spec_matched := v_spec_matched + 1;
          end if;
        end if;
      end loop;
      v_spec_score := (v_spec_matched::numeric / v_spec_total) * 100;
    else
      v_spec_score := 100;
    end if;

    v_weight_sum := v_agent.certification_weight + v_agent.proof_chain_weight
                    + v_tag_weight + v_price_weight + v_spec_weight;
    v_total := (v_cert_score * v_agent.certification_weight + v_proof_score * v_agent.proof_chain_weight
      + v_tag_score * v_tag_weight + v_price_score * v_price_weight
      + v_spec_score * v_spec_weight) / greatest(v_weight_sum, 1);

    if v_agent.min_total_score is not null and v_total < v_agent.min_total_score then
      continue;
    end if;

    v_details := jsonb_build_object(
      'certification', jsonb_build_object('score', v_cert_score, 'status', v_lot.certification_status),
      'proof_chain', jsonb_build_object('score', v_proof_score,
        'entity_verified', v_entity_verified, 'entity_total', v_entity_total,
        'product_verified', v_product_verified, 'product_total', v_product_total,
        'has_inventory', v_has_inventory),
      'tag_match', jsonb_build_object('score', v_tag_score, 'matched', v_matched_tags, 'total', v_total_target_tags),
      'price_match', jsonb_build_object('score', v_price_score, 'price', coalesce(v_lot.lot_price, v_lot.base_price)),
      'spec_match', jsonb_build_object('score', v_spec_score, 'matched', v_spec_matched, 'total', v_spec_total)
    );

    insert into public.agent_results
      (agent_id, lot_id, product_id, certification_score, proof_chain_score, tag_match_score, price_match_score,
       spec_match_score, total_score, score_details, status)
    values (p_agent_id, v_lot.lot_id, v_lot.product_id,
       v_cert_score, v_proof_score, v_tag_score, v_price_score, v_spec_score, v_total, v_details, '未確認')
    on conflict (agent_id, lot_id) do update set
      product_id = excluded.product_id, certification_score = excluded.certification_score,
      proof_chain_score = excluded.proof_chain_score, tag_match_score = excluded.tag_match_score,
      price_match_score = excluded.price_match_score, spec_match_score = excluded.spec_match_score,
      total_score = excluded.total_score, score_details = excluded.score_details,
      status = '未確認', created_at = now();

    v_count := v_count + 1;
  end loop;

  update public.buying_agents set last_run_at = now(), updated_at = now() where id = p_agent_id;
  return v_count;
end;
$$;

-- ====== 入荷リクエスト ======

create table public.stock_requests (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots(id),
  product_id uuid not null references public.products(id),
  requester_name text not null,
  requester_email text not null,
  quantity integer,
  preferred_price integer,
  notes text,
  status text not null default '新規' check (status in ('新規', '対応中', '完了', '辞退')),
  created_at timestamptz not null default now()
);

create index idx_stock_requests_lot on public.stock_requests (lot_id);
create index idx_stock_requests_product on public.stock_requests (product_id);
create index idx_stock_requests_status on public.stock_requests (status);

alter table public.stock_requests enable row level security;

create policy "Allow public insert" on public.stock_requests for insert with check (true);
create policy "Allow public select" on public.stock_requests for select using (true);
create policy "Allow public update" on public.stock_requests for update using (true);

-- ====== 自動入札ログ ======

create table public.auto_bid_logs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.buying_agents(id) on delete cascade,
  agent_result_id uuid references public.agent_results(id),
  auction_id uuid not null references public.auctions(id),
  bid_id uuid references public.bids(id),
  action text not null check (action in ('入札成功','入札失敗','上限到達')),
  amount integer,
  max_price integer not null,
  message text,
  created_at timestamptz not null default now()
);

create index idx_auto_bid_logs_agent on public.auto_bid_logs (agent_id);
create index idx_auto_bid_logs_auction on public.auto_bid_logs (auction_id);

alter table public.auto_bid_logs enable row level security;

create policy "Agent owners can view own auto bid logs"
  on public.auto_bid_logs for select
  using (
    agent_id in (
      select ba.id from public.buying_agents ba where ba.owner_id = auth.uid()
    )
  );

create policy "Allow service insert auto bid logs"
  on public.auto_bid_logs for insert
  with check (true);

-- auto_bid_for_auction RPC
create or replace function public.auto_bid_for_auction(p_auction_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_auction record;
  v_rec record;
  v_bid_amount integer;
  v_buyer_name text;
  v_buyer_email text;
  v_result jsonb;
  v_count integer := 0;
  v_current_top_buyer uuid;
begin
  select * into v_auction
  from public.auctions
  where id = p_auction_id and status = '出品中';

  if not found then
    return 0;
  end if;

  select buyer_id into v_current_top_buyer
  from public.bids
  where auction_id = p_auction_id
  order by amount desc
  limit 1;

  for v_rec in
    select ar.id as result_id, ar.agent_id, ba.owner_id, ba.auto_bid_max_price
    from public.agent_results ar
    join public.buying_agents ba on ba.id = ar.agent_id
    where ar.lot_id = v_auction.lot_id
      and ba.auto_bid_enabled = true
      and ba.status = '有効'
      and ar.status in ('未確認', '確認済み')
  loop
    if v_current_top_buyer is not null and v_current_top_buyer is not distinct from v_rec.owner_id then
      continue;
    end if;

    select coalesce(up.display_name, au.email), au.email
    into v_buyer_name, v_buyer_email
    from auth.users au
    left join public.user_profiles up on up.id = au.id
    where au.id = v_rec.owner_id;

    if v_buyer_name is null then
      continue;
    end if;

    v_bid_amount := v_auction.current_price + v_auction.min_bid_increment;

    if v_auction.buy_now_price is not null and v_auction.buy_now_price <= v_rec.auto_bid_max_price then
      v_result := public.place_bid(p_auction_id, v_buyer_name, v_buyer_email, 0, true, v_rec.owner_id, v_rec.result_id);
      insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
      values (v_rec.agent_id, v_rec.result_id, p_auction_id, (v_result->>'bid_id')::uuid,
        case when (v_result->>'success')::boolean then '入札成功' else '入札失敗' end,
        v_auction.buy_now_price, v_rec.auto_bid_max_price, coalesce(v_result->>'error', '即決入札'));
      if (v_result->>'success')::boolean then
        return v_count + 1;
      end if;
      continue;
    end if;

    if v_bid_amount > v_rec.auto_bid_max_price then
      insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, action, amount, max_price, message)
      values (v_rec.agent_id, v_rec.result_id, p_auction_id, '上限到達', v_bid_amount, v_rec.auto_bid_max_price,
        format('入札額¥%s が上限¥%s を超過', v_bid_amount, v_rec.auto_bid_max_price));
      continue;
    end if;

    v_result := public.place_bid(p_auction_id, v_buyer_name, v_buyer_email, v_bid_amount, false, v_rec.owner_id, v_rec.result_id);
    insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
    values (v_rec.agent_id, v_rec.result_id, p_auction_id, (v_result->>'bid_id')::uuid,
      case when (v_result->>'success')::boolean then '入札成功' else '入札失敗' end,
      v_bid_amount, v_rec.auto_bid_max_price, coalesce(v_result->>'error', format('¥%s で入札', v_bid_amount)));
    if (v_result->>'success')::boolean then
      v_count := v_count + 1;
      v_current_top_buyer := v_rec.owner_id;
      select current_price into v_auction.current_price from public.auctions where id = p_auction_id;
    end if;
  end loop;

  return v_count;
end;
$$;

-- auto_rebid_for_auction RPC
create or replace function public.auto_rebid_for_auction(p_auction_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_auction record;
  v_rec record;
  v_bid_amount integer;
  v_buyer_name text;
  v_buyer_email text;
  v_result jsonb;
  v_count integer := 0;
  v_current_top_buyer uuid;
begin
  select * into v_auction
  from public.auctions
  where id = p_auction_id and status = '出品中';

  if not found then
    return 0;
  end if;

  select buyer_id into v_current_top_buyer
  from public.bids
  where auction_id = p_auction_id
  order by amount desc
  limit 1;

  for v_rec in
    select distinct on (ba.id)
      ar.id as result_id, ba.id as agent_id, ba.owner_id, ba.auto_bid_max_price
    from public.bids b
    join public.buying_agents ba on ba.owner_id = b.buyer_id
    join public.agent_results ar on ar.agent_id = ba.id and ar.lot_id = v_auction.lot_id
    where b.auction_id = p_auction_id
      and b.buyer_id is not null
      and ba.auto_bid_enabled = true
      and ba.status = '有効'
      and b.buyer_id is distinct from v_current_top_buyer
    order by ba.id
  loop
    select coalesce(up.display_name, au.email), au.email
    into v_buyer_name, v_buyer_email
    from auth.users au
    left join public.user_profiles up on up.id = au.id
    where au.id = v_rec.owner_id;

    if v_buyer_name is null then
      continue;
    end if;

    v_bid_amount := v_auction.current_price + v_auction.min_bid_increment;

    if v_auction.buy_now_price is not null and v_auction.buy_now_price <= v_rec.auto_bid_max_price then
      v_result := public.place_bid(p_auction_id, v_buyer_name, v_buyer_email, 0, true, v_rec.owner_id, v_rec.result_id);
      insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
      values (v_rec.agent_id, v_rec.result_id, p_auction_id, (v_result->>'bid_id')::uuid,
        case when (v_result->>'success')::boolean then '入札成功' else '入札失敗' end,
        v_auction.buy_now_price, v_rec.auto_bid_max_price, coalesce(v_result->>'error', '即決リビッド'));
      if (v_result->>'success')::boolean then
        return v_count + 1;
      end if;
      continue;
    end if;

    if v_bid_amount > v_rec.auto_bid_max_price then
      insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, action, amount, max_price, message)
      values (v_rec.agent_id, v_rec.result_id, p_auction_id, '上限到達', v_bid_amount, v_rec.auto_bid_max_price,
        format('リビッド額¥%s が上限¥%s を超過', v_bid_amount, v_rec.auto_bid_max_price));
      continue;
    end if;

    v_result := public.place_bid(p_auction_id, v_buyer_name, v_buyer_email, v_bid_amount, false, v_rec.owner_id, v_rec.result_id);
    insert into public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
    values (v_rec.agent_id, v_rec.result_id, p_auction_id, (v_result->>'bid_id')::uuid,
      case when (v_result->>'success')::boolean then '入札成功' else '入札失敗' end,
      v_bid_amount, v_rec.auto_bid_max_price, coalesce(v_result->>'error', format('¥%s でリビッド', v_bid_amount)));
    if (v_result->>'success')::boolean then
      v_count := v_count + 1;
      v_current_top_buyer := v_rec.owner_id;
      select current_price into v_auction.current_price from public.auctions where id = p_auction_id;
    end if;
  end loop;

  return v_count;
end;
$$;

-- ====== 引合い管理 ======

create table public.agent_inquiries (
  id uuid primary key default uuid_generate_v4(),
  agent_result_id uuid not null references public.agent_results (id) on delete cascade,
  agent_id uuid not null references public.buying_agents (id) on delete cascade,
  buyer_id uuid not null,
  product_id uuid not null references public.products (id),
  lot_id uuid not null references public.lots (id),
  partner_id uuid not null references public.partners (id),
  total_score numeric(5,2) not null default 0,
  score_details jsonb default '{}'::jsonb,
  -- バイヤー注文情報
  buyer_price integer,
  buyer_quantity integer,
  buyer_notes text,
  partner_status text not null default '新規'
    check (partner_status in ('新規', '対応中', '承諾', '辞退')),
  response_notes text,
  rejection_reason text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_result_id)
);

create index idx_agent_inquiries_partner on public.agent_inquiries (partner_id);
create index idx_agent_inquiries_buyer on public.agent_inquiries (buyer_id);
create index idx_agent_inquiries_agent on public.agent_inquiries (agent_id);
create index idx_agent_inquiries_status on public.agent_inquiries (partner_status);

alter table public.agent_inquiries enable row level security;

create policy "Buyers can view own inquiries"
  on public.agent_inquiries for select
  using (auth.uid() = buyer_id);

create policy "Buyers can insert own inquiries"
  on public.agent_inquiries for insert
  with check (auth.uid() = buyer_id);

create policy "Partners can view own inquiries"
  on public.agent_inquiries for select
  using (
    partner_id in (
      select p.partner_id from public.user_profiles p where p.id = auth.uid()
    )
  );

create policy "Partners can update own inquiries"
  on public.agent_inquiries for update
  using (
    partner_id in (
      select p.partner_id from public.user_profiles p where p.id = auth.uid()
    )
  );

-- ========================================
-- 見積書
-- ========================================
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners(id),
  document_number text not null,
  inquiry_id uuid references public.agent_inquiries(id),
  stock_request_id uuid references public.stock_requests(id),
  buyer_company_name text not null,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text not null,
  issue_date date not null default current_date,
  valid_until date,
  payment_terms text,
  notes text,
  status text not null default '下書き'
    check (status in ('下書き','送付済み','承諾','辞退','期限切れ')),
  subtotal integer not null default 0,
  tax_total integer not null default 0,
  total integer not null default 0,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, document_number)
);

create index idx_quotes_partner_id on public.quotes(partner_id);
create index idx_quotes_status on public.quotes(status);

alter table public.quotes enable row level security;
create policy "Allow public select" on public.quotes for select using (true);
create policy "Allow public insert" on public.quotes for insert with check (true);
create policy "Allow public update" on public.quotes for update using (true);
create policy "Allow public delete" on public.quotes for delete using (true);

-- 見積明細
create table public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  sort_order integer not null default 0,
  product_id uuid references public.products(id),
  lot_id uuid references public.lots(id),
  item_name text not null,
  description text,
  quantity integer not null default 1,
  unit text not null default '個',
  unit_price integer not null,
  tax_rate numeric(5,2) not null default 10.00 check (tax_rate in (10.00, 8.00)),
  amount integer not null,
  tax_amount integer not null,
  created_at timestamptz not null default now()
);

alter table public.quote_items enable row level security;
create policy "Allow public select" on public.quote_items for select using (true);
create policy "Allow public insert" on public.quote_items for insert with check (true);
create policy "Allow public update" on public.quote_items for update using (true);
create policy "Allow public delete" on public.quote_items for delete using (true);

-- ========================================
-- 請求書
-- ========================================
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners(id),
  document_number text not null,
  quote_id uuid references public.quotes(id),
  buyer_company_name text not null,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text not null,
  issue_date date not null default current_date,
  due_date date,
  payment_terms text,
  notes text,
  status text not null default '下書き'
    check (status in ('下書き','送付済み','入金済み','期限超過','取消')),
  subtotal integer not null default 0,
  tax_total integer not null default 0,
  tax_10_total integer not null default 0,
  tax_8_total integer not null default 0,
  total integer not null default 0,
  invoice_registration_number text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, document_number)
);

create index idx_invoices_partner_id on public.invoices(partner_id);
create index idx_invoices_status on public.invoices(status);

alter table public.invoices enable row level security;
create policy "Allow public select" on public.invoices for select using (true);
create policy "Allow public insert" on public.invoices for insert with check (true);
create policy "Allow public update" on public.invoices for update using (true);
create policy "Allow public delete" on public.invoices for delete using (true);

-- 請求明細
create table public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  sort_order integer not null default 0,
  product_id uuid references public.products(id),
  lot_id uuid references public.lots(id),
  item_name text not null,
  description text,
  quantity integer not null default 1,
  unit text not null default '個',
  unit_price integer not null,
  tax_rate numeric(5,2) not null default 10.00 check (tax_rate in (10.00, 8.00)),
  amount integer not null,
  tax_amount integer not null,
  created_at timestamptz not null default now()
);

alter table public.invoice_items enable row level security;
create policy "Allow public select" on public.invoice_items for select using (true);
create policy "Allow public insert" on public.invoice_items for insert with check (true);
create policy "Allow public update" on public.invoice_items for update using (true);
create policy "Allow public delete" on public.invoice_items for delete using (true);

-- ========================================
-- 納品書
-- ========================================
create table public.delivery_slips (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners(id),
  document_number text not null,
  invoice_id uuid references public.invoices(id),
  buyer_company_name text not null,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text not null,
  issue_date date not null default current_date,
  delivery_date date,
  notes text,
  status text not null default '下書き'
    check (status in ('下書き','発行済み')),
  subtotal integer not null default 0,
  tax_total integer not null default 0,
  total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, document_number)
);

create index idx_delivery_slips_partner_id on public.delivery_slips(partner_id);

alter table public.delivery_slips enable row level security;
create policy "Allow public select" on public.delivery_slips for select using (true);
create policy "Allow public insert" on public.delivery_slips for insert with check (true);
create policy "Allow public update" on public.delivery_slips for update using (true);
create policy "Allow public delete" on public.delivery_slips for delete using (true);

-- 納品明細
create table public.delivery_slip_items (
  id uuid primary key default uuid_generate_v4(),
  delivery_slip_id uuid not null references public.delivery_slips(id) on delete cascade,
  sort_order integer not null default 0,
  product_id uuid references public.products(id),
  lot_id uuid references public.lots(id),
  item_name text not null,
  description text,
  quantity integer not null default 1,
  unit text not null default '個',
  unit_price integer not null,
  tax_rate numeric(5,2) not null default 10.00 check (tax_rate in (10.00, 8.00)),
  amount integer not null,
  tax_amount integer not null,
  created_at timestamptz not null default now()
);

alter table public.delivery_slip_items enable row level security;
create policy "Allow public select" on public.delivery_slip_items for select using (true);
create policy "Allow public insert" on public.delivery_slip_items for insert with check (true);
create policy "Allow public update" on public.delivery_slip_items for update using (true);
create policy "Allow public delete" on public.delivery_slip_items for delete using (true);

-- ========================================
-- 書類番号採番RPC
-- ========================================
create or replace function public.next_document_number(p_partner_id uuid, p_doc_type text)
returns text
language plpgsql
as $$
declare
  v_prefix text;
  v_table text;
  v_max_num integer;
  v_next text;
begin
  case p_doc_type
    when 'quote' then v_prefix := 'Q'; v_table := 'quotes';
    when 'invoice' then v_prefix := 'INV'; v_table := 'invoices';
    when 'delivery_slip' then v_prefix := 'DS'; v_table := 'delivery_slips';
    else raise exception 'Unknown doc type: %', p_doc_type;
  end case;

  execute format(
    'SELECT COALESCE(MAX(CAST(split_part(document_number, ''-'', 2) AS integer)), 0) FROM public.%I WHERE partner_id = $1',
    v_table
  ) into v_max_num using p_partner_id;

  v_next := v_prefix || '-' || lpad((v_max_num + 1)::text, 4, '0');
  return v_next;
end;
$$;

-- ========================================
-- グループウェア強化（活動ログ・通知・承認）
-- ========================================

-- 活動ログ
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  partner_id uuid references public.partners(id),
  action_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  description text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;
create policy "Allow all for authenticated" on public.activity_logs for all using (true) with check (true);

-- 通知
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  partner_id uuid references public.partners(id),
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  notification_type text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "Allow all for authenticated" on public.notifications for all using (true) with check (true);

-- 承認ワークフロー
create table public.approvals (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners(id),
  entity_type text not null check (entity_type in ('quote', 'invoice')),
  entity_id uuid not null,
  document_number text not null,
  requested_by uuid not null,
  requested_at timestamptz not null default now(),
  approver_id uuid,
  status text not null default '承認待ち'
    check (status in ('承認待ち', '承認済み', '差戻し')),
  comment text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.approvals enable row level security;
create policy "Allow all for authenticated" on public.approvals for all using (true) with check (true);

-- パートナー招待
create table public.partner_invitations (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references public.partners(id),
  email text not null,
  invited_by uuid not null,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status text not null default '招待中'
    check (status in ('招待中', '登録済み', '期限切れ')),
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

alter table public.partner_invitations enable row level security;
create policy "Allow all for authenticated" on public.partner_invitations for all using (true) with check (true);

-- ========================================
-- アンケート機能
-- ========================================

create table public.surveys (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  target_type text not null default 'general'
    check (target_type in ('general', 'product', 'lot')),
  target_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_surveys_target on public.surveys (target_type, target_id);

alter table public.surveys enable row level security;
create policy "Allow public select" on public.surveys for select using (true);
create policy "Allow public insert" on public.surveys for insert with check (true);
create policy "Allow authenticated update" on public.surveys for update using (true) with check (true);
create policy "Allow authenticated delete" on public.surveys for delete using (true);

create table public.survey_questions (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  sort_order integer not null default 0,
  question_text text not null,
  question_type text not null default 'text'
    check (question_type in ('text', 'radio', 'checkbox', 'rating')),
  options jsonb default '[]'::jsonb,
  is_required boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_survey_questions_survey on public.survey_questions (survey_id);

alter table public.survey_questions enable row level security;
create policy "Allow public select" on public.survey_questions for select using (true);
create policy "Allow public insert" on public.survey_questions for insert with check (true);
create policy "Allow authenticated update" on public.survey_questions for update using (true) with check (true);
create policy "Allow authenticated delete" on public.survey_questions for delete using (true);

create table public.survey_responses (
  id uuid primary key default uuid_generate_v4(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  respondent_name text,
  respondent_email text,
  created_at timestamptz not null default now()
);

create index idx_survey_responses_survey on public.survey_responses (survey_id);

alter table public.survey_responses enable row level security;
create policy "Allow public select" on public.survey_responses for select using (true);
create policy "Allow public insert" on public.survey_responses for insert with check (true);

create table public.survey_answers (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  answer_text text,
  answer_options jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_survey_answers_response on public.survey_answers (response_id);

alter table public.survey_answers enable row level security;
create policy "Allow public select" on public.survey_answers for select using (true);
create policy "Allow public insert" on public.survey_answers for insert with check (true);

-- ========================================
-- 掲示板機能
-- ========================================

create table public.board_threads (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null check (target_type in ('product', 'lot')),
  target_id uuid not null,
  title text not null,
  author_name text not null,
  author_email text,
  created_at timestamptz not null default now()
);

create index idx_board_threads_target on public.board_threads (target_type, target_id);

alter table public.board_threads enable row level security;
create policy "Allow public select" on public.board_threads for select using (true);
create policy "Allow public insert" on public.board_threads for insert with check (true);
create policy "Allow authenticated delete" on public.board_threads for delete using (true);

create table public.board_posts (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.board_threads(id) on delete cascade,
  author_name text not null,
  author_email text,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_board_posts_thread on public.board_posts (thread_id);

alter table public.board_posts enable row level security;
create policy "Allow public select" on public.board_posts for select using (true);
create policy "Allow public insert" on public.board_posts for insert with check (true);
create policy "Allow authenticated delete" on public.board_posts for delete using (true);

-- ========================================
-- Creator LP デザイン
-- ========================================
create table public.creator_lp_designs (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  lot_id uuid references public.lots(id) on delete set null,
  slug text not null,
  design_config jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(affiliate_id, slug, lot_id)
);

create index idx_creator_lp_designs_affiliate on public.creator_lp_designs(affiliate_id);
create index idx_creator_lp_designs_slug on public.creator_lp_designs(slug);

alter table public.creator_lp_designs enable row level security;
create policy "Allow public select published" on public.creator_lp_designs for select using (is_published = true);
create policy "Allow public insert" on public.creator_lp_designs for insert with check (true);
create policy "Allow public update" on public.creator_lp_designs for update using (true);
create policy "Allow public delete" on public.creator_lp_designs for delete using (true);

-- ビューカウント用RPC
create or replace function increment_lp_views(p_design_id uuid)
returns void
language sql
as $$
  update public.creator_lp_designs
  set views_count = views_count + 1
  where id = p_design_id;
$$;

-- ========================================
-- Creator LP コレクション（まとめサイト）
-- ========================================
create table public.creator_lp_collections (
  id uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  cover_image_url text,
  filter_conditions jsonb not null default '{}',
  design_config jsonb not null default '[]',
  theme jsonb not null default '{}',
  is_published boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(affiliate_id, slug)
);

create index idx_creator_lp_collections_affiliate on public.creator_lp_collections(affiliate_id);
create index idx_creator_lp_collections_slug on public.creator_lp_collections(slug);

alter table public.creator_lp_collections enable row level security;
create policy "Allow public select published" on public.creator_lp_collections for select using (is_published = true);
create policy "Allow public insert" on public.creator_lp_collections for insert with check (true);
create policy "Allow public update" on public.creator_lp_collections for update using (true);
create policy "Allow public delete" on public.creator_lp_collections for delete using (true);

-- コレクションビューカウント用RPC
create or replace function increment_collection_views(p_collection_id uuid)
returns void
language sql
as $$
  update public.creator_lp_collections
  set views_count = views_count + 1
  where id = p_collection_id;
$$;
