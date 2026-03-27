-- ============================================================
-- Manga Generator — Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  default_provider text NOT NULL DEFAULT 'openai'
    CHECK (default_provider IN ('openai', 'stability', 'gemini')),
  api_keys jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 2. characters
-- ============================================================
CREATE TABLE IF NOT EXISTS public.characters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  appearance_description text NOT NULL DEFAULT '',
  visual_prompt text NOT NULL DEFAULT '',
  reference_images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_user_id ON public.characters(user_id);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_own"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_update_own"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "characters_delete_own"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  tonmana_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_provider text NOT NULL DEFAULT 'openai'
    CHECK (default_provider IN ('openai', 'stability', 'gemini')),
  character_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_own"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "projects_delete_own"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. manga_pages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.manga_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_number integer NOT NULL DEFAULT 1,
  layout_template text NOT NULL DEFAULT 'auto',
  layout_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_manga_pages_project_id ON public.manga_pages(project_id);

ALTER TABLE public.manga_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manga_pages_select_own"
  ON public.manga_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = manga_pages.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "manga_pages_insert_own"
  ON public.manga_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = manga_pages.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "manga_pages_update_own"
  ON public.manga_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = manga_pages.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "manga_pages_delete_own"
  ON public.manga_pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = manga_pages.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. panels
-- ============================================================
CREATE TABLE IF NOT EXISTS public.panels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id uuid NOT NULL REFERENCES public.manga_pages(id) ON DELETE CASCADE,
  panel_order integer NOT NULL DEFAULT 0,
  image_url text,
  scene_description text NOT NULL DEFAULT '',
  dialogue jsonb NOT NULL DEFAULT '[]'::jsonb,
  sound_effects jsonb NOT NULL DEFAULT '[]'::jsonb,
  layout_rect jsonb NOT NULL DEFAULT '{"x":0,"y":0,"w":1,"h":1}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_panels_page_id ON public.panels(page_id);

ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "panels_select_own"
  ON public.panels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.manga_pages
      JOIN public.projects ON projects.id = manga_pages.project_id
      WHERE manga_pages.id = panels.page_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "panels_insert_own"
  ON public.panels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.manga_pages
      JOIN public.projects ON projects.id = manga_pages.project_id
      WHERE manga_pages.id = panels.page_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "panels_update_own"
  ON public.panels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.manga_pages
      JOIN public.projects ON projects.id = manga_pages.project_id
      WHERE manga_pages.id = panels.page_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "panels_delete_own"
  ON public.panels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.manga_pages
      JOIN public.projects ON projects.id = manga_pages.project_id
      WHERE manga_pages.id = panels.page_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. generations (生成履歴)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  input_text text NOT NULL DEFAULT '',
  panel_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  provider text NOT NULL DEFAULT 'openai',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_project_id ON public.generations(project_id);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generations_select_own"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "generations_insert_own"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "generations_update_own"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for manga images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('manga-images', 'manga-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "manga_images_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'manga-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "manga_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manga-images');

CREATE POLICY "manga_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'manga-images'
    AND auth.uid() IS NOT NULL
  );
