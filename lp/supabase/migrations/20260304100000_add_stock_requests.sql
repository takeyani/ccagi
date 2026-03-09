-- 商品に注文受付条件を追加（メーカー側が設定）
ALTER TABLE public.products
  ADD COLUMN min_order_quantity integer DEFAULT 1,
  ADD COLUMN min_order_amount integer,
  ADD COLUMN order_notes text;

-- 入荷リクエストテーブル
CREATE TABLE public.stock_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id uuid NOT NULL REFERENCES public.lots(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  quantity integer,
  preferred_price integer,
  notes text,
  status text NOT NULL DEFAULT '新規' CHECK (status IN ('新規', '対応中', '完了', '辞退')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_requests_lot ON public.stock_requests (lot_id);
CREATE INDEX idx_stock_requests_product ON public.stock_requests (product_id);
CREATE INDEX idx_stock_requests_status ON public.stock_requests (status);

ALTER TABLE public.stock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.stock_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.stock_requests FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.stock_requests FOR UPDATE USING (true);
