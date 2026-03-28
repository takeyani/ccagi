-- パートナーにStripe Connect情報を追加
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_status text NOT NULL DEFAULT 'not_connected',
  ADD COLUMN IF NOT EXISTS stripe_onboarding_completed_at timestamptz;

-- stripe_connect_status: not_connected | pending | connected | disabled
CREATE INDEX IF NOT EXISTS idx_partners_stripe_account ON partners(stripe_account_id) WHERE stripe_account_id IS NOT NULL;

-- 売上・送金記録テーブル
CREATE TABLE IF NOT EXISTS partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL,
  stripe_transfer_id text,
  lot_purchase_id uuid REFERENCES lot_purchases(id),
  gross_amount integer NOT NULL,          -- 売上総額（円）
  platform_fee integer NOT NULL,          -- プラットフォーム手数料（円）
  affiliate_commission integer NOT NULL DEFAULT 0, -- アフィリエイト報酬（円）
  net_amount integer NOT NULL,            -- メーカー受取額（円）
  status text NOT NULL DEFAULT 'pending', -- pending | transferred | failed | refunded
  transferred_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_status ON partner_payouts(status);
CREATE INDEX idx_partner_payouts_session ON partner_payouts(stripe_session_id);

-- RLS
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_payouts_select" ON partner_payouts
  FOR SELECT USING (
    public.is_admin() OR
    partner_id IN (SELECT p.id FROM partners p JOIN user_profiles up ON up.partner_id = p.id WHERE up.id = auth.uid())
  );

CREATE POLICY "partner_payouts_insert" ON partner_payouts
  FOR INSERT WITH CHECK (public.is_admin());
