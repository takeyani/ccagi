-- パートナー招待
CREATE TABLE public.partner_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  email text NOT NULL,
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT '招待中'
    CHECK (status IN ('招待中', '登録済み', '期限切れ')),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.partner_invitations FOR ALL USING (true) WITH CHECK (true);
