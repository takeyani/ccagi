-- =============================================
-- Estimator DB Schema
-- =============================================

-- 1. estimator_user_profiles
CREATE TABLE IF NOT EXISTS estimator_user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE estimator_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON estimator_user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON estimator_user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON estimator_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. estimator_company_settings
CREATE TABLE IF NOT EXISTS estimator_company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text DEFAULT '',
  company_address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  logo_url text DEFAULT '',
  default_unit_price integer DEFAULT 700000,
  default_discount_rate numeric(5,2) DEFAULT 30.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE estimator_company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own company settings"
  ON estimator_company_settings FOR ALL
  USING (auth.uid() = user_id);

-- 3. estimator_customers
CREATE TABLE IF NOT EXISTS estimator_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  department text DEFAULT '',
  contact_name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  postal_code text DEFAULT '',
  address text DEFAULT '',
  memo text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE estimator_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own customers"
  ON estimator_customers FOR ALL
  USING (auth.uid() = user_id);

-- 4. estimator_estimates
CREATE TABLE IF NOT EXISTS estimator_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES estimator_customers(id) ON DELETE SET NULL,
  estimate_number text NOT NULL,
  title text NOT NULL DEFAULT '',
  project_type text NOT NULL DEFAULT 'web_app',
  conditions jsonb NOT NULL DEFAULT '{}',
  unit_price integer NOT NULL DEFAULT 700000,
  discount_rate numeric(5,2) NOT NULL DEFAULT 30.00,
  total_man_months numeric(8,2) NOT NULL DEFAULT 0,
  subtotal integer NOT NULL DEFAULT 0,
  discount_amount integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT '下書き',
  valid_until date,
  notes text DEFAULT '',
  customer_company_name text DEFAULT '',
  customer_contact_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE estimator_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own estimates"
  ON estimator_estimates FOR ALL
  USING (auth.uid() = user_id);

-- 5. estimator_estimate_items
CREATE TABLE IF NOT EXISTS estimator_estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES estimator_estimates(id) ON DELETE CASCADE,
  phase_key text NOT NULL,
  phase_name text NOT NULL,
  phase_sort_order integer NOT NULL DEFAULT 0,
  task_name text NOT NULL,
  task_sort_order integer NOT NULL DEFAULT 0,
  base_man_months numeric(6,2) NOT NULL DEFAULT 0,
  multiplier numeric(6,3) NOT NULL DEFAULT 1.000,
  adjusted_man_months numeric(6,2) NOT NULL DEFAULT 0,
  unit_price integer NOT NULL DEFAULT 700000,
  amount integer NOT NULL DEFAULT 0,
  is_included boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE estimator_estimate_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own estimate items"
  ON estimator_estimate_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM estimator_estimates
      WHERE estimator_estimates.id = estimator_estimate_items.estimate_id
      AND estimator_estimates.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_estimator_estimates_user_id ON estimator_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimator_estimates_customer_id ON estimator_estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimator_estimate_items_estimate_id ON estimator_estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimator_customers_user_id ON estimator_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_estimator_company_settings_user_id ON estimator_company_settings(user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_estimator_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.estimator_user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_estimator_auth_user_created'
  ) THEN
    CREATE TRIGGER on_estimator_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_estimator_new_user();
  END IF;
END $$;
