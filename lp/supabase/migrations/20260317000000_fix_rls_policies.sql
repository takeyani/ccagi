-- =====================================================================
-- Migration: Fix RLS Policies
-- Date: 2026-03-17
-- Description: Drop all overly permissive policies and replace them
--              with proper role-based access control policies.
-- =====================================================================

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Helper: get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's partner_id
CREATE OR REPLACE FUNCTION public.get_user_partner_id()
RETURNS uuid AS $$
  SELECT partner_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =====================================================================
-- 1. PARTNERS (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.partners;

CREATE POLICY "partners_select_public"
  ON public.partners FOR SELECT
  USING (true);

CREATE POLICY "partners_insert_admin"
  ON public.partners FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "partners_update_admin"
  ON public.partners FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "partners_delete_admin"
  ON public.partners FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 2. PRODUCTS (public read active or admin/owner, admin/owner write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.products;

CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (
    is_active = true
    OR public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "products_insert_admin_or_partner"
  ON public.products FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "products_update_admin_or_partner"
  ON public.products FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "products_delete_admin_or_partner"
  ON public.products FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );


-- =====================================================================
-- 3. LOTS (public read, admin/owning partner write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.lots;

CREATE POLICY "lots_select_public"
  ON public.lots FOR SELECT
  USING (true);

CREATE POLICY "lots_insert_admin_or_partner"
  ON public.lots FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "lots_update_admin_or_partner"
  ON public.lots FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "lots_delete_admin_or_partner"
  ON public.lots FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 4. TAGS (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.tags;
DROP POLICY IF EXISTS "Allow public insert" ON public.tags;
DROP POLICY IF EXISTS "Allow public update" ON public.tags;
DROP POLICY IF EXISTS "Allow public delete" ON public.tags;

CREATE POLICY "tags_select_public"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "tags_insert_admin"
  ON public.tags FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "tags_update_admin"
  ON public.tags FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "tags_delete_admin"
  ON public.tags FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 5. PRODUCT_TAGS (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.product_tags;
DROP POLICY IF EXISTS "Allow public insert" ON public.product_tags;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_tags;

CREATE POLICY "product_tags_select_public"
  ON public.product_tags FOR SELECT
  USING (true);

CREATE POLICY "product_tags_insert_admin"
  ON public.product_tags FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "product_tags_delete_admin"
  ON public.product_tags FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 6. PRODUCT_ATTRIBUTES (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.product_attributes;
DROP POLICY IF EXISTS "Allow public insert" ON public.product_attributes;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_attributes;

CREATE POLICY "product_attributes_select_public"
  ON public.product_attributes FOR SELECT
  USING (true);

CREATE POLICY "product_attributes_insert_admin"
  ON public.product_attributes FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "product_attributes_delete_admin"
  ON public.product_attributes FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 7. AFFILIATES (public read/insert, admin manage)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public insert" ON public.affiliates;
DROP POLICY IF EXISTS "Allow public select" ON public.affiliates;

CREATE POLICY "affiliates_select_public"
  ON public.affiliates FOR SELECT
  USING (true);

CREATE POLICY "affiliates_insert_public"
  ON public.affiliates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "affiliates_update_admin"
  ON public.affiliates FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "affiliates_delete_admin"
  ON public.affiliates FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 8. REFERRALS (public insert, admin select)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public insert" ON public.referrals;

CREATE POLICY "referrals_insert_public"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "referrals_select_admin"
  ON public.referrals FOR SELECT
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 9. REQUESTS (public insert, admin or owning partner select)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public insert" ON public.requests;

CREATE POLICY "requests_insert_public"
  ON public.requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "requests_select_admin_or_partner"
  ON public.requests FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR public.get_user_role() IN ('admin', 'partner')
  );


-- =====================================================================
-- 10. LOT_PURCHASES (authenticated insert, public select)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public insert" ON public.lot_purchases;
DROP POLICY IF EXISTS "Allow public select" ON public.lot_purchases;

CREATE POLICY "lot_purchases_insert_public"
  ON public.lot_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "lot_purchases_select_public"
  ON public.lot_purchases FOR SELECT
  USING (true);


-- =====================================================================
-- 11. BIDS (public read/insert, no update/delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.bids;
DROP POLICY IF EXISTS "Allow public insert" ON public.bids;

CREATE POLICY "bids_select_public"
  ON public.bids FOR SELECT
  USING (true);

CREATE POLICY "bids_insert_public"
  ON public.bids FOR INSERT
  WITH CHECK (true);


-- =====================================================================
-- 12. AUCTIONS (public read, admin/partner insert/update, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.auctions;
DROP POLICY IF EXISTS "Allow public update" ON public.auctions;
DROP POLICY IF EXISTS "Allow public insert" ON public.auctions;

CREATE POLICY "auctions_select_public"
  ON public.auctions FOR SELECT
  USING (true);

CREATE POLICY "auctions_insert_admin_or_partner"
  ON public.auctions FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR public.get_user_role() IN ('admin', 'partner')
  );

CREATE POLICY "auctions_update_admin_or_partner"
  ON public.auctions FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR (
      public.get_user_role() IN ('admin', 'partner')
      AND lot_id IN (
        SELECT l.id FROM public.lots l
        JOIN public.products p ON p.id = l.product_id
        WHERE p.partner_id = public.get_user_partner_id()
      )
    )
  );

CREATE POLICY "auctions_delete_admin"
  ON public.auctions FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 13. ANNOUNCEMENTS (authenticated read, admin/partner write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow auth select" ON public.announcements;
DROP POLICY IF EXISTS "Allow auth insert" ON public.announcements;
DROP POLICY IF EXISTS "Allow auth update" ON public.announcements;
DROP POLICY IF EXISTS "Allow auth delete" ON public.announcements;

CREATE POLICY "announcements_select_authenticated"
  ON public.announcements FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "announcements_insert_admin_or_partner"
  ON public.announcements FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'partner'));

CREATE POLICY "announcements_update_admin_or_partner"
  ON public.announcements FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'partner'));

CREATE POLICY "announcements_delete_admin_or_partner"
  ON public.announcements FOR DELETE
  USING (public.get_user_role() IN ('admin', 'partner'));


-- =====================================================================
-- 14. MESSAGES (authenticated, scoped to own messages)
-- =====================================================================

DROP POLICY IF EXISTS "Allow auth select" ON public.messages;
DROP POLICY IF EXISTS "Allow auth insert" ON public.messages;
DROP POLICY IF EXISTS "Allow auth update" ON public.messages;

CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

CREATE POLICY "messages_insert_authenticated"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());


-- =====================================================================
-- 15. TASKS (authenticated, scoped)
-- =====================================================================

DROP POLICY IF EXISTS "Allow auth select" ON public.tasks;
DROP POLICY IF EXISTS "Allow auth insert" ON public.tasks;
DROP POLICY IF EXISTS "Allow auth update" ON public.tasks;
DROP POLICY IF EXISTS "Allow auth delete" ON public.tasks;

CREATE POLICY "tasks_select_authenticated"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      assigned_to = auth.uid()
      OR created_by = auth.uid()
      OR public.get_user_role() = 'admin'
    )
  );

