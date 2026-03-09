-- テスト用シードデータ

-- テスト用ユーザー（admin / partner）
-- 注意: ローカル環境では supabase auth admin create-user で作成するか、
-- gotrue テーブルに直接 INSERT する必要があります。
-- ここでは user_profiles のみ seed します（auth.users 作成後に利用）

-- 取引先
INSERT INTO public.partners (id, company_name, contact_name, email, phone, postal_code, address, contract_start_date, payment_terms, memo, partner_type, parent_partner_id, certification_number, certification_document_url, certification_status, certification_expiry, certified_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', '株式会社サンプルフーズ', '田中太郎', 'tanaka@sample-foods.co.jp', '03-1234-5678', '100-0001', '東京都千代田区千代田1-1', '2026-01-01', '月末締め翌月末払い', 'テスト取引先', 'メーカー', NULL, 'CERT-2026-001', 'https://example.com/cert/sample-foods.pdf', '認証済み', '2027-12-31', '2026-01-15T00:00:00+09:00'),
  ('a1000000-0000-0000-0000-000000000002', '合同会社ヘルシーライフ', '鈴木花子', 'suzuki@healthy-life.co.jp', '06-9876-5432', '530-0001', '大阪府大阪市北区梅田1-1', '2026-02-01', '月末締め翌月末払い', NULL, '代理店', 'a1000000-0000-0000-0000-000000000001', 'CERT-2026-002', 'https://example.com/cert/healthy-life.pdf', '認証済み', '2027-06-30', '2026-02-01T00:00:00+09:00');

-- 商品
INSERT INTO public.products (id, partner_id, name, description, image_url, base_price, stripe_price_id, slug, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'プレミアムプロテインバー', '高タンパク・低糖質のプロテインバー。1本あたりタンパク質20g配合。チョコレート味。', NULL, 3980, NULL, 'premium-protein-bar', true),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'オーガニック青汁', '国産有機大麦若葉100%使用。1箱30包入り。', NULL, 4980, NULL, 'organic-aojiru', true),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'ビタミンCサプリメント', '1粒にビタミンC 1000mg配合。90粒入り（約3ヶ月分）。', NULL, 2480, NULL, 'vitamin-c-supplement', true);

-- ロット
INSERT INTO public.lots (id, product_id, lot_number, stock, expiration_date, status, price, stripe_price_id, purchase_date, purchase_price, memo)
VALUES
  -- プロテインバー: 販売中ロット（通常価格）
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'PB-2026-001', 50, '2026-12-31', '販売中', NULL, NULL, '2026-01-15', 2000, '通常ロット'),
  -- プロテインバー: 割引ロット（賞味期限近い → ロット固有価格 ¥1,980）
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'PB-2026-002', 20, '2026-04-30', '販売中', 1980, NULL, '2026-01-10', 2000, '賞味期限近いため割引'),
  -- プロテインバー: 売切れロット
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'PB-2025-010', 0, '2026-06-30', '売切れ', NULL, NULL, '2025-10-01', 1800, '完売済み'),
  -- 青汁: 販売中
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'AJ-2026-001', 100, '2027-03-31', '販売中', NULL, NULL, '2026-02-01', 2500, NULL),
  -- 青汁: 期限切れ
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'AJ-2025-005', 5, '2026-01-31', '期限切れ', NULL, NULL, '2025-06-01', 2500, '期限切れ在庫'),
  -- ビタミンC: 販売中（残りわずか）
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'VC-2026-001', 3, '2027-06-30', '販売中', NULL, NULL, '2026-02-10', 1200, '残りわずか');

-- オークション
INSERT INTO public.auctions (id, lot_id, start_price, buy_now_price, min_bid_increment, current_price, status, ends_at)
VALUES
  -- プロテインバー PB-2026-001: 出品中（3日後に終了）
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 2000, 5000, 100, 2000, '出品中', now() + interval '3 days'),
  -- 青汁 AJ-2026-001: 出品中（即決価格なし、7日後終了）
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 3000, NULL, 200, 3000, '出品中', now() + interval '7 days');

-- テスト入札
INSERT INTO public.bids (auction_id, bidder_name, bidder_email, amount, is_buy_now)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'テスト太郎', 'test-taro@example.com', 2100, false),
  ('d1000000-0000-0000-0000-000000000001', 'テスト花子', 'test-hanako@example.com', 2300, false);

