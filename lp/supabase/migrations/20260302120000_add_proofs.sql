-- =============================================
-- 1. 主体証明 (Entity/Authority Proof)
--    「誰が」作ったか、売る権限があるか
-- =============================================
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
  verified_by uuid references auth.users (id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.entity_proofs enable row level security;
create policy "Allow select" on public.entity_proofs for select using (true);
create policy "Allow insert" on public.entity_proofs for insert with check (true);
create policy "Allow update" on public.entity_proofs for update using (true);
create policy "Allow delete" on public.entity_proofs for delete using (true);

-- =============================================
-- 2. 商品証明 (Product Proof)
--    「何が」含まれているか、品質は確かか
-- =============================================
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
  verified_by uuid references auth.users (id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.product_proofs enable row level security;
create policy "Allow select" on public.product_proofs for select using (true);
create policy "Allow insert" on public.product_proofs for insert with check (true);
create policy "Allow update" on public.product_proofs for update using (true);
create policy "Allow delete" on public.product_proofs for delete using (true);

-- =============================================
-- 3. 在庫証明 (Inventory Proof)
--    「どこに」実在するか、期限はいつか
-- =============================================

-- lots テーブルに倉庫情報を追加
alter table public.lots add column warehouse_code text;
alter table public.lots add column warehouse_name text;
alter table public.lots add column location_detail text;
alter table public.lots add column last_verified_at timestamptz;
alter table public.lots add column last_verified_by uuid references auth.users (id);

-- 在庫検証履歴
create table public.inventory_proofs (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  verified_stock integer not null,
  warehouse_code text,
  location_detail text,
  verification_method text not null check (verification_method in ('目視', 'バーコード', 'WMS連動', 'IoTセンサー')),
  photo_url text,
  verified_by uuid not null references auth.users (id),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.inventory_proofs enable row level security;
create policy "Allow select" on public.inventory_proofs for select using (true);
create policy "Allow insert" on public.inventory_proofs for insert with check (true);

-- =============================================
-- 4. 所有証明 (Ownership Proof)
--    「誰のものか」 決済完了→権利即時移転
-- =============================================
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
create policy "Allow select" on public.ownership_records for select using (true);
create policy "Allow insert" on public.ownership_records for insert with check (true);
create policy "Allow update" on public.ownership_records for update using (true);

-- =============================================
-- 5. 配送証明 (Delivery Proof)
--    「届いたか」 物理着地→取引最終完了
-- =============================================
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
create policy "Allow select" on public.delivery_proofs for select using (true);
create policy "Allow insert" on public.delivery_proofs for insert with check (true);
create policy "Allow update" on public.delivery_proofs for update using (true);

-- =============================================
-- トランザクション完了RPC
-- 配達確認 → 所有権確定 → 取引完了
-- =============================================
create or replace function public.confirm_delivery(
  p_delivery_id uuid,
  p_received_by text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_delivery record;
  v_ownership record;
begin
  select * into v_delivery
  from public.delivery_proofs
  where id = p_delivery_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', '配送記録が見つかりません');
  end if;

  if v_delivery.status = '受領確認済み' then
    return jsonb_build_object('success', false, 'error', '既に受領確認済みです');
  end if;

  -- 配送ステータスを受領確認済みに
  update public.delivery_proofs
  set status = '受領確認済み',
      delivered_at = coalesce(v_delivery.delivered_at, now()),
      received_by = p_received_by,
      updated_at = now()
  where id = p_delivery_id;

  -- 関連する所有権レコードを確定
  if v_delivery.ownership_record_id is not null then
    update public.ownership_records
    set status = '確定'
    where id = v_delivery.ownership_record_id
      and status = '仮確定';
  end if;

  return jsonb_build_object('success', true, 'delivery_id', p_delivery_id, 'status', '受領確認済み');
end;
$$;
