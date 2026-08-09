# 単品決済ロットLP 実装リファレンス

**更新日**: 2026-08-09
**対象**: エンジニア（開発・改修・引き継ぎ）

**関連ドキュメント**
- [business-flow.md](./business-flow.md)
- [system-requirements.md](./system-requirements.md)
- [security-policy.md](./security-policy.md)
- [embed-design.md](./embed-design.md)

---

## 1. 概要

「単品決済ロットLP」とは、**ロット単位での商品販売と、そのロット詳細ページを中心とした単発決済フロー**。

3つの導線で同一の決済ロジックを共有している。

### 3つの導線

**① 標準ロットLP**
- URL: `/products/[slug]/[lotId]`
- メイン経路

**② クリエイターLP**
- URL: `/c/[code]/[slug]/[lotId]`
- アフィリエイト経由

**③ 埋め込みウィジェット**
- URL: `/embed/lp/[code]/[slug]/[lotId]`
- 外部ECサイト用

### 共通の決済フロー

```
LotPurchaseButton
  ↓
POST /api/checkout
  ↓
Stripe Checkout
  ↓
Webhook → lot_purchases
  ↓
Stripe Connect 送金
```

### 完成度サマリ

| 機能 | 状態 |
|---|---|
| コア決済 (`/api/checkout`) | ✅ 完全 |
| 在庫管理 (`reserve_lot_stock`) | ✅ 完全 |
| 購入UI (`LotPurchaseButton`) | ✅ 完全 |
| 年齢確認 | ⚠ MVP（自己申告） |
| バーコード検索 | ✅ 完全 |
| クリエイターLP | ✅ 完全（年齢確認統合済み） |
| 埋め込みウィジェット | ⚠ iframe内のログイン導線が未検証 |
| 定期購入 | 🔴 自動Cron未実装（カード保存が前提として欠落） |
| 高額注文管理 | ⚠ 手動キャプチャのみ |
| Webhook処理 | ✅ 完全（冪等性あり） |

**総合**: 80-90%。本番運用可能だが、法的コンプライアンスとEdge case対応が残課題。

---

## 2. アーキテクチャ

### ロット詳細ページの処理

1. Server Component で初期データ取得
   - `products`, `lots` 取得
   - ログインユーザーの `age_verified_at` 取得
2. `<AgeRestrictionBadge>` を条件表示
3. `<LotPurchaseButton>` をレンダー

### 購入クリック時の処理

1. 年齢制限商品 && 未確認 → `<AgeVerificationModal>` 表示
2. 生年月日入力 → `POST /api/age-verify`
3. 成功 → `POST /api/checkout`

### `/api/checkout` 内部処理

1. レート制限（IP単位 20回/h）
2. ロット取得・検証（在庫・期限・最小注文数）
3. `rpc('reserve_lot_stock', ...)` で原子的予約
4. 商品取得 + 年齢制限商品なら再認証
5. 金額上限チェック（¥500,000）
6. 高額注文判定（¥100,000+ → manual capture）
7. `stripe.checkout.sessions.create(...)`

### Webhook 処理

`POST /api/webhooks/stripe`

- `checkout.session.completed`
  - `lot_purchases` insert（冪等性: stripe_session_id ユニーク）
  - `marketing_events` 記録
  - メーカー紹介者報酬計算
  - Stripe Connect 送金（売上 - 12% - 2%）
  - ステップメール登録
- `payment_intent.succeeded` → 高額注文の手動キャプチャ後処理

---

## 3. 実装ファイル一覧

### 3.1 主要ページ

**ロット詳細ページ（標準LP）** ✅
- `src/app/products/[slug]/[lotId]/page.tsx`

**クリエイターLP編集** ✅
- `src/app/creator/designs/[id]/edit/page.tsx`

**クリエイターLPブロック** ✅ 年齢確認統合済み（`5919e80`）
- `src/components/creator-lp/blocks/LotDetailsBlock.tsx`

**埋め込み単品LP** ✅
- `src/app/embed/lp/[code]/[slug]/[lotId]/page.tsx`

