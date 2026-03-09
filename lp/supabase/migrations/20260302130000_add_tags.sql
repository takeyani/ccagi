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

-- ========================================
-- RLS
-- ========================================
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;

create policy "Allow public select" on public.tags for select using (true);
create policy "Allow public insert" on public.tags for insert with check (true);
create policy "Allow public update" on public.tags for update using (true);
create policy "Allow public delete" on public.tags for delete using (true);

create policy "Allow public select" on public.product_tags for select using (true);
create policy "Allow public insert" on public.product_tags for insert with check (true);
create policy "Allow public delete" on public.product_tags for delete using (true);
