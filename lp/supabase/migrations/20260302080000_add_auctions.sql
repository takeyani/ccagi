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
  created_at timestamptz not null default now()
);
create index idx_bids_auction_id on public.bids (auction_id);

-- ========================================
-- RLS
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
  p_is_buy_now boolean default false
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_auction record;
  v_bid_id uuid;
begin
  -- 1. オークション行をロック
  select * into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'オークションが見つかりません');
  end if;

  -- 2. ステータスチェック
  if v_auction.status <> '出品中' then
    return jsonb_build_object('success', false, 'error', 'このオークションは終了しています');
  end if;

  -- 終了時刻チェック（期限切れなら自動で落札済みに）
  if v_auction.ends_at <= now() then
    -- 入札がある場合は落札済みに
    if v_auction.current_price > v_auction.start_price or exists (
      select 1 from public.bids where auction_id = p_auction_id
    ) then
      update public.auctions set status = '落札済み' where id = p_auction_id;
      return jsonb_build_object('success', false, 'error', 'オークションは終了しました');
    else
      return jsonb_build_object('success', false, 'error', 'オークションは終了しました（入札なし）');
    end if;
  end if;

  -- 3. 即決入札の場合
  if p_is_buy_now then
    if v_auction.buy_now_price is null then
      return jsonb_build_object('success', false, 'error', '即決価格が設定されていません');
    end if;

    insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now)
    values (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true)
    returning id into v_bid_id;

    update public.auctions
    set current_price = v_auction.buy_now_price,
        status = '落札済み'
    where id = p_auction_id;

    return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  end if;

  -- 4. 通常入札の入札額チェック
  if p_amount < v_auction.current_price + v_auction.min_bid_increment then
    return jsonb_build_object(
      'success', false,
      'error', format('入札金額は¥%s以上にしてください', (v_auction.current_price + v_auction.min_bid_increment))
    );
  end if;

  -- 即決価格以上の入札は即決扱い
  if v_auction.buy_now_price is not null and p_amount >= v_auction.buy_now_price then
    insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now)
    values (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true)
    returning id into v_bid_id;

    update public.auctions
    set current_price = v_auction.buy_now_price,
        status = '落札済み'
    where id = p_auction_id;

    return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  end if;

  -- 5. 通常入札
  insert into public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now)
  values (p_auction_id, p_bidder_name, p_bidder_email, p_amount, false)
  returning id into v_bid_id;

  update public.auctions
  set current_price = p_amount
  where id = p_auction_id;

  return jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', p_amount, 'status', '出品中');
end;
$$;
