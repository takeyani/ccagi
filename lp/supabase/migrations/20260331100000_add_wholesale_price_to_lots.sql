-- 卸価格（代理店向け）をlotsテーブルに追加
ALTER TABLE public.lots ADD COLUMN wholesale_price integer;
