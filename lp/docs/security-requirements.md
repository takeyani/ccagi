# Cross Infinity セキュリティ対策 要件定義書

| 項目 | 内容 |
|------|------|
| 文書ID | REQ-SECURITY-001 |
| バージョン | 1.0 |
| 作成日 | 2026-04-15 |
| 更新日 | 2026-04-15 |
| ステータス | 実装済み |
| 関連文書 | SEC-POLICY-001（セキュリティポリシー）, REQ-SYSTEM-001（システム全体要件） |

---

## 1. 概要

### 1.1 目的

Cross Infinity マーケットプレイスにおけるセキュリティ対策の要件を定義する。カード不正利用、アカウント乗っ取り、不正出品、データ漏洩等のリスクに対する防御策を網羅する。

### 1.2 対象範囲

| カテゴリ | 対象 |
|---------|------|
| 認証・認可 | ログイン、新規登録、ロール管理、セッション管理 |
| 決済セキュリティ | カード不正利用、高額注文、チャージバック |
| データ保護 | RLS、機密情報、ログ管理 |
| 入力検証 | パスワード、商品価格、API入力 |
| 通信セキュリティ | CORS、CSP、リダイレクト |
| 不正行為防止 | 全ロール別の不正行為検知・防止 |

---

## 2. 機能要件

### FR-01: 認証

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-01-01 | メール+パスワード認証（Supabase Auth） | 実装済み |
| FR-01-02 | Google OAuth 認証 | 実装済み |
| FR-01-03 | クリエイター: コード+email による認証 | 実装済み |
| FR-01-04 | admin ロールは手動付与のみ（API経由での設定を拒否） | 実装済み |
| FR-01-05 | セッションリフレッシュ（proxy.ts でトークン自動更新） | 実装済み |

### FR-02: 認可

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-02-01 | partner/admin/buyer ルートのロール別アクセス制御 | 実装済み |
| FR-02-02 | `requireAdmin()` による admin 操作の保護 | 実装済み |
| FR-02-03 | `requirePartnerId()` による partner 操作の保護 | 実装済み |
| FR-02-04 | `requireBuyerId()` による buyer 操作の保護 | 実装済み |
| FR-02-05 | 認証失敗時は throw ではなく redirect で安全に処理 | 実装済み |

### FR-03: パスワードポリシー

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-03-01 | 最低10文字 | 実装済み |
| FR-03-02 | 英字・数字・記号をそれぞれ1文字以上含む | 実装済み |
| FR-03-03 | 新規登録・パスワードリセット両方でリアルタイムバリデーション | 実装済み |

### FR-04: カード決済セキュリティ

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-04-01 | 1回の注文上限: ¥500,000 | 実装済み |
| FR-04-02 | ¥100,000以上の注文は手動キャプチャ（管理者承認制） | 実装済み |
| FR-04-03 | 3Dセキュア（SCA）認証の自動適用 | 実装済み（Stripe Checkout デフォルト） |
| FR-04-04 | Stripe Radar によるAI不正検知 | 実装済み（Stripe デフォルト） |
| FR-04-05 | checkout レート制限: 20 req/h（IP単位） | 実装済み |
| FR-04-06 | auction checkout レート制限: 10 req/h（IP単位） | 実装済み |

### FR-05: 商品登録チェック

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-05-01 | 商品価格の最低値: ¥1 | 実装済み |
| FR-05-02 | 商品価格の上限: ¥500,000 | 実装済み |
| FR-05-03 | 商品名の最低文字数: 2文字 | 実装済み |
| FR-05-04 | CSV一括登録にも同じバリデーション適用 | 実装済み |
| FR-05-05 | 取扱禁止商品（古物・酒類・たばこ・医薬品・銃砲刀剣類）の注意表示 | 実装済み |

### FR-06: レート制限

| ID | エンドポイント | 制限 | 実装状態 |
|----|--------------|------|---------|
| FR-06-01 | `POST /api/signup/complete` | 10 req/h | 実装済み |
| FR-06-02 | `POST /api/affiliates/register` | 10 req/h | 実装済み |
| FR-06-03 | `PATCH /api/creator/profile` | 20 req/min | 実装済み |
| FR-06-04 | `POST /api/checkout` | 20 req/h | 実装済み |
| FR-06-05 | `POST /api/auctions/checkout` | 10 req/h | 実装済み |
| FR-06-06 | `POST /api/products/import` | 5 req/h | 実装済み |

### FR-07: IDOR対策

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-07-01 | クリエイター系API: code+email で本人確認後にDB所有権検証 | 実装済み |
| FR-07-02 | partner/buyer: `requirePartnerId()`/`requireBuyerId()` で所有者ID取得 | 実装済み |
| FR-07-03 | `/api/signup/complete`: admin role 設定を拒否、既存プロフィール上書き時にセッション検証 | 実装済み |

