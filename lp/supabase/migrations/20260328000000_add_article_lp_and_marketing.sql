-- 記事LP テーブル
CREATE TABLE IF NOT EXISTS article_lp_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  category text NOT NULL DEFAULT 'business',
  tags text[] DEFAULT '{}',
  template_type text NOT NULL DEFAULT 'threads_viral',
  design_config jsonb NOT NULL DEFAULT '[]',
  theme jsonb NOT NULL DEFAULT '{}',
  seo_config jsonb NOT NULL DEFAULT '{}',
  analytics_config jsonb NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  views_count integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL DEFAULT 0,
  conversion_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id, slug)
);

-- 記事LPのインデックス
CREATE INDEX idx_article_lp_designs_affiliate ON article_lp_designs(affiliate_id);
CREATE INDEX idx_article_lp_designs_category ON article_lp_designs(category);
CREATE INDEX idx_article_lp_designs_template ON article_lp_designs(template_type);
CREATE INDEX idx_article_lp_designs_published ON article_lp_designs(is_published) WHERE is_published = true;

-- マーケティングイベント テーブル
CREATE TABLE IF NOT EXISTS marketing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  content_id uuid,
  content_type text NOT NULL DEFAULT 'article',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- イベントのインデックス
CREATE INDEX idx_marketing_events_content ON marketing_events(content_id, content_type);
CREATE INDEX idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX idx_marketing_events_created ON marketing_events(created_at);

-- 汎用カウンターインクリメント関数
CREATE OR REPLACE FUNCTION increment_counter(
  table_name text,
  row_id uuid,
  column_name text
) RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = %I + 1 WHERE id = $1',
    table_name, column_name, column_name
  ) USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS ポリシー
ALTER TABLE article_lp_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

-- 記事LP: 公開記事は誰でも閲覧可、作成・編集はオーナーのみ
CREATE POLICY "article_lp_designs_select" ON article_lp_designs
  FOR SELECT USING (is_published = true OR auth.uid()::text = affiliate_id::text);

CREATE POLICY "article_lp_designs_insert" ON article_lp_designs
  FOR INSERT WITH CHECK (auth.uid()::text = affiliate_id::text OR public.is_admin());

CREATE POLICY "article_lp_designs_update" ON article_lp_designs
  FOR UPDATE USING (auth.uid()::text = affiliate_id::text OR public.is_admin());

CREATE POLICY "article_lp_designs_delete" ON article_lp_designs
  FOR DELETE USING (auth.uid()::text = affiliate_id::text OR public.is_admin());

-- マーケティングイベント: 誰でもINSERT可、SELECTは管理者のみ
CREATE POLICY "marketing_events_insert" ON marketing_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "marketing_events_select" ON marketing_events
  FOR SELECT USING (public.is_admin());