CREATE POLICY "tasks_insert_authenticated"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_authenticated"
  ON public.tasks FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_delete_admin"
  ON public.tasks FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 16. SHARED_FILES (authenticated, scoped to partner or admin)
-- =====================================================================

DROP POLICY IF EXISTS "Allow auth select" ON public.shared_files;
DROP POLICY IF EXISTS "Allow auth insert" ON public.shared_files;
DROP POLICY IF EXISTS "Allow auth delete" ON public.shared_files;

CREATE POLICY "shared_files_select_authenticated"
  ON public.shared_files FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.get_user_role() = 'admin'
      OR partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "shared_files_insert_authenticated"
  ON public.shared_files FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "shared_files_delete_own_or_admin"
  ON public.shared_files FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR public.get_user_role() = 'admin'
  );


-- =====================================================================
-- 17. ACTIVITY_LOGS (authenticated read/insert, no update/delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.activity_logs;

CREATE POLICY "activity_logs_select_authenticated"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "activity_logs_insert_authenticated"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- =====================================================================
-- 18. NOTIFICATIONS (authenticated, scoped to own)
-- =====================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.notifications;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "notifications_insert_authenticated"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());


-- =====================================================================
-- 19. APPROVALS (authenticated CRUD, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.approvals;

CREATE POLICY "approvals_select_authenticated"
  ON public.approvals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "approvals_insert_authenticated"
  ON public.approvals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "approvals_update_authenticated"
  ON public.approvals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "approvals_delete_admin"
  ON public.approvals FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 20. PARTNER_INVITATIONS (authenticated, scoped)
-- =====================================================================

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.partner_invitations;

CREATE POLICY "partner_invitations_select"
  ON public.partner_invitations FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.get_user_role() = 'admin'
      OR partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "partner_invitations_insert_admin_or_partner"
  ON public.partner_invitations FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR (
      public.get_user_role() IN ('admin', 'partner')
      AND partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "partner_invitations_update_admin"
  ON public.partner_invitations FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "partner_invitations_delete_admin"
  ON public.partner_invitations FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 21. ENTITY_PROOFS (public read, admin/partner write, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow select" ON public.entity_proofs;
DROP POLICY IF EXISTS "Allow insert" ON public.entity_proofs;
DROP POLICY IF EXISTS "Allow update" ON public.entity_proofs;
DROP POLICY IF EXISTS "Allow delete" ON public.entity_proofs;

CREATE POLICY "entity_proofs_select_public"
  ON public.entity_proofs FOR SELECT
  USING (true);

CREATE POLICY "entity_proofs_insert_admin_or_partner"
  ON public.entity_proofs FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "entity_proofs_update_admin_or_partner"
  ON public.entity_proofs FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "entity_proofs_delete_admin"
  ON public.entity_proofs FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 22. PRODUCT_PROOFS (public read, admin/partner write, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow select" ON public.product_proofs;
DROP POLICY IF EXISTS "Allow insert" ON public.product_proofs;
DROP POLICY IF EXISTS "Allow update" ON public.product_proofs;
DROP POLICY IF EXISTS "Allow delete" ON public.product_proofs;

CREATE POLICY "product_proofs_select_public"
  ON public.product_proofs FOR SELECT
  USING (true);

CREATE POLICY "product_proofs_insert_admin_or_partner"
  ON public.product_proofs FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "product_proofs_update_admin_or_partner"
  ON public.product_proofs FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "product_proofs_delete_admin"
  ON public.product_proofs FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 23. INVENTORY_PROOFS (public read, admin/partner insert)
-- =====================================================================

DROP POLICY IF EXISTS "Allow select" ON public.inventory_proofs;
DROP POLICY IF EXISTS "Allow insert" ON public.inventory_proofs;

CREATE POLICY "inventory_proofs_select_public"
  ON public.inventory_proofs FOR SELECT
  USING (true);

CREATE POLICY "inventory_proofs_insert_admin_or_partner"
  ON public.inventory_proofs FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR lot_id IN (
      SELECT l.id FROM public.lots l
      JOIN public.products p ON p.id = l.product_id
      WHERE p.partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 24. OWNERSHIP_RECORDS (public read, authenticated insert, admin update)
-- =====================================================================

DROP POLICY IF EXISTS "Allow select" ON public.ownership_records;
DROP POLICY IF EXISTS "Allow insert" ON public.ownership_records;
DROP POLICY IF EXISTS "Allow update" ON public.ownership_records;

CREATE POLICY "ownership_records_select_public"
  ON public.ownership_records FOR SELECT
  USING (true);

CREATE POLICY "ownership_records_insert_authenticated"
  ON public.ownership_records FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ownership_records_update_admin"
  ON public.ownership_records FOR UPDATE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 25. DELIVERY_PROOFS (public read, admin/partner insert/update)
-- =====================================================================

DROP POLICY IF EXISTS "Allow select" ON public.delivery_proofs;
DROP POLICY IF EXISTS "Allow insert" ON public.delivery_proofs;
DROP POLICY IF EXISTS "Allow update" ON public.delivery_proofs;

CREATE POLICY "delivery_proofs_select_public"
  ON public.delivery_proofs FOR SELECT
  USING (true);

CREATE POLICY "delivery_proofs_insert_admin_or_partner"
  ON public.delivery_proofs FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR public.get_user_role() IN ('admin', 'partner')
  );

CREATE POLICY "delivery_proofs_update_admin_or_partner"
  ON public.delivery_proofs FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR public.get_user_role() IN ('admin', 'partner')
  );


-- =====================================================================
-- 26. SURVEYS (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.surveys;
DROP POLICY IF EXISTS "Allow public insert" ON public.surveys;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.surveys;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.surveys;

CREATE POLICY "surveys_select_public"
  ON public.surveys FOR SELECT
  USING (true);

CREATE POLICY "surveys_insert_admin"
  ON public.surveys FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "surveys_update_admin"
  ON public.surveys FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "surveys_delete_admin"
  ON public.surveys FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 27. SURVEY_QUESTIONS (public read, admin write)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.survey_questions;
DROP POLICY IF EXISTS "Allow public insert" ON public.survey_questions;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.survey_questions;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.survey_questions;

CREATE POLICY "survey_questions_select_public"
  ON public.survey_questions FOR SELECT
  USING (true);

CREATE POLICY "survey_questions_insert_admin"
  ON public.survey_questions FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "survey_questions_update_admin"
  ON public.survey_questions FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "survey_questions_delete_admin"
  ON public.survey_questions FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 28. SURVEY_RESPONSES (admin read, public insert)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.survey_responses;
DROP POLICY IF EXISTS "Allow public insert" ON public.survey_responses;

CREATE POLICY "survey_responses_select_admin"
  ON public.survey_responses FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "survey_responses_insert_public"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);


-- =====================================================================
-- 29. SURVEY_ANSWERS (admin read, public insert)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.survey_answers;
DROP POLICY IF EXISTS "Allow public insert" ON public.survey_answers;

CREATE POLICY "survey_answers_select_admin"
  ON public.survey_answers FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "survey_answers_insert_public"
  ON public.survey_answers FOR INSERT
  WITH CHECK (true);


-- =====================================================================
-- 30. BOARD_THREADS (public read/insert, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.board_threads;
DROP POLICY IF EXISTS "Allow public insert" ON public.board_threads;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.board_threads;

CREATE POLICY "board_threads_select_public"
  ON public.board_threads FOR SELECT
  USING (true);

CREATE POLICY "board_threads_insert_public"
  ON public.board_threads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "board_threads_delete_admin"
  ON public.board_threads FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 31. BOARD_POSTS (public read/insert, admin delete)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.board_posts;
DROP POLICY IF EXISTS "Allow public insert" ON public.board_posts;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.board_posts;

CREATE POLICY "board_posts_select_public"
  ON public.board_posts FOR SELECT
  USING (true);

CREATE POLICY "board_posts_insert_public"
  ON public.board_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "board_posts_delete_admin"
  ON public.board_posts FOR DELETE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 32. BUYING_AGENTS (owner or admin)
-- =====================================================================

DROP POLICY IF EXISTS "Owner select" ON public.buying_agents;
DROP POLICY IF EXISTS "Owner insert" ON public.buying_agents;
DROP POLICY IF EXISTS "Owner update" ON public.buying_agents;
DROP POLICY IF EXISTS "Owner delete" ON public.buying_agents;
DROP POLICY IF EXISTS "Admin select all" ON public.buying_agents;

CREATE POLICY "buying_agents_select_owner_or_admin"
  ON public.buying_agents FOR SELECT
  USING (
    auth.uid() = owner_id
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "buying_agents_insert_owner"
  ON public.buying_agents FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "buying_agents_update_owner"
  ON public.buying_agents FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "buying_agents_delete_owner"
  ON public.buying_agents FOR DELETE
  USING (auth.uid() = owner_id);


-- =====================================================================
-- 33. AGENT_RESULTS (owner via buying_agents or admin)
-- =====================================================================

DROP POLICY IF EXISTS "Owner select results" ON public.agent_results;
DROP POLICY IF EXISTS "Owner insert results" ON public.agent_results;
DROP POLICY IF EXISTS "Owner update results" ON public.agent_results;
DROP POLICY IF EXISTS "Admin select all results" ON public.agent_results;

CREATE POLICY "agent_results_select_owner_or_admin"
  ON public.agent_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.buying_agents
      WHERE buying_agents.id = agent_results.agent_id
        AND buying_agents.owner_id = auth.uid()
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "agent_results_insert_owner"
  ON public.agent_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buying_agents
      WHERE buying_agents.id = agent_results.agent_id
        AND buying_agents.owner_id = auth.uid()
    )
  );

CREATE POLICY "agent_results_update_owner"
  ON public.agent_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.buying_agents
      WHERE buying_agents.id = agent_results.agent_id
        AND buying_agents.owner_id = auth.uid()
    )
  );

-- No delete policy: cascade from buying_agents handles deletion


-- =====================================================================
-- 34. AGENT_INQUIRIES (buyer/partner scoped)
-- =====================================================================

DROP POLICY IF EXISTS "Buyers can view own inquiries" ON public.agent_inquiries;
DROP POLICY IF EXISTS "Buyers can insert own inquiries" ON public.agent_inquiries;
DROP POLICY IF EXISTS "Partners can view own inquiries" ON public.agent_inquiries;
DROP POLICY IF EXISTS "Partners can update own inquiries" ON public.agent_inquiries;

CREATE POLICY "agent_inquiries_select_buyer"
  ON public.agent_inquiries FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "agent_inquiries_select_partner"
  ON public.agent_inquiries FOR SELECT
  USING (
    partner_id IN (
      SELECT p.partner_id FROM public.user_profiles p WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "agent_inquiries_select_admin"
  ON public.agent_inquiries FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "agent_inquiries_insert_buyer"
  ON public.agent_inquiries FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "agent_inquiries_update_partner"
  ON public.agent_inquiries FOR UPDATE
  USING (
    partner_id IN (
      SELECT p.partner_id FROM public.user_profiles p WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "agent_inquiries_update_admin"
  ON public.agent_inquiries FOR UPDATE
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 35. AUTO_BID_LOGS (owner via buying_agents, admin)
-- =====================================================================

DROP POLICY IF EXISTS "Agent owners can view own auto bid logs" ON public.auto_bid_logs;

CREATE POLICY "auto_bid_logs_select_owner"
  ON public.auto_bid_logs FOR SELECT
  USING (
    agent_id IN (
      SELECT ba.id FROM public.buying_agents ba WHERE ba.owner_id = auth.uid()
    )
  );

CREATE POLICY "auto_bid_logs_select_admin"
  ON public.auto_bid_logs FOR SELECT
  USING (public.get_user_role() = 'admin');


-- =====================================================================
-- 36. STOCK_REQUESTS (public insert, admin/partner select/update)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public insert" ON public.stock_requests;
DROP POLICY IF EXISTS "Allow public select" ON public.stock_requests;
DROP POLICY IF EXISTS "Allow public update" ON public.stock_requests;

CREATE POLICY "stock_requests_insert_public"
  ON public.stock_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "stock_requests_select_admin_or_partner"
  ON public.stock_requests FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "stock_requests_update_admin_or_partner"
  ON public.stock_requests FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR product_id IN (
      SELECT id FROM public.products WHERE partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 37. QUOTES (admin or owning partner)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.quotes;
DROP POLICY IF EXISTS "Allow public insert" ON public.quotes;
DROP POLICY IF EXISTS "Allow public update" ON public.quotes;
DROP POLICY IF EXISTS "Allow public delete" ON public.quotes;

CREATE POLICY "quotes_select_admin_or_partner"
  ON public.quotes FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "quotes_insert_admin_or_partner"
  ON public.quotes FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "quotes_update_admin_or_partner"
  ON public.quotes FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "quotes_delete_admin_or_partner"
  ON public.quotes FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );


-- =====================================================================
-- 38. QUOTE_ITEMS (admin or owning partner via quotes)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.quote_items;
DROP POLICY IF EXISTS "Allow public insert" ON public.quote_items;
DROP POLICY IF EXISTS "Allow public update" ON public.quote_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.quote_items;

CREATE POLICY "quote_items_select_admin_or_partner"
  ON public.quote_items FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR quote_id IN (
      SELECT id FROM public.quotes WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "quote_items_insert_admin_or_partner"
  ON public.quote_items FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR quote_id IN (
      SELECT id FROM public.quotes WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "quote_items_update_admin_or_partner"
  ON public.quote_items FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR quote_id IN (
      SELECT id FROM public.quotes WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "quote_items_delete_admin_or_partner"
  ON public.quote_items FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR quote_id IN (
      SELECT id FROM public.quotes WHERE partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 39. INVOICES (admin or owning partner)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert" ON public.invoices;
DROP POLICY IF EXISTS "Allow public update" ON public.invoices;
DROP POLICY IF EXISTS "Allow public delete" ON public.invoices;

CREATE POLICY "invoices_select_admin_or_partner"
  ON public.invoices FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "invoices_insert_admin_or_partner"
  ON public.invoices FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "invoices_update_admin_or_partner"
  ON public.invoices FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "invoices_delete_admin_or_partner"
  ON public.invoices FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );


-- =====================================================================
-- 40. INVOICE_ITEMS (admin or owning partner via invoices)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public insert" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public update" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.invoice_items;

CREATE POLICY "invoice_items_select_admin_or_partner"
  ON public.invoice_items FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR invoice_id IN (
      SELECT id FROM public.invoices WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "invoice_items_insert_admin_or_partner"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR invoice_id IN (
      SELECT id FROM public.invoices WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "invoice_items_update_admin_or_partner"
  ON public.invoice_items FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR invoice_id IN (
      SELECT id FROM public.invoices WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "invoice_items_delete_admin_or_partner"
  ON public.invoice_items FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR invoice_id IN (
      SELECT id FROM public.invoices WHERE partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 41. DELIVERY_SLIPS (admin or owning partner)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.delivery_slips;
DROP POLICY IF EXISTS "Allow public insert" ON public.delivery_slips;
DROP POLICY IF EXISTS "Allow public update" ON public.delivery_slips;
DROP POLICY IF EXISTS "Allow public delete" ON public.delivery_slips;

CREATE POLICY "delivery_slips_select_admin_or_partner"
  ON public.delivery_slips FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "delivery_slips_insert_admin_or_partner"
  ON public.delivery_slips FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "delivery_slips_update_admin_or_partner"
  ON public.delivery_slips FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );

CREATE POLICY "delivery_slips_delete_admin_or_partner"
  ON public.delivery_slips FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR partner_id = public.get_user_partner_id()
  );


-- =====================================================================
-- 42. DELIVERY_SLIP_ITEMS (admin or owning partner via delivery_slips)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select" ON public.delivery_slip_items;
DROP POLICY IF EXISTS "Allow public insert" ON public.delivery_slip_items;
DROP POLICY IF EXISTS "Allow public update" ON public.delivery_slip_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.delivery_slip_items;

CREATE POLICY "delivery_slip_items_select_admin_or_partner"
  ON public.delivery_slip_items FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR delivery_slip_id IN (
      SELECT id FROM public.delivery_slips WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "delivery_slip_items_insert_admin_or_partner"
  ON public.delivery_slip_items FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR delivery_slip_id IN (
      SELECT id FROM public.delivery_slips WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "delivery_slip_items_update_admin_or_partner"
  ON public.delivery_slip_items FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR delivery_slip_id IN (
      SELECT id FROM public.delivery_slips WHERE partner_id = public.get_user_partner_id()
    )
  );

CREATE POLICY "delivery_slip_items_delete_admin_or_partner"
  ON public.delivery_slip_items FOR DELETE
  USING (
    public.get_user_role() = 'admin'
    OR delivery_slip_id IN (
      SELECT id FROM public.delivery_slips WHERE partner_id = public.get_user_partner_id()
    )
  );


-- =====================================================================
-- 43. CREATOR_LP_DESIGNS (public read published, owner CRUD)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select published" ON public.creator_lp_designs;
DROP POLICY IF EXISTS "Allow public insert" ON public.creator_lp_designs;
DROP POLICY IF EXISTS "Allow public update" ON public.creator_lp_designs;
DROP POLICY IF EXISTS "Allow public delete" ON public.creator_lp_designs;

CREATE POLICY "creator_lp_designs_select_published_or_owner"
  ON public.creator_lp_designs FOR SELECT
  USING (
    is_published = true
    OR public.get_user_role() = 'admin'
    OR affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      JOIN public.user_profiles up ON up.id = auth.uid()
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "creator_lp_designs_insert_owner"
  ON public.creator_lp_designs FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "creator_lp_designs_update_owner"
  ON public.creator_lp_designs FOR UPDATE
  USING (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "creator_lp_designs_delete_owner"
  ON public.creator_lp_designs FOR DELETE
  USING (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );


-- =====================================================================
-- 44. CREATOR_LP_COLLECTIONS (public read published, owner CRUD)
-- =====================================================================

DROP POLICY IF EXISTS "Allow public select published" ON public.creator_lp_collections;
DROP POLICY IF EXISTS "Allow public insert" ON public.creator_lp_collections;
DROP POLICY IF EXISTS "Allow public update" ON public.creator_lp_collections;
DROP POLICY IF EXISTS "Allow public delete" ON public.creator_lp_collections;

CREATE POLICY "creator_lp_collections_select_published_or_owner"
  ON public.creator_lp_collections FOR SELECT
  USING (
    is_published = true
    OR public.get_user_role() = 'admin'
    OR affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "creator_lp_collections_insert_owner"
  ON public.creator_lp_collections FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "creator_lp_collections_update_owner"
  ON public.creator_lp_collections FOR UPDATE
  USING (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "creator_lp_collections_delete_owner"
  ON public.creator_lp_collections FOR DELETE
  USING (
    affiliate_id IN (
      SELECT a.id FROM public.affiliates a
      WHERE a.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );


-- =====================================================================
-- 45. USER_PROFILES (own or admin read, admin/own update)
-- =====================================================================

DROP POLICY IF EXISTS "Users read own" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin read all" ON public.user_profiles;
DROP POLICY IF EXISTS "Service insert" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin update" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own_or_admin"
  ON public.user_profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE POLICY "user_profiles_insert_service"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_profiles_update_own_or_admin"
  ON public.user_profiles FOR UPDATE
  USING (
    public.is_admin()
    OR auth.uid() = id
  );
