-- 配送方法・配送料をlotsテーブルに追加
ALTER TABLE public.lots ADD COLUMN shipping_method text NOT NULL DEFAULT 'メーカー無料'
  CHECK (shipping_method IN ('メーカー無料', '配送会社手配', 'ユーザー指定'));
ALTER TABLE public.lots ADD COLUMN shipping_fee integer NOT NULL DEFAULT 0;
