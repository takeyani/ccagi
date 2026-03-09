-- buying_agents に自動入札設定を追加
ALTER TABLE public.buying_agents
  ADD COLUMN auto_bid_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN auto_bid_max_price integer;

ALTER TABLE public.buying_agents
  ADD CONSTRAINT check_auto_bid_config
  CHECK (NOT auto_bid_enabled OR auto_bid_max_price IS NOT NULL);

-- 自動入札ログテーブル
CREATE TABLE public.auto_bid_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL REFERENCES public.buying_agents(id) ON DELETE CASCADE,
  agent_result_id uuid REFERENCES public.agent_results(id),
  auction_id uuid NOT NULL REFERENCES public.auctions(id),
  bid_id uuid REFERENCES public.bids(id),
  action text NOT NULL CHECK (action IN ('入札成功','入札失敗','上限到達')),
  amount integer,
  max_price integer NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auto_bid_logs_agent ON public.auto_bid_logs (agent_id);
CREATE INDEX idx_auto_bid_logs_auction ON public.auto_bid_logs (auction_id);

ALTER TABLE public.auto_bid_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent owners can view own auto bid logs"
  ON public.auto_bid_logs FOR SELECT
  USING (
    agent_id IN (
      SELECT ba.id FROM public.buying_agents ba WHERE ba.owner_id = auth.uid()
    )
  );

-- 新規 RPC: auto_bid_for_auction
-- オークション作成時に呼ばれる。対象ロットにマッチするエージェント（auto_bid_enabled=true）から自動入札
CREATE OR REPLACE FUNCTION public.auto_bid_for_auction(p_auction_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction record;
  v_rec record;
  v_bid_amount integer;
  v_buyer_name text;
  v_buyer_email text;
  v_result jsonb;
  v_count integer := 0;
  v_current_top_buyer uuid;
BEGIN
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id AND status = '出品中';

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- 現在の最高入札者を取得（自己競り防止）
  SELECT buyer_id INTO v_current_top_buyer
  FROM public.bids
  WHERE auction_id = p_auction_id
  ORDER BY amount DESC
  LIMIT 1;

  -- 対象ロットにマッチするエージェント結果を走査
  FOR v_rec IN
    SELECT ar.id AS result_id, ar.agent_id, ba.owner_id, ba.auto_bid_max_price
    FROM public.agent_results ar
    JOIN public.buying_agents ba ON ba.id = ar.agent_id
    WHERE ar.lot_id = v_auction.lot_id
      AND ba.auto_bid_enabled = true
      AND ba.status = '有効'
      AND ar.status IN ('未確認', '確認済み')
  LOOP
    -- 自己競り防止
    IF v_current_top_buyer IS NOT NULL AND v_current_top_buyer IS NOT DISTINCT FROM v_rec.owner_id THEN
      CONTINUE;
    END IF;

    -- バイヤー情報取得
    SELECT
      COALESCE(up.display_name, au.email),
      au.email
    INTO v_buyer_name, v_buyer_email
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON up.id = au.id
    WHERE au.id = v_rec.owner_id;

    IF v_buyer_name IS NULL THEN
      CONTINUE;
    END IF;

    -- 入札額計算
    v_bid_amount := v_auction.current_price + v_auction.min_bid_increment;

    -- 即決価格が予算内なら即決
    IF v_auction.buy_now_price IS NOT NULL AND v_auction.buy_now_price <= v_rec.auto_bid_max_price THEN
      v_result := public.place_bid(
        p_auction_id, v_buyer_name, v_buyer_email, 0, true,
        v_rec.owner_id, v_rec.result_id
      );

      INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
      VALUES (
        v_rec.agent_id, v_rec.result_id, p_auction_id,
        (v_result->>'bid_id')::uuid,
        CASE WHEN (v_result->>'success')::boolean THEN '入札成功' ELSE '入札失敗' END,
        v_auction.buy_now_price, v_rec.auto_bid_max_price,
        COALESCE(v_result->>'error', '即決入札')
      );

      IF (v_result->>'success')::boolean THEN
        v_count := v_count + 1;
        -- 即決なのでオークション終了、以降の入札はスキップ
        RETURN v_count;
      END IF;
      CONTINUE;
    END IF;

    -- 上限チェック
    IF v_bid_amount > v_rec.auto_bid_max_price THEN
      INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, action, amount, max_price, message)
      VALUES (v_rec.agent_id, v_rec.result_id, p_auction_id, '上限到達', v_bid_amount, v_rec.auto_bid_max_price,
        format('入札額¥%s が上限¥%s を超過', v_bid_amount, v_rec.auto_bid_max_price));
      CONTINUE;
    END IF;

    -- 通常入札
    v_result := public.place_bid(
      p_auction_id, v_buyer_name, v_buyer_email, v_bid_amount, false,
      v_rec.owner_id, v_rec.result_id
    );

    INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
    VALUES (
      v_rec.agent_id, v_rec.result_id, p_auction_id,
      (v_result->>'bid_id')::uuid,
      CASE WHEN (v_result->>'success')::boolean THEN '入札成功' ELSE '入札失敗' END,
      v_bid_amount, v_rec.auto_bid_max_price,
      COALESCE(v_result->>'error', format('¥%s で入札', v_bid_amount))
    );

    IF (v_result->>'success')::boolean THEN
      v_count := v_count + 1;
      -- 最高入札者を更新
      v_current_top_buyer := v_rec.owner_id;
      -- オークション最新価格を再取得
      SELECT current_price INTO v_auction.current_price
      FROM public.auctions WHERE id = p_auction_id;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 新規 RPC: auto_rebid_for_auction
