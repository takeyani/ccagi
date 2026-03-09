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

-- ビューカウント用RPC
create or replace function increment_collection_views(p_collection_id uuid)
returns void
language sql
as $$
  update public.creator_lp_collections
  set views_count = views_count + 1
  where id = p_collection_id;
$$;
