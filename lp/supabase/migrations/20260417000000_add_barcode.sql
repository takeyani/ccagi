-- 商品にバーコード（JAN/EAN）カラムを追加
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode text;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);

-- 購買エージェントにバーコード検索条件を追加
ALTER TABLE public.buying_agents ADD COLUMN IF NOT EXISTS target_barcode text;

-- run_buying_agent RPC にバーコードフィルタを追加
-- 既存RPCを更新: barcode が指定されている場合、そのバーコードの商品のみマッチ
-- （本番適用時はSupabase SQL Editorで実行）
