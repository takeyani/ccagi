-- ステップメール & メーカー紹介者報酬 マイグレーション

-- 1. ステップメールキャンペーン
create table public.step_mail_campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  trigger_event text not null, -- 'purchase', 'affiliate_signup', 'auction_won', 'inquiry', 'external_purchase', 'external_signup', 'custom'
  trigger_conditions jsonb not null default '{}',
  from_name text not null default 'CCAGI',
  from_email text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. ステップメールステップ
create table public.step_mail_steps (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.step_mail_campaigns(id) on delete cascade,
  step_number integer not null,
  delay_hours integer not null default 0,
  subject text not null,
  body_html text not null,
  body_text text,
  created_at timestamptz not null default now(),
  unique(campaign_id, step_number)
);

-- 3. ステップメール登録
create table public.step_mail_enrollments (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.step_mail_campaigns(id),
  user_email text not null,
  user_name text,
  metadata jsonb not null default '{}',
  current_step integer not null default 0,
  status text not null default 'active' check (status in ('active','paused','completed','unsubscribed','bounced')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(campaign_id, user_email)
);

-- 4. ステップメール配信ログ
create table public.step_mail_logs (
  id uuid primary key default uuid_generate_v4(),
  enrollment_id uuid not null references public.step_mail_enrollments(id) on delete cascade,
  step_id uuid not null references public.step_mail_steps(id) on delete cascade,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','bounced','opened','clicked')),
  resend_message_id text,
  error_message text,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_step_mail_logs_pending on public.step_mail_logs(scheduled_for) where status = 'pending';

-- 5. 外部EC連携用APIキー
create table public.step_mail_api_keys (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  permissions text[] not null default '{events.write}',
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

-- 6. 外部ECイベント
create table public.step_mail_events (
  id uuid primary key default uuid_generate_v4(),
  api_key_id uuid references public.step_mail_api_keys(id),
  event_type text not null,
  event_id text,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processed','failed','ignored')),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique(api_key_id, event_id)
);

-- 7. メーカー紹介者報酬設定
create table public.maker_referral_commissions (
  id uuid primary key default uuid_generate_v4(),
  referrer_affiliate_id uuid not null references public.affiliates(id),
  partner_id uuid not null references public.partners(id),
  commission_rate numeric(5,4) not null default 0.01, -- 1% = 0.01
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(referrer_affiliate_id, partner_id)
);

-- 8. メーカー紹介者報酬履歴
create table public.maker_referral_payouts (
  id uuid primary key default uuid_generate_v4(),
  commission_id uuid not null references public.maker_referral_commissions(id),
  lot_purchase_id uuid not null references public.lot_purchases(id),
  purchase_amount integer not null,
  commission_amount integer not null,
  status text not null default 'pending' check (status in ('pending','approved','paid','cancelled')),
  calculated_at timestamptz not null default now()
);

-- 9. partnersテーブルにメーカー紹介者カラム追加
alter table public.partners add column if not exists referred_by_affiliate_id uuid references public.affiliates(id);

-- 10. RLS有効化
alter table public.step_mail_campaigns enable row level security;
alter table public.step_mail_steps enable row level security;
alter table public.step_mail_enrollments enable row level security;
alter table public.step_mail_logs enable row level security;
alter table public.step_mail_api_keys enable row level security;
alter table public.step_mail_events enable row level security;
alter table public.maker_referral_commissions enable row level security;
alter table public.maker_referral_payouts enable row level security;

-- 11. RLSポリシー（サービスロールのみアクセス）
-- step_mail_campaigns: admin読み取り
create policy "Admin can manage step_mail_campaigns" on public.step_mail_campaigns for all using (public.is_admin());
create policy "Admin can manage step_mail_steps" on public.step_mail_steps for all using (
  exists (select 1 from public.step_mail_campaigns c where c.id = campaign_id and public.is_admin())
);
create policy "Admin can manage step_mail_enrollments" on public.step_mail_enrollments for all using (public.is_admin());
create policy "Admin can manage step_mail_logs" on public.step_mail_logs for all using (public.is_admin());
create policy "Admin can manage step_mail_api_keys" on public.step_mail_api_keys for all using (public.is_admin());
create policy "Admin can manage step_mail_events" on public.step_mail_events for all using (public.is_admin());
create policy "Admin can manage maker_referral_commissions" on public.maker_referral_commissions for all using (public.is_admin());
create policy "Admin can manage maker_referral_payouts" on public.maker_referral_payouts for all using (public.is_admin());

-- 12. Updated_at trigger for campaigns
create trigger step_mail_campaigns_updated_at
  before update on public.step_mail_campaigns
  for each row execute function public.handle_updated_at();