**Partner ロット一覧 / 作成 / 編集** ✅
- `src/app/partner/lots/page.tsx`
- `src/app/partner/lots/new/page.tsx`
- `src/app/partner/lots/[id]/page.tsx`
- `src/app/partner/lots/actions.ts`

**Admin ロット一覧 / 高額注文** ✅ / ⚠
- `src/app/admin/lots/page.tsx`
- `src/app/admin/high-value-orders/page.tsx`

**商品検索** ✅
- `src/app/products/search/page.tsx`

**決済完了** ✅
- `src/app/success/page.tsx`

### 3.2 主要コンポーネント

**購入ボタン** ✅
- `src/components/LotPurchaseButton.tsx`

**定期購入フォーム** ✅
- `src/components/RecurringPurchaseForm.tsx`

**年齢確認モーダル** ✅ MVP
- `src/components/AgeVerificationModal.tsx`

**年齢制限バッジ** ✅
- `src/components/AgeRestrictionBadge.tsx`

### 3.3 API

**チェックアウト** ✅
- `src/app/api/checkout/route.ts`

**年齢確認** ✅ MVP
- `src/app/api/age-verify/route.ts`

**商品検索** ✅
- `src/app/api/products/search/route.ts`

**Stripe Webhook** ✅
- `src/app/api/webhooks/stripe/route.ts`

### 3.4 ライブラリ

**型定義**
- `src/lib/types.ts`
- `Lot`, `Product`, `LotPurchase`, `Partner`

**認証**
- `src/lib/auth.ts`
- `getSessionProfile()`
- `requireBuyerId()`
- `requirePartnerId()`
- `requireAdmin()`

**年齢計算**
- `src/lib/age.ts`
- `calculateAge()`
- `isAdult()`
- `parseDateOfBirth()`

**Supabase**
- `src/lib/supabase.ts` — `getSupabase()`
- `src/lib/supabase/admin.ts` — `createAdminClient()`
- `src/lib/supabase/server.ts` — `createSupabaseServerClient()`

**その他**
- `src/lib/rate-limit.ts` — `rateLimit()`, `getClientIp()`
- `src/lib/stripe-connect.ts` — メーカー送金
- `src/lib/maker-referral.ts` — 紹介者報酬計算
- `src/lib/step-mail.ts` — 購入トリガー登録

---

## 4. DB構造

### 4.1 主要テーブル

#### `products` — 商品マスタ
- `id`, `partner_id`, `name`, `slug`, `base_price`
- `image_url`, `is_active`
- `barcode` （NEW）
- `age_restricted`, `restriction_type` （NEW）

#### `lots` — ロット（在庫単位）
- `id`, `product_id`, `lot_number`
- `stock`, `price`, `status`
- `expiration_date`
- `selling_unit`, `units_per_case`, `min_order_units`
- `shipping_method`, `shipping_fee`, `wholesale_price`

#### `lot_purchases` — 購入記録
- `id`, `lot_id`
- `stripe_session_id` (UNIQUE) ← 冪等性キー
- `created_at`

#### `recurring_orders` — 定期購入
- `id`, `lot_id`, `product_id`
- `customer_email`, `frequency`, `quantity`
- `next_delivery_date`, `status`

#### `user_profiles` — ユーザー
- `id`, `role`, `partner_id`, `display_name`
- `date_of_birth`, `age_verified_at` （NEW）

#### `partners` — 出店者
- `id`, `company_name`, `partner_type`
- `certification_status`（仮登録/本登録）
- `parent_partner_id`

#### `affiliates` — アフィリエイト
- `id`, `code`, `is_creator`, `commission_rate`

#### `marketing_events` — LP行動ログ
- `id`, `event_type`, `content_type`, `content_id`
- `lot_id`, `partner_id`, `referrer`

#### `creator_lp_designs` — クリエイターLP
- `id`, `affiliate_id`, `slug`, `lot_id`
- `design_config` (jsonb), `theme`, `is_published`

### 4.2 主要RPC

