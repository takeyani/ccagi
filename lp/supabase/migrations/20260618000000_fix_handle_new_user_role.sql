-- 2026-06-18: handle_new_user で role='admin' がハードコードされていた致命的バグ修正
--
-- 経緯:
--   本番DB上の handle_new_user() トリガー関数が全新規signupに対して role='admin' を INSERT していた。
--   これにより:
--     1) 誰でも auth/v1/signup を直接叩くだけで admin 権限取得可能（A-002/F-002 違反）
--     2) /api/signup/complete が「管理者ロールは変更できません」で 403 を返し、
--        通常の新規登録UI経由でもアカウント作成ができない
--   このファイルは E2E テスト中に発見されたバグの本番修正を migration として確定する。
--
-- 変更点:
--   - valid_role CHECK 制約に 'pending' を追加
--   - user_profiles.role の DEFAULT を 'pending' に変更
--   - handle_new_user() を signup_role メタデータから resolve するロジックに置き換え
--
-- 本番データへのアドホック操作（武山治弘 admin 整備、既存 admin 降格）は migration には含めない。
-- それらは本番固有なので別途 SQL Editor から手動実行済み。

-- ① CHECK 制約: 'pending' を追加
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT valid_role
  CHECK (role IN ('admin', 'partner', 'buyer', 'pending'));

-- ② DEFAULT を 'pending' に
ALTER TABLE public.user_profiles
  ALTER COLUMN role SET DEFAULT 'pending';

-- ③ trigger 関数: signup_role を見て resolve、不明なら 'pending'
--    'maker' / 'agent' → 'partner'
--    'buyer'          → 'buyer'
--    上記以外         → 'pending'（/api/signup/complete で正しいロールに更新される前提）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  signup_role_raw text := COALESCE(NEW.raw_user_meta_data->>'signup_role', '');
  resolved_role text := CASE
    WHEN signup_role_raw IN ('maker', 'agent') THEN 'partner'
    WHEN signup_role_raw = 'buyer'             THEN 'buyer'
    ELSE 'pending'
  END;
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role, company, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    resolved_role,
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$function$;