### FR-08: オープンリダイレクト対策

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-08-01 | OAuth callback の redirect パラメータを相対パスのみ許可 | 実装済み |
| FR-08-02 | `//` で始まるURLを拒否 | 実装済み |

### FR-09: データベース保護

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-09-01 | RLS（Row Level Security）を重要テーブルで有効化 | 実装済み |
| FR-09-02 | クライアントからの直接mutation禁止（admin client経由） | 実装済み |
| FR-09-03 | auth.users への直接トリガー禁止 | 実装済み |

### FR-10: 機密情報保護

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-10-01 | `.env*` を `.gitignore` 対象 | 実装済み |
| FR-10-02 | Stripe webhook ログから partner名・金額を除外 | 実装済み |
| FR-10-03 | 本番環境変数は Vercel Dashboard で管理 | 実装済み |

### FR-11: Webhook セキュリティ

| ID | 要件 | 実装状態 |
|----|------|---------|
| FR-11-01 | Stripe Webhook: Stripe署名検証 | 実装済み |
| FR-11-02 | Cron エンドポイント: CRON_SECRET Bearer認証 | 実装済み |

### FR-12: 不正行為防止規定

| ID | ロール | 主な禁止事項 | 実装状態 |
|----|--------|------------|---------|
| FR-12-01 | メーカー | 架空出品、価格不正操作、自己アフィリエイト | 出店規約に明記 |
| FR-12-02 | 購入者 | 盗難カード使用、虚偽チャージバック、大量転売目的 | 出店規約に明記 |
| FR-12-03 | クリエイター | 虚偽LP、無許可販売、自己クリック報酬取得 | 出店規約に明記 |
| FR-12-04 | 代理店 | 無承認販売、横流し、無在庫販売 | 出店規約に明記 |

---

## 3. 非機能要件

### NFR-01: セッション管理

| ID | 要件 |
|----|------|
| NFR-01-01 | proxy.ts でセッショントークンの自動リフレッシュを行う |
| NFR-01-02 | 認証失敗時は throw ではなく redirect("/login") で処理する |
| NFR-01-03 | DB操作は全て admin client (service_role_key) で RLS を回避する |

### NFR-02: エラーハンドリング

| ID | 要件 |
|----|------|
| NFR-02-01 | 全 layout/page で DB エラー時にクラッシュせず、フォールバック表示またはリダイレクト |
| NFR-02-02 | Next.js の redirect() を try-catch で囲まない（内部的に throw するため） |
| NFR-02-03 | Server Component から Client Component へ関数を渡さない（ServerDataTable を使用） |

### NFR-03: パフォーマンス

| ID | 要件 |
|----|------|
| NFR-03-01 | DataTable を使用するページは `force-dynamic` で静的生成を回避 |
| NFR-03-02 | レート制限はメモリベース（本格運用時は Redis 推奨） |

---

## 4. 対策一覧サマリー

| # | カテゴリ | 対策 | 対象ファイル |
|---|---------|------|------------|
| 1 | 認証 | Supabase Auth + Google OAuth | `src/lib/auth.ts`, `src/lib/supabase/` |
| 2 | 認可 | ロール別関数（requireAdmin等） | `src/lib/auth.ts` |
| 3 | パスワード | 10文字+英数字+記号 | `SignupForm.tsx`, `ResetPasswordForm.tsx` |
| 4 | 決済上限 | ¥500,000/回、¥100,000以上手動キャプチャ | `api/checkout/route.ts`, `api/auctions/checkout/route.ts` |
| 5 | 3Dセキュア | Stripe Checkout デフォルト | Stripe設定 |
| 6 | AI不正検知 | Stripe Radar | Stripe設定 |
| 7 | レート制限 | 6エンドポイント | `src/lib/rate-limit.ts` |
| 8 | IDOR | code+email検証、所有者ID検証 | 各API route |
| 9 | リダイレクト | 相対パスのみ許可 | `api/auth/callback/route.ts` |
| 10 | RLS | admin client で回避 | `src/lib/supabase/admin.ts` |
| 11 | ログ | 機密情報除外 | `api/webhooks/stripe/route.ts` |
| 12 | Webhook | Stripe署名、CRON_SECRET | 各API route |
| 13 | 商品チェック | 価格¥1〜¥500,000、名前2文字以上 | `partner/products/actions.ts`, `api/products/import/route.ts` |
| 14 | 禁止商品 | 古物・酒類・たばこ・医薬品・銃砲刀剣類 | `legal/page.tsx`, 商品登録画面 |
| 15 | 不正規約 | 全ロール別禁止事項 | `legal/seller-terms/page.tsx` |
| 16 | セッション | proxy.ts でトークンリフレッシュ | `src/proxy.ts` |
| 17 | エラー耐性 | redirect + try-catch + ServerDataTable | 全layout/page |