**`reserve_lot_stock`** — チェックアウト時の原子的在庫予約
```
(p_lot_id uuid, p_session_id text, p_quantity int)
  → boolean
```

**`decrement_lot_stock`** — 在庫1減算（旧API、互換用）
```
(p_lot_id uuid) → boolean
```

**`increment_lp_views`** — クリエイターLP閲覧数
```
(p_design_id uuid) → void
```

**`run_buying_agent`** — 購買エージェント自動検索

### 4.3 RLS（Row Level Security）

| テーブル | SELECT | INSERT/UPDATE |
|---|---|---|
| `products` | PUBLIC | Partner（自社） |
| `lots` | PUBLIC | Partner（自社商品） |
| `lot_purchases` | PUBLIC | PUBLIC |
| `user_profiles` | 自身のみ | 自身のみ |
| `partners` | PUBLIC | Admin |

### 4.4 直近のマイグレーション

**`20260417210000_add_age_verification.sql`** (2026-04-17)
- `user_profiles.date_of_birth`
- `user_profiles.age_verified_at`
- `products.age_restricted`
- `products.restriction_type`

**`20260417000000_add_barcode.sql`** (2026-04-17)
- `products.barcode`
- `buying_agents.target_barcode`

**`20260407000000_add_reserve_lot_stock_rpc.sql`** (2026-04-07)
- 原子的在庫予約RPC

**`20260331500000_add_selling_units_to_lots.sql`** (2026-03-31)
- 販売単位（個/箱/ケース/パレット）

---

## 5. 業務フロー

### 5.1 Partner → Buyer 標準フロー

#### Partner側

1. `/partner/lots/new` で:
   - 商品選択
   - ロット番号、在庫数
   - 販売単位・最小注文数
   - 価格、配送方法・送料
   - 賞味期限（食品）
2. `status='販売中'` で発行

#### Buyer側

1. `/products/[slug]/[lotId]` アクセス
2. 商品・ロット詳細確認
3. 「今すぐ購入する」クリック
4. 数量選択（min_order_units 〜 stock）
5. 年齢制限商品の場合:
   - `AgeRestrictionBadge` 表示
   - 未確認なら `AgeVerificationModal`
   - `POST /api/age-verify` → `user_profiles` 更新
6. `POST /api/checkout`
7. Stripe Checkout 画面 → 決済
8. Webhook で `lot_purchases` 記録 + 送金
9. `/success` ページで完了通知

### 5.2 定期購入フロー

1. ロットLP内「定期購入で申し込む」
   → `RecurringPurchaseForm`
2. 頻度（毎週/隔週/毎月/隔月）・顧客情報入力
3. `POST /api/recurring` → 初回 Stripe決済
4. `recurring_orders` 作成（next_delivery_date 計算）
5. 🔴 **2回目以降の自動決済は未実装**

> **重要**: 初回決済は Stripe Checkout の `mode: "payment"`（単発）で、
> `setup_future_usage` も `customer_creation` も指定していない。
> つまり**カード情報が保存されていない**ため、`recurring_orders` に
> `next_delivery_date` が記録されても、Cron を足すだけでは課金できない。
> 詳細は課題 8.3 を参照。

### 5.3 クリエイターLP経由フロー

#### クリエイター側

1. `/creator/designs/new` で LP作成
   - テンプレート選択（5種）
   - ロット選択
2. `/creator/designs/[id]/edit` でブロック編集
   - Hero / ProductInfo / LotDetails
   - Image / Text / CTA
3. 公開（`is_published=true`）

#### エンドユーザー側

1. `/c/[code]/[slug]/[lotId]` アクセス
2. LP閲覧（`marketing_events: view` 記録）
3. `LotDetailsBlock` 内「購入」
   → `LotPurchaseButton`
4. メタデータに `affiliate_code` 含めて checkout
5. 決済完了 → アフィリエイト報酬 2%

### 5.4 埋め込みウィジェット経由フロー

#### 外部ECサイト運営者

