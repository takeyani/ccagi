-- ========================================
-- 引合い管理機能
-- ========================================

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