-- 入札に合わせてcurrent_priceを更新
UPDATE public.auctions SET current_price = 2300 WHERE id = 'd1000000-0000-0000-0000-000000000001';

-- ========================================
-- 引合い管理テスト用データ
-- ========================================

-- 新商品: 高純度コラーゲンペプチド（株式会社サンプルフーズ）
INSERT INTO public.products (id, partner_id, name, description, image_url, base_price, stripe_price_id, slug, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001',
   '高純度コラーゲンペプチド',
   '国産豚皮由来の低分子コラーゲンペプチド。1包5,000mg配合。30包入り。美容と健康をサポート。',
   NULL, 5800, NULL, 'collagen-peptide', true);

-- ロット: CP-2026-001（販売中、在庫200）
INSERT INTO public.lots (id, product_id, lot_number, stock, expiration_date, status, price, stripe_price_id, purchase_date, purchase_price, memo)
VALUES
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010',
   'CP-2026-001', 200, '2027-09-30', '販売中', 5500, NULL, '2026-02-20', 3000, '主力商品ロット');

-- タグ
INSERT INTO public.tags (id, name, slug, tag_type, description, sort_order, is_active)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'サプリメント', 'supplement', 'カテゴリ', '健康食品・サプリメント', 10, true),
  ('f1000000-0000-0000-0000-000000000002', '美容', 'beauty', 'キーワード', '美容関連商品', 20, true),
  ('f1000000-0000-0000-0000-000000000003', 'コラーゲン', 'collagen', 'キーワード', 'コラーゲン含有商品', 30, true);

-- 商品タグ（コラーゲンペプチドに3つのタグ）
INSERT INTO public.product_tags (product_id, tag_id)
VALUES
  ('b1000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000003');

-- 商品属性
INSERT INTO public.product_attributes (product_id, attribute_name, attribute_value)
VALUES
  ('b1000000-0000-0000-0000-000000000010', '成分', 'コラーゲンペプチド5000mg'),
  ('b1000000-0000-0000-0000-000000000010', '原産地', '国産（豚皮由来）'),
  ('b1000000-0000-0000-0000-000000000010', '製造方法', '酵素分解法'),
  ('b1000000-0000-0000-0000-000000000010', '特徴', '低分子・高吸収率');

-- ========================================
-- テストユーザー（auth.users + user_profiles）
-- ※ 証明チェーンの verified_by が auth.users を参照するため先に作成
-- ========================================

-- パートナーユーザー（株式会社サンプルフーズ）
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'e1000000-0000-0000-0000-000000000010',
   'authenticated', 'authenticated', 'partner@sample-foods.co.jp',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '');

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('e1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000010', 'email',
   '{"sub":"e1000000-0000-0000-0000-000000000010","email":"partner@sample-foods.co.jp"}', now(), now(), now());

INSERT INTO public.user_profiles (id, role, partner_id, display_name)
VALUES
  ('e1000000-0000-0000-0000-000000000010', 'partner', 'a1000000-0000-0000-0000-000000000001', '田中太郎');

-- バイヤー1: 佐藤一郎
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'e1000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'buyer1@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '');

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'email',
   '{"sub":"e1000000-0000-0000-0000-000000000001","email":"buyer1@example.com"}', now(), now(), now());

INSERT INTO public.user_profiles (id, role, partner_id, display_name)
VALUES ('e1000000-0000-0000-0000-000000000001', 'buyer', NULL, '佐藤一郎');

-- バイヤー2: 山田次郎
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'e1000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'buyer2@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '');

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'email',
   '{"sub":"e1000000-0000-0000-0000-000000000002","email":"buyer2@example.com"}', now(), now(), now());

INSERT INTO public.user_profiles (id, role, partner_id, display_name)
VALUES ('e1000000-0000-0000-0000-000000000002', 'buyer', NULL, '山田次郎');

-- バイヤー3: 高橋三郎
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'e1000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'buyer3@example.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '');

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('e1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'email',
   '{"sub":"e1000000-0000-0000-0000-000000000003","email":"buyer3@example.com"}', now(), now(), now());

INSERT INTO public.user_profiles (id, role, partner_id, display_name)
VALUES ('e1000000-0000-0000-0000-000000000003', 'buyer', NULL, '高橋三郎');