1. CCAGI管理画面で embedコード生成
2. 自サイトに以下を設置:
   ```html
   <div data-ccagi-widget
        data-code="..."
        data-slug="..."
        data-lotId="...">
   </div>
   <script src="embed.js"></script>
   ```

#### 外部サイト訪問者

1. iframe で `/embed/lp/[code]/[slug]/[lotId]` 読込
2. `LotDetailsBlock` 表示
3. 「購入」→ iframe制約のため新タブで Stripe Checkout
4. 決済完了

---

## 6. 主要API仕様

### 6.1 POST /api/checkout

**ファイル**: `src/app/api/checkout/route.ts`
**認証**: 不要（年齢制限商品の場合は内部で再認証）
**レート制限**: IP単位 20回/h

#### Request

```json
{
  "lot_id": "uuid",
  "ref": "AFFILIATE_CODE (optional)",
  "quantity": 1
}
```

#### Response（成功）

```json
{ "url": "https://checkout.stripe.com/..." }
```

#### エラー

| Status | 内容 |
|---|---|
| 400 | バリデーション失敗 |
| 401 | 年齢制限商品でログイン必要 |
| 403 | `age_verification_required` |
| 404 | ロット/商品なし |
| 429 | レート制限超過 |

### 6.2 POST /api/age-verify

**ファイル**: `src/app/api/age-verify/route.ts`
**認証**: 必須

#### Request

```json
{ "date_of_birth": "1990-01-15" }
```

#### Response（成功）

```json
{ "verified": true }
```

#### エラー

| Status | 内容 |
|---|---|
| 400 | 不正な日付フォーマット |
| 401 | 未ログイン |
| 403 | 20歳未満 |
| 500 | DB更新失敗 |

### 6.3 POST /api/webhooks/stripe

**ファイル**: `src/app/api/webhooks/stripe/route.ts`
**認証**: Stripe署名検証

#### 処理対象イベント

- `checkout.session.completed`
  - `lot_purchases` insert
  - 送金 + ステップメール
- `payment_intent.succeeded`
  - 高額注文の手動キャプチャ後処理
- `payment_intent.payment_failed`
  - 通知

### 6.4 GET /api/products/search

**ファイル**: `src/app/api/products/search/route.ts`
**認証**: 不要

#### クエリ

- `?barcode=4901234567890` — JAN/EAN検索
- `?q=キーワード` — 商品名検索

---

## 7. 直近のコミット

> 最新コミットは `8c31fa9`（2026-07-11）。以降 LP への変更なし。

#### `8c31fa9`
**feat(lp)**: エディタキャンバスに画像/動画のドラッグ&ドロップ受付

#### `4d47c1d`
**feat(lp)**: メディア反映UI最適化（XHR進捗 / 自動リサイズ / ライブラリ）

#### `13caae0`
**feat(lp)**: クリエイターLPにギャラリー（複数画像）ブロック追加

#### `21635f1`
**chore(lp)**: creator-assets バケット上限を 100MB + MIME whitelist に拡張

#### `0718eb3`
**feat(lp)**: クリエイターLPエディターに動画対応 + メディアアップロードUI改善

#### `1a49fbd`
**feat(lp)**: 年齢確認機能（実装一式） ← 旧版で「未コミット」としていたもの

#### `586a341`
**chore(lp)**: Vercel本番環境変数の全自動同期 + E2Eテスト基盤を追加

#### `d2bc8c5`
**fix(lp)**: creator_lp_designs に SELECT RLS ポリシー追加

#### `686b9a6`
**fix(lp)**: handle_new_user で role='admin' ハードコードを修正

#### `5919e80`
**feat(lp)**: クリエイターLPに年齢確認を統合（標準LPと同等） ← 課題8.6 の解決

#### `932b9e7`
**feat(lp)**: バーコード検索機能 + 購買エージェントのバーコード対応
- `products.barcode`
- `buying_agents.target_barcode`
- `/api/products/search`, `/products/search`

#### `648fbb6`
**fix(lp)**: buyer/admin layout保護 + エラーバウンダリ追加

