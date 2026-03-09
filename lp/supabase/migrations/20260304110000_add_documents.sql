-- パートナーにインボイス制度カラム追加
ALTER TABLE public.partners
  ADD COLUMN invoice_registration_number text,
  ADD COLUMN invoice_registration_date date;

ALTER TABLE public.partners
  ADD CONSTRAINT chk_invoice_reg_number
  CHECK (invoice_registration_number IS NULL OR invoice_registration_number ~ '^T\d{13}$');

-- ========================================
-- 見積書
-- ========================================
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  document_number text NOT NULL,
  inquiry_id uuid REFERENCES public.agent_inquiries(id),
  stock_request_id uuid REFERENCES public.stock_requests(id),
  buyer_company_name text NOT NULL,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text NOT NULL,
  issue_date date NOT NULL DEFAULT current_date,
  valid_until date,
  payment_terms text,
  notes text,
  status text NOT NULL DEFAULT '下書き'
    CHECK (status IN ('下書き','送付済み','承諾','辞退','期限切れ')),
  subtotal integer NOT NULL DEFAULT 0,
  tax_total integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, document_number)
);

CREATE INDEX idx_quotes_partner_id ON public.quotes(partner_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.quotes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.quotes FOR DELETE USING (true);

-- 見積明細
CREATE TABLE public.quote_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  product_id uuid REFERENCES public.products(id),
  lot_id uuid REFERENCES public.lots(id),
  item_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT '個',
  unit_price integer NOT NULL,
  tax_rate numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (tax_rate IN (10.00, 8.00)),
  amount integer NOT NULL,
  tax_amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.quote_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.quote_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.quote_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.quote_items FOR DELETE USING (true);

-- ========================================
-- 請求書
-- ========================================
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  document_number text NOT NULL,
  quote_id uuid REFERENCES public.quotes(id),
  buyer_company_name text NOT NULL,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text NOT NULL,
  issue_date date NOT NULL DEFAULT current_date,
  due_date date,
  payment_terms text,
  notes text,
  status text NOT NULL DEFAULT '下書き'
    CHECK (status IN ('下書き','送付済み','入金済み','期限超過','取消')),
  subtotal integer NOT NULL DEFAULT 0,
  tax_total integer NOT NULL DEFAULT 0,
  tax_10_total integer NOT NULL DEFAULT 0,
  tax_8_total integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  invoice_registration_number text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, document_number)
);

CREATE INDEX idx_invoices_partner_id ON public.invoices(partner_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.invoices FOR DELETE USING (true);

-- 請求明細
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  product_id uuid REFERENCES public.products(id),
  lot_id uuid REFERENCES public.lots(id),
  item_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT '個',
  unit_price integer NOT NULL,
  tax_rate numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (tax_rate IN (10.00, 8.00)),
  amount integer NOT NULL,
  tax_amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.invoice_items FOR DELETE USING (true);

-- ========================================
-- 納品書
-- ========================================
CREATE TABLE public.delivery_slips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid NOT NULL REFERENCES public.partners(id),
  document_number text NOT NULL,
  invoice_id uuid REFERENCES public.invoices(id),
  buyer_company_name text NOT NULL,
  buyer_contact_name text,
  buyer_postal_code text,
  buyer_address text,
  subject text NOT NULL,
  issue_date date NOT NULL DEFAULT current_date,
  delivery_date date,
  notes text,
  status text NOT NULL DEFAULT '下書き'
    CHECK (status IN ('下書き','発行済み')),
  subtotal integer NOT NULL DEFAULT 0,
  tax_total integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, document_number)
);

CREATE INDEX idx_delivery_slips_partner_id ON public.delivery_slips(partner_id);

ALTER TABLE public.delivery_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.delivery_slips FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.delivery_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.delivery_slips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.delivery_slips FOR DELETE USING (true);

-- 納品明細
CREATE TABLE public.delivery_slip_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_slip_id uuid NOT NULL REFERENCES public.delivery_slips(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  product_id uuid REFERENCES public.products(id),
  lot_id uuid REFERENCES public.lots(id),
  item_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT '個',
  unit_price integer NOT NULL,
  tax_rate numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (tax_rate IN (10.00, 8.00)),
  amount integer NOT NULL,
  tax_amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_slip_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.delivery_slip_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.delivery_slip_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.delivery_slip_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.delivery_slip_items FOR DELETE USING (true);

-- ========================================
-- 書類番号採番RPC
-- ========================================
CREATE OR REPLACE FUNCTION public.next_document_number(p_partner_id uuid, p_doc_type text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefix text;
  v_table text;
  v_max_num integer;
  v_next text;
BEGIN
  CASE p_doc_type
    WHEN 'quote' THEN v_prefix := 'Q'; v_table := 'quotes';
    WHEN 'invoice' THEN v_prefix := 'INV'; v_table := 'invoices';
    WHEN 'delivery_slip' THEN v_prefix := 'DS'; v_table := 'delivery_slips';
    ELSE RAISE EXCEPTION 'Unknown doc type: %', p_doc_type;
  END CASE;

  EXECUTE format(
    'SELECT COALESCE(MAX(CAST(split_part(document_number, ''-'', 2) AS integer)), 0) FROM public.%I WHERE partner_id = $1',
    v_table
  ) INTO v_max_num USING p_partner_id;

  v_next := v_prefix || '-' || lpad((v_max_num + 1)::text, 4, '0');
  RETURN v_next;
END;
$$;
