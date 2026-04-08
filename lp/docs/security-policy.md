# Cross Infinity セキュリティポリシー

| 項目 | 内容 |
|------|------|
| 文書ID | SEC-POLICY-001 |
| バージョン | 1.0 |
| 作成日 | 2026-04-09 |
| 更新日 | 2026-04-09 |

---

## 1. 認証・認可

### 1.1 ロール
- `admin` — システム全体管理（手動付与のみ。signup APIでは設定不可）
- `partner` — メーカー / 代理店
- `buyer` — バイヤー
- `creator` — クリエイター（コードベース認証 + email検証）

### 1.2 認証方式
- **partner / buyer / admin**: Supabase Auth（メール+パスワード または Google OAuth）
- **creator**: アフィリエイトコード + email による検証

### 1.3 ロール検証
- ページレベル: middleware (`src/proxy.ts`) で `/admin/*`, `/partner/*`, `/buyer/*` を保護
- API/Server Action レベル: `requireAdmin()`, `requirePartnerId()`, `requireBuyerId()` を `src/lib/auth.ts` で定義
- adminロール昇格は手動付与のみ。signup API は admin role を拒否

---

## 2. パスワードポリシー

- 最低 **10文字**
- 英字・数字・記号 を **それぞれ1文字以上** 含む
- 適用箇所: 新規登録 (`SignupForm`), パスワードリセット (`ResetPasswordForm`)

---

## 3. レート制限

| エンドポイント | 制限 |
|--------------|------|
| `POST /api/signup/complete` | 10 req/h（IP単位） |
| `POST /api/affiliates/register` | 10 req/h（IP単位） |
| `PATCH /api/creator/profile` | 20 req/min（IP単位） |

実装: `src/lib/rate-limit.ts`（メモリベース簡易実装）。本格運用時は Upstash Redis 等への移行を推奨。

---

## 4. オープンリダイレクト対策

OAuthコールバック (`/api/auth/callback`) で `redirect` パラメータを検証：
- 相対パスのみ許可（`/` で始まり、`//` を含まない）
- 不正値はデフォルト `/` にフォールバック

---

## 5. IDOR（Insecure Direct Object Reference）対策

### 5.1 クリエイター系API
- `/api/creator/profile`, `/api/creator/designs/[id]`, `/api/creator/collections/[id]`, `/api/articles`
- リクエストボディの `affiliate_id` を信頼せず、`code + email` で本人確認後にDB側で所有権検証

### 5.2 partner / buyer 系
- middleware でロール検証
- `requirePartnerId()` / `requireBuyerId()` で所有者ID取得
- 全 mutation で `partner_id` / `owner_id` フィルタを適用

---

## 6. Webhookセキュリティ

### 6.1 Stripe Webhook (`/api/webhooks/stripe`)
- Stripe署名検証必須
- ログには partner名 / 金額を出力しない（partnerId / transferId のみ）

### 6.2 Cron エンドポイント
- 全エンドポイントで `Authorization: Bearer ${CRON_SECRET}` 検証必須
- 対象: `/api/cron/agents`, `/api/cron/sales-agent`, `/api/cron/step-mail`

---

## 7. データベース保護

### 7.1 RLS（Row Level Security）
- `partners`, `affiliates` 等の重要テーブルで RLS 有効
- クライアントから直接 mutation を許可しない（必ず admin client 経由のサーバーAPIを使用）

### 7.2 トリガー
- `auth.users` への直接トリガー設定は禁止（過去にアプリケーションエラーの原因となったため）
- ユーザー作成後の関連レコード作成は API route + admin client で実行

---

## 8. CORS / CSP

### 8.1 埋め込みウィジェット (`/embed/*`)
- `frame-ancestors *` を許可（外部サイト埋め込みが仕様上必要）
- 埋め込み先サイトは利用規約で制限

### 8.2 その他のページ
- デフォルト同一オリジンのみ

---

## 9. 機密情報の取り扱い

### 9.1 環境変数
- `.env*` は `.gitignore` 対象
- 本番環境変数は Vercel Dashboard で管理
- Supabase Service Role Key, Stripe Secret Key, CRON_SECRET は `.env` 経由のみ

### 9.2 ログ
- 個人情報・金額・トークンを含むデータをログ出力しない
- ID と event type のみを構造化ログで出力

---

## 10. 修正履歴

| 日付 | 内容 |
|------|------|
| 2026-04-09 | セキュリティ監査実施。CRITICAL 3件、HIGH 4件、MEDIUM 3件を修正 |
| 2026-04-09 | requireAdmin() 追加、OAuth open redirect対策、IDOR修正、パスワード強化、レート制限導入 |