-- 証明チェーン（スコアリングに影響）
INSERT INTO public.entity_proofs (id, partner_id, proof_type, document_url, issuer, issued_at, expires_at, status, verified_by, verified_at, notes)
VALUES
  ('a7000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   '生産者署名', 'https://example.com/proofs/entity-sign.pdf', '日本食品安全協会',
   '2026-01-01', '2027-12-31', '検証済み', NULL, '2026-01-10T00:00:00+09:00', 'テスト証明');

INSERT INTO public.product_proofs (id, product_id, proof_type, document_url, lab_name, tested_at, valid_until, status, verified_by, verified_at, notes)
VALUES
  ('a8000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000010',
   '成分表', 'https://example.com/proofs/product-spec.pdf', '日本分析センター',
   '2026-02-01', '2027-02-01', '検証済み', NULL, '2026-02-05T00:00:00+09:00', 'コラーゲン含有量確認');

INSERT INTO public.inventory_proofs (id, lot_id, verified_stock, warehouse_code, location_detail, verification_method, verified_by, notes)
VALUES
  ('a9000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000010',
   200, 'WH-TOKYO-01', '東京倉庫A棟3F', '目視',
   'e1000000-0000-0000-0000-000000000010', '初期在庫検証');

-- ========================================
-- 購買エージェント（3名のバイヤーが同一商品を検出）
-- ========================================

-- 佐藤: コラーゲン探索エージェント（タグ重視、スコア高め）
INSERT INTO public.buying_agents (id, owner_id, name, description, keyword, target_tag_ids, min_price, max_price,
  require_certified, require_entity_proof, require_product_proof, spec_requirements,
  certification_weight, proof_chain_weight, preferred_partner_type, require_in_stock, min_total_score, status)
VALUES
  ('ba000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
   'コラーゲン探索エージェント', '美容向けコラーゲン商品を探す',
   'コラーゲン',
   '["f1000000-0000-0000-0000-000000000002","f1000000-0000-0000-0000-000000000003"]',
   3000, 8000,
   true, false, false,
   '[{"label":"成分","value":"コラーゲン"}]',
   80, 60, 'メーカー', true, null, '有効');

-- 山田: サプリメント広域検索（広めの価格帯、タグ1つ）
INSERT INTO public.buying_agents (id, owner_id, name, description, keyword, target_tag_ids, min_price, max_price,
  require_certified, require_entity_proof, require_product_proof, spec_requirements,
  certification_weight, proof_chain_weight, preferred_partner_type, require_in_stock, min_total_score, status)
VALUES
  ('ba000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002',
   'サプリメント広域検索', '健康食品全般を幅広く検索',
   'ペプチド',
   '["f1000000-0000-0000-0000-000000000001"]',
   2000, 10000,
   false, false, false,
   '[{"label":"原産地","value":"国産"}]',
   50, 40, null, true, null, '有効');

-- 高橋: 高品質素材調達エージェント（スペック重視）
INSERT INTO public.buying_agents (id, owner_id, name, description, keyword, target_tag_ids, min_price, max_price,
  require_certified, require_entity_proof, require_product_proof, spec_requirements,
  certification_weight, proof_chain_weight, preferred_partner_type, require_in_stock, min_total_score, status)
VALUES
  ('ba000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003',
   '高品質素材調達エージェント', '高品質な原料を探索',
   'コラーゲン',
   '["f1000000-0000-0000-0000-000000000003"]',
   4000, 7000,
   true, true, true,
   '[{"label":"製造方法","value":"酵素"},{"label":"成分","value":"コラーゲン"}]',
   90, 80, 'メーカー', true, null, '有効');

-- ========================================
-- エージェント実行（RPC呼出し）
-- auth.uid() を模擬するため JWT claims を設定
-- ========================================

-- 佐藤一郎（buyer1）として実行
SELECT set_config('request.jwt.claims', '{"sub":"e1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
SELECT public.run_buying_agent('ba000000-0000-0000-0000-000000000001');

-- 山田次郎（buyer2）として実行
SELECT set_config('request.jwt.claims', '{"sub":"e1000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
SELECT public.run_buying_agent('ba000000-0000-0000-0000-000000000002');

-- 高橋三郎（buyer3）として実行
SELECT set_config('request.jwt.claims', '{"sub":"e1000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
SELECT public.run_buying_agent('ba000000-0000-0000-0000-000000000003');

-- JWT claims リセット
SELECT set_config('request.jwt.claims', '', true);
