-- ========================================
-- 購買エージェント機能
-- ========================================

-- 1. user_profiles.role に 'buyer' を追加
alter table public.user_profiles drop constraint if exists user_profiles_role_check;
alter table public.user_profiles add constraint user_profiles_role_check
  check (role in ('admin', 'partner', 'buyer'));

-- ========================================
-- 商品属性（成分・特徴）
-- ========================================
create table public.product_attributes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  attribute_name text not null
    check (attribute_name in ('成分', '原材料', '原産地', '製造方法', '特徴', '規格', '認定・規格', 'アレルゲン')),
  attribute_value text not null,
  created_at timestamptz not null default now()
);
create index idx_product_attributes_product on public.product_attributes (product_id);
create index idx_product_attributes_name on public.product_attributes (attribute_name);

alter table public.product_attributes enable row level security;
create policy "Allow public select" on public.product_attributes for select using (true);
create policy "Allow public insert" on public.product_attributes for insert with check (true);
create policy "Allow public delete" on public.product_attributes for delete using (true);

-- ========================================
-- 購買エージェント設定
-- ========================================
create table public.buying_agents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  -- 検索条件（その他）
  keyword text,
  target_tag_ids jsonb default '[]'::jsonb,
  min_price integer,
  max_price integer,
  -- 認証関係フィルタ
  require_certified boolean not null default false,
  require_entity_proof boolean not null default false,
  require_product_proof boolean not null default false,
  -- 成分・特徴条件
  spec_requirements jsonb default '[]'::jsonb,
  -- 重み設定
  certification_weight integer not null default 80
    check (certification_weight between 0 and 100),
  proof_chain_weight integer not null default 60
    check (proof_chain_weight between 0 and 100),
  -- パートナー種別フィルタ
  preferred_partner_type text
    check (preferred_partner_type is null or preferred_partner_type in ('メーカー', '代理店')),
  -- 在庫必須
  require_in_stock boolean not null default true,
  -- 最低スコアしきい値
  min_total_score numeric(5,2),
  -- ステータス
  status text not null default '有効' check (status in ('有効', '一時停止')),
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_buying_agents_owner on public.buying_agents (owner_id);

-- ========================================
-- エージェント実行結果
-- ========================================
create table public.agent_results (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.buying_agents (id) on delete cascade,
  lot_id uuid not null references public.lots (id),
  product_id uuid not null references public.products (id),
  -- スコア
  certification_score numeric(5,2) not null default 0,
  proof_chain_score numeric(5,2) not null default 0,
  tag_match_score numeric(5,2) not null default 0,
  price_match_score numeric(5,2) not null default 0,
  spec_match_score numeric(5,2) not null default 0,
  total_score numeric(5,2) not null default 0,
  score_details jsonb default '{}'::jsonb,
  -- ステータス
  status text not null default '未確認' check (status in ('未確認', '確認済み', '購入済み', '却下')),
  created_at timestamptz not null default now(),
  unique (agent_id, lot_id)
);
create index idx_agent_results_agent on public.agent_results (agent_id);
create index idx_agent_results_total on public.agent_results (total_score desc);

-- ========================================
-- RLS
-- ========================================
alter table public.buying_agents enable row level security;
alter table public.agent_results enable row level security;

-- buying_agents: オーナーのみ CRUD
create policy "Owner select" on public.buying_agents
  for select using (auth.uid() = owner_id);
create policy "Owner insert" on public.buying_agents
  for insert with check (auth.uid() = owner_id);
create policy "Owner update" on public.buying_agents
  for update using (auth.uid() = owner_id);
create policy "Owner delete" on public.buying_agents
  for delete using (auth.uid() = owner_id);
-- admin は全件閲覧可
create policy "Admin select all" on public.buying_agents
  for select using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- agent_results: エージェントのオーナーのみ
create policy "Owner select results" on public.agent_results
  for select using (
    exists (
      select 1 from public.buying_agents
      where buying_agents.id = agent_results.agent_id
        and buying_agents.owner_id = auth.uid()
    )
  );
create policy "Owner insert results" on public.agent_results
  for insert with check (
    exists (
      select 1 from public.buying_agents
      where buying_agents.id = agent_results.agent_id
        and buying_agents.owner_id = auth.uid()
    )
  );
create policy "Owner update results" on public.agent_results
  for update using (
    exists (
      select 1 from public.buying_agents
      where buying_agents.id = agent_results.agent_id
        and buying_agents.owner_id = auth.uid()
    )
  );