#### `bcafed5`
**security(lp)**: 未認証APIエンドポイント7件に認証追加

#### `8d08656`
**docs(lp)**: 全資料の最終整合性更新

#### `b9a89d2`
**feat(lp)**: 改善5項目（設定ガイド/画像アップロード/高額注文管理）

#### `0d48e8b`
**docs**: security-policy 修正履歴追記

#### `147c802`
**security(lp)**: 脆弱性再診断 — CRITICAL 3件 + HIGH 2件 + MEDIUM 1件修正

#### `e11806e`
**docs(lp)**: 全資料の整合性更新

#### `a44a397`
**feat(lp)**: 仮登録→面談→本登録フロー実装

#### `5e840eb`
**docs(lp)**: セキュリティ対策 要件定義書 + 設計書 新設

### 作業ツリーの未コミット変更（2026-08-09 時点）

Partner 商品登録まわりの作りかけが3ファイル（計48行）残っている。
単品決済フロー本体には影響しない。

- `src/app/partner/products/[id]/page.tsx`
- `src/app/partner/products/new/page.tsx`
- `src/app/partner/products/actions.ts`

---

## 8. 既知の課題

### 🔴 優先度 HIGH

#### 8.1 年齢確認の本人確認強化
- **現状**: 生年月日自己申告のみ
- **問題**: 酒類・たばこ販売規制への完全準拠不明
- **改善案**: 本人確認書類アップロード or マイナンバー連携
- **関連**:
  - `src/components/AgeVerificationModal.tsx`
  - `src/app/api/age-verify/route.ts`

#### 8.2 マイグレーション本番適用未確認
- **現状**: barcode / age_verification は記載のみ
- **問題**: 本番DBへの反映が未確認
- **改善案**: Supabase SQL Editor 実行 + verify、CI自動適用化検討
- **関連**: `supabase/migrations/`

#### 8.3 定期購入の自動決済が成立しない（カード保存が欠落）
- **現状**: `next_delivery_date` を記録のみ。Cron も未実装
- **真の問題**: Cron が無いこと**ではなく**、2回目以降を課金する手段が無いこと
  - `/api/recurring` の Checkout Session は `mode: "payment"`（単発）
  - `setup_future_usage: "off_session"` も `customer_creation` も未指定
  - `recurring_orders` に `stripe_customer_id` / `stripe_payment_method_id` 相当のカラムが無い
  - → **Cron だけ足しても課金できない**
- **方針決定（2026-08-09）**: **リマインド型を採用。カード情報は保存しない**
  - サイト側でカード情報を保持しないことを最優先とする
  - Stripe の `setup_future_usage` / `customer_creation` による
    off-session 自動課金は、**採用しない**。
    たとえカード番号自体は Stripe 側に置かれ当サイトはトークン
    （`cus_*` / `pm_*`）しか持たない構成であっても、
    「決済手段の参照を自社で保持しない」方針を優先する
  - 決済手段の管理はカード会社／Stripe の処理に委ね、
    当サイトは毎回 Stripe Checkout へ遷移させるだけに留める
- **禁止事項**（実装時に踏んではいけない）:
  - `recurring_orders` に `stripe_customer_id` /
    `stripe_payment_method_id` 等のカラムを追加すること
  - `payment_intent_data.setup_future_usage` の指定
  - `customer_creation: "always"` の指定
  - PaymentIntent の off-session 生成
- **実装方針（リマインド型）**:
  1. `/api/cron/recurring-orders`: `next_delivery_date <= today + N日` かつ
     `status='有効'` のレコードを抽出
  2. 各レコードについて Stripe Checkout Session を**都度**新規作成し、
     その URL を顧客へメール送付（`src/lib/step-mail.ts` を利用）
  3. 課金は顧客が自らリンクを開いてカード入力した時点で成立
  4. Webhook の `checkout.session.completed` で
     `next_delivery_date` 更新 + `total_deliveries` 加算
  5. `vercel.json` に cron 登録
