-- 取引先認証情報の追加
ALTER TABLE public.partners
  ADD COLUMN partner_type text NOT NULL DEFAULT 'メーカー' CHECK (partner_type IN ('メーカー', '代理店')),
  ADD COLUMN parent_partner_id uuid REFERENCES public.partners (id),
  ADD COLUMN certification_number text,
  ADD COLUMN certification_document_url text,
  ADD COLUMN certification_status text NOT NULL DEFAULT '未認証' CHECK (certification_status IN ('未認証', '認証済み', '期限切れ')),
  ADD COLUMN certification_expiry date,
  ADD COLUMN certified_at timestamptz;
