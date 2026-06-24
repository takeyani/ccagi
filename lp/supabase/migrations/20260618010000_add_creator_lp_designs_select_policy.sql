-- 2026-06-18: creator_lp_designs に SELECT 用 RLS ポリシーが無く、
--             anon (公開LP 訪問者) が design を取得できず /c/[code]/[slug]/[lotId] が常に 404 になっていたバグの修正
--
-- 経緯:
--   E2E テスト中、 service_role では design が取れるが anon では 0 件返却で notFound() が呼ばれることを確認。
--   pg_policy を見たところ INSERT/UPDATE/DELETE のポリシーはあるが SELECT が無く、RLS 有効テーブルでは
--   ポリシー無し = 全件 deny となるため、公開LPでも常に空配列が返っていた。
--
-- ポリシー設計:
--   - 公開済 (is_published = true) は誰でも SELECT 可（クリエイターLPは公開前提）
--   - 未公開は affiliate オーナー本人 or admin だけ閲覧可（編集画面のため）

CREATE POLICY "creator_lp_designs_public_select"
ON public.creator_lp_designs
FOR SELECT
USING (is_published = true);

-- owner_select は authenticated 限定（anon に評価させると auth.users の SELECT 権限が無くて
-- "permission denied for table users" になり、結果として public_select も含めて全部 deny される）
CREATE POLICY "creator_lp_designs_owner_select"
ON public.creator_lp_designs
FOR SELECT
TO authenticated
USING (
  affiliate_id IN (
    SELECT a.id
    FROM public.affiliates a
    WHERE a.email = (SELECT u.email::text FROM auth.users u WHERE u.id = auth.uid())
  )
  OR get_user_role() = 'admin'
);
