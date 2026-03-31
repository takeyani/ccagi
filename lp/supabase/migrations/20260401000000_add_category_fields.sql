-- 商品カテゴリ別フィールド対応

-- products テーブルにカテゴリテンプレートとカスタムフィールドを追加
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_template_id text,
  ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

COMMENT ON COLUMN public.products.category_template_id IS 'カテゴリテンプレートID（food, hotel, event等）';
COMMENT ON COLUMN public.products.custom_fields IS 'カテゴリ固有のフィールド（JSON）';

-- lots テーブルにもカスタムフィールドを追加（既にType定義済み）
ALTER TABLE public.lots
  ADD COLUMN IF NOT EXISTS category_template_id text,
  ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