-- 入札成功時に呼ばれる。アウトビッドされたエージェントが自動リビッド
CREATE OR REPLACE FUNCTION public.auto_rebid_for_auction(p_auction_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction record;
  v_rec record;
  v_bid_amount integer;
  v_buyer_name text;
  v_buyer_email text;
  v_result jsonb;
  v_count integer := 0;
  v_current_top_buyer uuid;
BEGIN
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id AND status = '出品中';

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- 現在の最高入札者
  SELECT buyer_id INTO v_current_top_buyer
  FROM public.bids
  WHERE auction_id = p_auction_id
  ORDER BY amount DESC
  LIMIT 1;

  -- 過去にこのオークションに入札したがアウトビッドされたエージェントを対象
  FOR v_rec IN
    SELECT DISTINCT ON (ba.id)
      ar.id AS result_id, ba.id AS agent_id, ba.owner_id, ba.auto_bid_max_price
    FROM public.bids b
    JOIN public.buying_agents ba ON ba.owner_id = b.buyer_id
    JOIN public.agent_results ar ON ar.agent_id = ba.id AND ar.lot_id = v_auction.lot_id
    WHERE b.auction_id = p_auction_id
      AND b.buyer_id IS NOT NULL
      AND ba.auto_bid_enabled = true
      AND ba.status = '有効'
      AND b.buyer_id IS DISTINCT FROM v_current_top_buyer
    ORDER BY ba.id
  LOOP
    -- バイヤー情報取得
    SELECT
      COALESCE(up.display_name, au.email),
      au.email
    INTO v_buyer_name, v_buyer_email
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON up.id = au.id
    WHERE au.id = v_rec.owner_id;

    IF v_buyer_name IS NULL THEN
      CONTINUE;
    END IF;

    -- 入札額計算
    v_bid_amount := v_auction.current_price + v_auction.min_bid_increment;

    -- 即決価格が予算内なら即決
    IF v_auction.buy_now_price IS NOT NULL AND v_auction.buy_now_price <= v_rec.auto_bid_max_price THEN
      v_result := public.place_bid(
        p_auction_id, v_buyer_name, v_buyer_email, 0, true,
        v_rec.owner_id, v_rec.result_id
      );

      INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
      VALUES (
        v_rec.agent_id, v_rec.result_id, p_auction_id,
        (v_result->>'bid_id')::uuid,
        CASE WHEN (v_result->>'success')::boolean THEN '入札成功' ELSE '入札失敗' END,
        v_auction.buy_now_price, v_rec.auto_bid_max_price,
        COALESCE(v_result->>'error', '即決リビッド')
      );

      IF (v_result->>'success')::boolean THEN
        RETURN v_count + 1;
      END IF;
      CONTINUE;
    END IF;

    -- 上限チェック
    IF v_bid_amount > v_rec.auto_bid_max_price THEN
      INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, action, amount, max_price, message)
      VALUES (v_rec.agent_id, v_rec.result_id, p_auction_id, '上限到達', v_bid_amount, v_rec.auto_bid_max_price,
        format('リビッド額¥%s が上限¥%s を超過', v_bid_amount, v_rec.auto_bid_max_price));
      CONTINUE;
    END IF;

    -- 通常リビッド
    v_result := public.place_bid(
      p_auction_id, v_buyer_name, v_buyer_email, v_bid_amount, false,
      v_rec.owner_id, v_rec.result_id
    );

    INSERT INTO public.auto_bid_logs (agent_id, agent_result_id, auction_id, bid_id, action, amount, max_price, message)
    VALUES (
      v_rec.agent_id, v_rec.result_id, p_auction_id,
      (v_result->>'bid_id')::uuid,
      CASE WHEN (v_result->>'success')::boolean THEN '入札成功' ELSE '入札失敗' END,
      v_bid_amount, v_rec.auto_bid_max_price,
      COALESCE(v_result->>'error', format('¥%s でリビッド', v_bid_amount))
    );

    IF (v_result->>'success')::boolean THEN
      v_count := v_count + 1;
      v_current_top_buyer := v_rec.owner_id;
      SELECT current_price INTO v_auction.current_price
      FROM public.auctions WHERE id = p_auction_id;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;
