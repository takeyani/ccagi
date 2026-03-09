-- =============================================
-- Creator LP: クリエイター成功報酬型LPデザイン機能
-- =============================================

-- 1a. affiliates テーブル拡張
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS is_creator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text;

-- 1b. creator_lp_designs テーブル
CREATE TABLE public.creator_lp_designs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  lot_id uuid REFERENCES public.lots(id) ON DELETE SET NULL,
  slug text NOT NULL,
  design_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, slug, lot_id)
);

CREATE INDEX idx_creator_lp_designs_affiliate ON public.creator_lp_designs(affiliate_id);
CREATE INDEX idx_creator_lp_designs_slug ON public.creator_lp_designs(slug);

-- RLS
ALTER TABLE public.creator_lp_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select published" ON public.creator_lp_designs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Allow public insert" ON public.creator_lp_designs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.creator_lp_designs
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON public.creator_lp_designs
  FOR DELETE USING (true);

-- 1c. ビューカウント用RPC
CREATE OR REPLACE FUNCTION increment_lp_views(p_design_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.creator_lp_designs
  SET views_count = views_count + 1
  WHERE id = p_design_id;
$$;

-- Supabase Storage バケット（creator-assets）
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-assets', 'creator-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public upload creator-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'creator-assets');

CREATE POLICY "Allow public read creator-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'creator-assets');
