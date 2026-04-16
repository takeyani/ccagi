# Cross Infinity 外部サービス設定ガイド

| 項目 | 内容 |
|------|------|
| 更新日 | 2026-04-16 |

---

## 1. Stripe（決済）

### 1.1 テストキーの取得

1. https://dashboard.stripe.com にログイン
2. 左上の「テスト環境」が有効になっていることを確認
3. **開発者 → APIキー** を開く
4. 以下のキーをコピー:
   - `公開可能キー` (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `シークレットキー` (sk_test_...) → `STRIPE_SECRET_KEY`

### 1.2 Webhook の設定

1. **開発者 → Webhook** を開く
2. 「エンドポイントを追加」をクリック
3. URL: `https://lot-lp.vercel.app/api/webhooks/stripe`
4. イベント: `checkout.session.completed` を選択
5. 作成後、**署名シークレット** (whsec_...) をコピー → `STRIPE_WEBHOOK_SECRET`

### 1.3 商品の Price ID 設定

テストモードでは Price ID なしで動作しますが、実決済を行う場合:
1. **商品カタログ** で商品を作成
2. 価格を設定し、Price ID (price_...) を取得
3. Supabase の `lots.stripe_price_id` または `products.stripe_price_id` に設定

### 1.4 Vercel 環境変数に設定

```bash
cd lp
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
npx vercel env add STRIPE_SECRET_KEY production
npx vercel env add STRIPE_WEBHOOK_SECRET production
```

設定後、再デプロイが必要: `npx vercel --prod`

---

## 2. Google Analytics (GA4)

### 2.1 設定方法

1. https://analytics.google.com でプロパティを作成
2. **管理 → データストリーム → ウェブ** で測定IDを取得 (G-XXXXXXXX)
3. Vercel 環境変数に設定:

```bash
npx vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
# 値: G-XXXXXXXX
```

4. 再デプロイ: `npx vercel --prod`

コードは既に実装済み（`src/app/layout.tsx`）。環境変数を設定するだけで有効化されます。

---

## 3. Resend（メール配信）

### 3.1 設定方法

1. https://resend.com でアカウント作成
2. **API Keys** でキーを生成
3. Vercel 環境変数に設定:

```bash
npx vercel env add RESEND_API_KEY production
```

4. 送信元ドメインの設定（カスタムドメインを使う場合）:
   - Resend ダッシュボードでドメインを追加
   - DNS レコード（SPF, DKIM）を設定
   - 検証完了後、送信元メールアドレスを設定

### 3.2 対象機能

| 機能 | トリガー |
|------|---------|
| ステップメール | 購入完了、問い合わせ、カスタムイベント |
| パスワードリセット | Supabase Auth 経由（別途設定） |
| パートナー招待 | 管理者がメンバー招待時 |

---

## 4. Supabase メール設定

パスワードリセット等のAuthメールはSupabaseが送信します。

1. Supabase ダッシュボード → **Authentication → Email Templates**
2. 送信元アドレス、テンプレートをカスタマイズ
3. カスタム SMTP を使う場合: **Settings → Auth → SMTP Settings**

---

## 5. 環境変数一覧

| 変数 | 説明 | 必須 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | ✓ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー | ✓（決済時） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー | ✓（決済時） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット | ✓（決済時） |
| `CRON_SECRET` | Cronジョブ認証トークン | ✓ |
| `NEXT_PUBLIC_BASE_URL` | アプリのベースURL | ✓ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 測定ID | 任意 |
| `RESEND_API_KEY` | Resend APIキー | 任意 |
