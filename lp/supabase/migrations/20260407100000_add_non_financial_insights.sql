-- 非財務インサイト（顧客の感謝・感動・選択理由を蓄積）
create table if not exists public.non_financial_insights (
  id uuid primary key default uuid_generate_v4(),
  source_type text not null check (source_type in ('survey', 'review', 'inquiry', 'interview', 'manual')),
  source_id uuid,
  category text not null check (category in ('gratitude', 'emotion', 'choice_reason', 'goal', 'other')),
  partner_id uuid references public.partners(id),
  product_id uuid references public.products(id),
  customer_segment text,
  content text not null,
  summary text,
  tags text[] default '{}',
  sentiment_score numeric(3,2),
  metadata jsonb default '{}',
  -- embedding vector(1536), -- pgvector有効化時にアンコメント
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nfi_category on public.non_financial_insights (category);
create index if not exists idx_nfi_partner on public.non_financial_insights (partner_id);
create index if not exists idx_nfi_product on public.non_financial_insights (product_id);
create index if not exists idx_nfi_source on public.non_financial_insights (source_type, source_id);
create index if not exists idx_nfi_tags on public.non_financial_insights using gin (tags);

alter table public.non_financial_insights enable row level security;
create policy "Anyone can read non_financial_insights" on public.non_financial_insights for select using (true);
create policy "Anyone can insert non_financial_insights" on public.non_financial_insights for insert with check (true);
