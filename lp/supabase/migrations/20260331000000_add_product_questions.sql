-- 商品Q&A（メーカー・生産者への質問）
create table public.product_questions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  lot_id uuid references public.lots (id) on delete set null,
  partner_id uuid not null references public.partners (id),
  questioner_name text not null,
  questioner_email text,
  question text not null,
  answer text,
  status text not null default '未回答' check (status in ('未回答', '回答済み')),
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_product_questions_product on public.product_questions (product_id);
create index idx_product_questions_partner on public.product_questions (partner_id);
create index idx_product_questions_status on public.product_questions (status);

alter table public.product_questions enable row level security;
create policy "Allow public select answered" on public.product_questions for select using (status = '回答済み');
create policy "Allow public insert" on public.product_questions for insert with check (true);
create policy "Allow partner select own" on public.product_questions for select using (true);
create policy "Allow partner update own" on public.product_questions for update using (true);
create policy "Admin can manage product_questions" on public.product_questions for all using (public.is_admin());