- **利点**: カード情報も決済手段トークンも保持しないため、
  PCI DSS のスコープを最小のまま維持でき、
  継続課金に伴うカード保存同意の取得も不要
- **残る要件**: 特商法上の「解約方法・配送サイクル」表示は
  リマインド型でも必要
- **関連**:
  - `src/app/api/recurring/route.ts`
  - `src/app/api/webhooks/stripe/route.ts`
  - `supabase/migrations/20260331200000_add_recurring_orders.sql`

### 🟡 優先度 MEDIUM

#### 8.4 在庫予約RPCの冪等性
- **現状**: `reserve_lot_stock` は不足チェックのみ
- **問題**: Webhook 重複時に在庫過剰デクリメントの懸念
- **改善案**: `stock_reservations` テーブル + session_id ロック
- **関連**:
  - `supabase/migrations/20260407000000_add_reserve_lot_stock_rpc.sql`

#### 8.5 高額注文の自動リマインダー・自動キャプチャ
- **現状**: 7日以内に手動キャプチャしないと失効
- **問題**: 督促・自動化フロー未整備
- **改善案**: Cron で 3日前 alert、6日後 自動 capture
- **関連**:
  - `src/app/admin/high-value-orders/page.tsx`

#### 8.6 クリエイターLP内 LotDetailsBlock の年齢確認 — ✅ 解決済み
- **対応**: `5919e80` で統合。`LotDetailsBlock.tsx` が `product.age_restricted`
  を見て `AgeRestrictionBadge` を表示し、`ageRestricted` を購入ボタンへ伝搬
- **関連**:
  - `src/components/creator-lp/blocks/LotDetailsBlock.tsx:86-98`

#### 8.7 埋め込みウィジェットの年齢確認 — ⚠ 一部対応（iframe動作は未検証）
- **セキュリティ上の穴ではない**: 埋め込みページ自体に `age_restricted` の
  記述は無いが、`BlockRenderer` → `LotDetailsBlock` が
  `product.age_restricted` を見てバッジとモーダルを出す。
  さらに `/api/checkout` がサーバ側で再検証する（401/403）ため、
  クライアントを迂回しても購入は通らない
- **実際の差分**: 埋め込みページだけ `ageVerified` を
  `BlockRenderer` に渡していなかった（→ 常に `false`）。
  そのため**確認済みユーザーにも毎回モーダルが出る**UX劣化があった
  - → 2026-08-09 に `/c/` と同じ取得処理を追加して解消
- **残課題**: iframe 内でサードパーティCookie制約により
  セッションを取得できないケースの動作が未検証。
  この場合 `ageVerified=false` となりモーダルが出る（安全側）が、
  モーダル内のログイン導線が iframe で機能するかは要確認
- **関連**:
  - `src/app/embed/lp/[code]/[slug]/[lotId]/page.tsx`

### 🟢 優先度 LOW

#### 8.8 バーコード検索 RPC への統合
- **現状**: `run_buying_agent` への `target_barcode` フィルタ未組込み
- **改善案**: RPC更新SQL追加、購買エージェントテスト
- **関連**:
  - `supabase/migrations/20260417000000_add_barcode.sql`

#### 8.9 年齢確認虚偽申告時の事後対応
- **現状**: 決済完了後の本人確認書類検証なし
- **改善案**: `age_verification_proofs` テーブル + 管理画面検証

#### 8.10 決済E2Eテストカバレッジ
- **現状**: `src/__tests__/checkout-flow.test.ts` で基本のみ
- **未テスト**: 年齢制限商品決済、高額注文キャプチャ、RPC二重呼出、定期購入自動化
- **改善案**: テストケース追加

---

## 9. 推奨タスク

### フェーズ1: 緊急対応（1-2週間）

1. **8.2 マイグレーション本番適用確認** — 不整合解消。他の全作業の前提
2. **8.1 年齢確認の本人確認強化** — 自己申告のみの状態を解消
3. **8.7 iframe 内ログイン導線の実機確認** — 実装は完了。動作検証のみ

### フェーズ2: 定期購入のリマインド型実装

