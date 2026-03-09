-- ============================================
-- CAD Viewer - Database Schema
-- ============================================

-- 1. cad_user_profiles
CREATE TABLE IF NOT EXISTS cad_user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cad_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON cad_user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON cad_user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON cad_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. cad_projects
CREATE TABLE IF NOT EXISTS cad_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cad_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON cad_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON cad_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON cad_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON cad_projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. cad_files
CREATE TABLE IF NOT EXISTS cad_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES cad_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint DEFAULT 0,
  version integer DEFAULT 1,
  notes text DEFAULT '',
  thumbnail_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cad_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON cad_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files"
  ON cad_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON cad_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON cad_files FOR DELETE
  USING (auth.uid() = user_id);

-- 4. cad_file_versions
CREATE TABLE IF NOT EXISTS cad_file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES cad_files(id) ON DELETE CASCADE,
  version integer NOT NULL,
  storage_path text NOT NULL,
  file_size bigint DEFAULT 0,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cad_file_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own file versions"
  ON cad_file_versions FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can create file versions"
  ON cad_file_versions FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- ============================================
-- Storage Bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to cad-files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cad-files'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can read own cad-files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cad-files'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete own cad-files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cad-files'
    AND auth.uid() IS NOT NULL
  );
