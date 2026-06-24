-- 年齢確認機能用のカラム追加（MVP: 生年月日自己申告）
-- 対象: 酒類・たばこ（20歳以上）

-- user_profiles: 生年月日と年齢確認済み日時
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS age_verified_at timestamptz;

-- products: 年齢制限フラグとタイプ
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS age_restricted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS restriction_type text;

-- restriction_type は age_restricted=true の時のみ意味を持つ。値は 'alcohol' | 'tobacco'
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS chk_products_restriction_type;
ALTER TABLE public.products
  ADD CONSTRAINT chk_products_restriction_type
  CHECK (restriction_type IS NULL OR restriction_type IN ('alcohol', 'tobacco'));

-- 年齢制限商品の絞り込み高速化（部分インデックス）
CREATE INDEX IF NOT EXISTS idx_products_age_restricted
  ON public.products(age_restricted) WHERE age_restricted = true;