-- admin は全件閲覧可
create policy "Admin select all results" on public.agent_results
  for select using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ========================================
-- スコアリング RPC
-- ========================================
create or replace function public.run_buying_agent(p_agent_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_agent record;
  v_lot record;
  v_cert_score numeric(5,2);
  v_proof_score numeric(5,2);
  v_tag_score numeric(5,2);
  v_price_score numeric(5,2);
  v_spec_score numeric(5,2);
  v_total numeric(5,2);
  v_weight_sum integer;
  v_tag_weight integer := 50;
  v_price_weight integer := 30;
  v_spec_weight integer := 40;
  v_target_tags text[];
  v_matched_tags integer;
  v_total_target_tags integer;
  v_entity_verified integer;
  v_entity_total integer;
  v_product_verified integer;
  v_product_total integer;
  v_has_inventory boolean;
  v_spec_reqs jsonb;
  v_spec_total integer;
  v_spec_matched integer;
  v_spec_val text;
  v_count integer := 0;
  v_details jsonb;
begin
  -- エージェント取得 & オーナー確認
  select * into v_agent
  from public.buying_agents
  where id = p_agent_id
    and owner_id = auth.uid()
    and status = '有効';

  if not found then
    raise exception 'Agent not found or not active';
  end if;

  -- 既存結果をクリア（未確認のみ）
  delete from public.agent_results
  where agent_id = p_agent_id
    and status = '未確認';

  -- target_tag_ids を配列に変換
  select array_agg(elem::text)
  into v_target_tags
  from jsonb_array_elements_text(coalesce(v_agent.target_tag_ids, '[]'::jsonb)) as elem;

  v_total_target_tags := coalesce(array_length(v_target_tags, 1), 0);

  -- spec_requirements 取得
  v_spec_reqs := coalesce(v_agent.spec_requirements, '[]'::jsonb);
  v_spec_total := jsonb_array_length(v_spec_reqs);

  -- ロット走査
  for v_lot in
    select
      l.id as lot_id,
      l.product_id,
      l.price as lot_price,
      l.stock,
      l.status as lot_status,
      p.name as product_name,
      p.description as product_description,
      p.base_price,
      p.partner_id,
      pa.certification_status,
      pa.partner_type
    from public.lots l
    join public.products p on p.id = l.product_id and p.is_active = true
    left join public.partners pa on pa.id = p.partner_id
    where
      -- 在庫フィルタ
      (not v_agent.require_in_stock or (l.status = '販売中' and l.stock > 0))
      -- キーワードフィルタ
      and (v_agent.keyword is null or v_agent.keyword = ''
           or p.name ilike '%' || v_agent.keyword || '%'
           or p.description ilike '%' || v_agent.keyword || '%')
      -- 価格フィルタ
      and (v_agent.min_price is null or coalesce(l.price, p.base_price) >= v_agent.min_price)
      and (v_agent.max_price is null or coalesce(l.price, p.base_price) <= v_agent.max_price)
      -- パートナー種別フィルタ
      and (v_agent.preferred_partner_type is null or pa.partner_type = v_agent.preferred_partner_type)
      -- 認証済みフィルタ（ハード）
      and (not v_agent.require_certified or pa.certification_status = '認証済み')
      -- 主体証明フィルタ（ハード）
      and (not v_agent.require_entity_proof or exists (
        select 1 from public.entity_proofs ep
        where ep.partner_id = pa.id and ep.status = '検証済み'
      ))
      -- 商品証明フィルタ（ハード）
      and (not v_agent.require_product_proof or exists (
        select 1 from public.product_proofs pp
        where pp.product_id = p.id and pp.status = '検証済み'
      ))
  loop
    -- 1. 認証スコア
    v_cert_score := case v_lot.certification_status
      when '認証済み' then 100
      when '未認証' then 30
      when '期限切れ' then 10
      else 30
    end;

    -- 2. 証明チェーンスコア
    select count(*) filter (where status = '検証済み'), count(*)
    into v_entity_verified, v_entity_total
    from public.entity_proofs
    where partner_id = v_lot.partner_id;

    select count(*) filter (where status = '検証済み'), count(*)
    into v_product_verified, v_product_total
    from public.product_proofs
    where product_id = v_lot.product_id;

    select exists(
      select 1 from public.inventory_proofs where lot_id = v_lot.lot_id
    ) into v_has_inventory;

    v_proof_score :=
      (case when v_entity_total > 0
        then (v_entity_verified::numeric / v_entity_total) * 100 * 0.3
        else 0 end)
      + (case when v_product_total > 0
        then (v_product_verified::numeric / v_product_total) * 100 * 0.4
        else 0 end)
      + (case when v_has_inventory then 100 * 0.3 else 0 end);

    -- 3. タグマッチスコア
    if v_total_target_tags > 0 then
      select count(*)
      into v_matched_tags
      from public.product_tags pt
      where pt.product_id = v_lot.product_id
        and pt.tag_id::text = any(v_target_tags);

      v_tag_score := (v_matched_tags::numeric / v_total_target_tags) * 100;
    else
      v_tag_score := 100;
    end if;

    -- 4. 価格マッチスコア
    if v_agent.min_price is not null and v_agent.max_price is not null
       and v_agent.max_price > v_agent.min_price then
      v_price_score := greatest(0, least(100,
        (1 - (coalesce(v_lot.lot_price, v_lot.base_price)::numeric - v_agent.min_price)
             / (v_agent.max_price - v_agent.min_price)) * 100
      ));
    else
      v_price_score := 100;
    end if;

    -- 5. 成分・特徴マッチスコア (product_attributes テーブルで構造的にマッチング)
    if v_spec_total > 0 then
      v_spec_matched := 0;
      for i in 0..v_spec_total - 1 loop
        v_spec_val := v_spec_reqs->i->>'value';
        if v_spec_val is not null and v_spec_val <> '' then
          if exists (
            select 1 from public.product_attributes pa2
            where pa2.product_id = v_lot.product_id
              and pa2.attribute_name = (v_spec_reqs->i->>'label')
              and pa2.attribute_value ilike '%' || v_spec_val || '%'
          ) then
            v_spec_matched := v_spec_matched + 1;
          end if;
        end if;
      end loop;

      v_spec_score := (v_spec_matched::numeric / v_spec_total) * 100;
    else
      v_spec_score := 100;
    end if;

    -- 合計スコア
    v_weight_sum := v_agent.certification_weight + v_agent.proof_chain_weight
                    + v_tag_weight + v_price_weight + v_spec_weight;
    v_total := (
      v_cert_score * v_agent.certification_weight
      + v_proof_score * v_agent.proof_chain_weight
      + v_tag_score * v_tag_weight
      + v_price_score * v_price_weight
      + v_spec_score * v_spec_weight
    ) / greatest(v_weight_sum, 1);

    -- 最低スコアしきい値チェック
    if v_agent.min_total_score is not null and v_total < v_agent.min_total_score then
      continue;
    end if;

    v_details := jsonb_build_object(
      'certification', jsonb_build_object('score', v_cert_score, 'status', v_lot.certification_status),
      'proof_chain', jsonb_build_object('score', v_proof_score,
        'entity_verified', v_entity_verified, 'entity_total', v_entity_total,
        'product_verified', v_product_verified, 'product_total', v_product_total,
        'has_inventory', v_has_inventory),
      'tag_match', jsonb_build_object('score', v_tag_score,
        'matched', v_matched_tags, 'total', v_total_target_tags),
      'price_match', jsonb_build_object('score', v_price_score,
        'price', coalesce(v_lot.lot_price, v_lot.base_price)),
      'spec_match', jsonb_build_object('score', v_spec_score,
        'matched', v_spec_matched, 'total', v_spec_total)
    );

    -- 結果INSERT (UPSERT)
    insert into public.agent_results
      (agent_id, lot_id, product_id,
       certification_score, proof_chain_score, tag_match_score, price_match_score,
       spec_match_score, total_score, score_details, status)
    values
      (p_agent_id, v_lot.lot_id, v_lot.product_id,
       v_cert_score, v_proof_score, v_tag_score, v_price_score,
       v_spec_score, v_total, v_details, '未確認')
    on conflict (agent_id, lot_id) do update set
      product_id = excluded.product_id,
      certification_score = excluded.certification_score,
      proof_chain_score = excluded.proof_chain_score,
      tag_match_score = excluded.tag_match_score,
      price_match_score = excluded.price_match_score,
      spec_match_score = excluded.spec_match_score,
      total_score = excluded.total_score,
      score_details = excluded.score_details,
      status = '未確認',
      created_at = now();

    v_count := v_count + 1;
  end loop;

  -- 最終実行日時更新
  update public.buying_agents
  set last_run_at = now(), updated_at = now()
  where id = p_agent_id;

  return v_count;
end;
$$;
