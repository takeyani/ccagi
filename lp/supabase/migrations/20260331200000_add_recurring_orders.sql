-- 定期購入テーブル
create table public.recurring_orders (
  id uuid primary key default uuid_generate_v4(),
  lot_id uuid not null references public.lots (id),
  product_id uuid not null references public.products (id),
  partner_id uuid references public.partners (id),
  customer_name text not null,
  customer_email text not null,
  frequency text not null check (frequency in ('毎週', '隔週', '毎月', '隔月')),
  quantity integer not null default 1,
  next_delivery_date date not null,
  status text not null default '有効' check (status in ('有効', '一時停止', '解約')),
  stripe_session_id text,
  total_deliveries integer not null default 0,
  affiliate_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_recurring_orders_lot on public.recurring_orders (lot_id);
create index idx_recurring_orders_status on public.recurring_orders (status);
create index idx_recurring_orders_next on public.recurring_orders (next_delivery_date);

alter table public.recurring_orders enable row level security;
create policy "Allow public insert recurring" on public.recurring_orders for insert with check (true);
create policy "Allow public select own recurring" on public.recurring_orders for select using (true);
create policy "Admin can manage recurring" on public.recurring_orders for all using (public.is_admin());