4. **8.3 定期購入（リマインド型）** — 方針決定済み。
   カード情報・決済手段トークンを一切保存せず、
   期日前に Stripe Checkout のリンクをメール送付する方式で実装する

### フェーズ3: 堅牢性向上（2-3週間）

5. **8.4 在庫予約RPC冪等性** — データ整合性
6. **8.5 高額注文自動化** — 失効防止
7. **8.9 年齢確認 Transaction化** — 事後検証フロー

### フェーズ4: 仕上げ

8. **8.8 バーコード検索 RPC 統合**
9. **8.10 E2Eテスト拡充**

### 完了済み

- ~~8.6 クリエイターLP 年齢確認統合~~ → `5919e80`
- ~~ドキュメント整合性更新~~ → 2026-08-09

---

## 10. 開発者向け補足

### 10.1 ローカル起動

```bash
cd C:\CCAGI\my-project\lp
npm install
npm run supabase:start
npm run dev
# → http://localhost:3000
```

### 10.2 テスト実行

```bash
# 全テスト
npm run test

# 個別テスト
npm run test -- age.test

# Lint
npm run lint

# 型チェック
npx tsc --noEmit
```

### 10.3 本番ビルド検証

```bash
npm run build
```

### 10.4 関連ドキュメント

- [business-flow.md](./business-flow.md) — 業務フロー全体
- [system-requirements.md](./system-requirements.md) — システム要件
- [security-policy.md](./security-policy.md) — セキュリティポリシー
- [security-design.md](./security-design.md) — セキュリティ設計
- [embed-design.md](./embed-design.md) — 埋め込みウィジェット設計
- [buying-agent-design.md](./buying-agent-design.md) — 購買エージェント
- [onboarding-guide.md](./onboarding-guide.md) — 導入ガイド

### 10.5 用語集

#### ロット（Lot）
在庫の単位。`products` は商品マスタ、`lots` は具体的な在庫ロット（番号・期限・価格・送料）

#### 単品決済
サブスクや繰返ではなく、1ロットの単発購入

#### LP（Landing Page）
- 標準LP: `/products/[slug]/[lotId]`
- クリエイターLP: `/c/[code]/...`
- 埋込LP: `/embed/lp/...`

#### 仮登録／本登録
Partner の認証ステータス。商品登録は本登録のみ可

#### アフィリエイト報酬
紹介者への成果報酬（売上の2%、デフォルト）

#### Stripe Connect
メーカーへの自動送金機構（売上 - 12%手数料 - 2%紹介報酬）

---

## 変更履歴

#### 2026-08-09
- 実装との照合により記述を修正
  - 年齢確認は「未コミット」→ `1a49fbd` でコミット済みに訂正
  - 課題8.6（クリエイターLP年齢確認）は `5919e80` で解決済みに訂正
  - 課題8.7 を精査。セキュリティ上の穴ではなく
    「埋め込みだけ `ageVerified` 未伝搬 → 確認済みユーザーに再確認」
    という UX 劣化と判明。埋め込みページに取得処理を追加して解消
- 埋め込みLPに年齢確認状態の伝搬を追加
  （`src/app/embed/lp/[code]/[slug]/[lotId]/page.tsx`）
- リポジトリルートに `.gitattributes` を追加し CRLF 差分ノイズを解消
  （lp配下の差分 45ファイル → 実質3ファイル）
- 課題8.3 の方針を決定: **リマインド型を採用、カード情報は保存しない**。
  off-session 自動課金（`setup_future_usage` / `customer_creation` /
  決済手段トークンの保持）を明示的に禁止事項として記載
  - 課題8.3 の本質をCron不在ではなく**カード保存の欠落**として書き直し
  - 直近コミット一覧を `8c31fa9`（2026-07-11）まで更新
  - 推奨タスクを実態に合わせて再優先度付け

#### 2026-05-04
- 携帯対応のため横長テーブル・ASCII図を縦並びレイアウトに整形

#### 2026-05-02
- 初版作成（単品決済ロットLP / 年齢確認 / バーコード対応反映）
