-- bids にバイヤーID + エージェント結果リンクを追加
ALTER TABLE public.bids
  ADD COLUMN buyer_id uuid,
  ADD COLUMN agent_result_id uuid REFERENCES public.agent_results(id);
CREATE INDEX idx_bids_buyer_id ON public.bids (buyer_id);
CREATE INDEX idx_bids_agent_result_id ON public.bids (agent_result_id);

-- 旧 place_bid を削除して新しいシグネチャで再作成
DROP FUNCTION IF EXISTS public.place_bid(uuid, text, text, integer, boolean);

CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id uuid,
  p_bidder_name text,
  p_bidder_email text,
  p_amount integer,
  p_is_buy_now boolean default false,
  p_buyer_id uuid default null,
  p_agent_result_id uuid default null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction record;
  v_bid_id uuid;
BEGIN
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'オークションが見つかりません');
  END IF;

  IF v_auction.status <> '出品中' THEN
    RETURN jsonb_build_object('success', false, 'error', 'このオークションは終了しています');
  END IF;

  IF v_auction.ends_at <= now() THEN
    IF v_auction.current_price > v_auction.start_price OR EXISTS (
      SELECT 1 FROM public.bids WHERE auction_id = p_auction_id
    ) THEN
      UPDATE public.auctions SET status = '落札済み' WHERE id = p_auction_id;
      RETURN jsonb_build_object('success', false, 'error', 'オークションは終了しました');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'オークションは終了しました（入札なし）');
    END IF;
  END IF;

  IF p_is_buy_now THEN
    IF v_auction.buy_now_price IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', '即決価格が設定されていません');
    END IF;

    INSERT INTO public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
    VALUES (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true, p_buyer_id, p_agent_result_id)
    RETURNING id INTO v_bid_id;

    UPDATE public.auctions
    SET current_price = v_auction.buy_now_price, status = '落札済み'
    WHERE id = p_auction_id;

    -- エージェント結果ステータス更新
    IF p_agent_result_id IS NOT NULL THEN
      UPDATE public.agent_results SET status = '確認済み' WHERE id = p_agent_result_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  END IF;

  IF p_amount < v_auction.current_price + v_auction.min_bid_increment THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('入札金額は¥%s以上にしてください', (v_auction.current_price + v_auction.min_bid_increment))
    );
  END IF;

  IF v_auction.buy_now_price IS NOT NULL AND p_amount >= v_auction.buy_now_price THEN
    INSERT INTO public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
    VALUES (p_auction_id, p_bidder_name, p_bidder_email, v_auction.buy_now_price, true, p_buyer_id, p_agent_result_id)
    RETURNING id INTO v_bid_id;

    UPDATE public.auctions
    SET current_price = v_auction.buy_now_price, status = '落札済み'
    WHERE id = p_auction_id;

    IF p_agent_result_id IS NOT NULL THEN
      UPDATE public.agent_results SET status = '確認済み' WHERE id = p_agent_result_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', v_auction.buy_now_price, 'status', '落札済み');
  END IF;

  INSERT INTO public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now, buyer_id, agent_result_id)
  VALUES (p_auction_id, p_bidder_name, p_bidder_email, p_amount, false, p_buyer_id, p_agent_result_id)
  RETURNING id INTO v_bid_id;

  UPDATE public.auctions
  SET current_price = p_amount
  WHERE id = p_auction_id;

  -- エージェント結果ステータス更新
  IF p_agent_result_id IS NOT NULL THEN
    UPDATE public.agent_results SET status = '確認済み' WHERE id = p_agent_result_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'bid_id', v_bid_id, 'amount', p_amount, 'status', '出品中');
END;
$$;
