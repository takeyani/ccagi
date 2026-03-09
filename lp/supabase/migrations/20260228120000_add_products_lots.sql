-- 取引先マスタ
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
  created_at timestamptz not null default now()
);

-- 商品マスタ
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid references public.partners (id),
  name text not null,
  description text,
  image_url text,
  base_price integer not null,
  stripe_price_id text,
  slug text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_slug on public.products (slug);
create index idx_products_partner_id on public.products (partner_id);

-- ロット
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

-- 購入記録（在庫デクリメント冪等性保証用）
create table public.lot_purchases (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id),
  stripe_session_id text unique not null,
  created_at timestamptz not null default now()
);
create index idx_lot_purchases_lot_id on public.lot_purchases (lot_id);

-- RLS
alter table public.partners enable row level security;
alter table public.products enable row level security;
alter table public.lots enable row level security;
alter table public.lot_purchases enable row level security;

create policy "Allow public select" on public.partners for select using (true);
create policy "Allow public select" on public.products for select using (true);
create policy "Allow public select" on public.lots for select using (true);
create policy "Allow public insert" on public.lot_purchases for insert with check (true);
create policy "Allow public select" on public.lot_purchases for select using (true);

-- 在庫デクリメントRPC
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
