# CCAGI マーケットプレイス システム全体 要件定義書

| 項目 | 内容 |
|------|------|
| 文書ID | REQ-SYSTEM-001 |
| バージョン | 1.0 |
| 作成日 | 2026-03-06 |
| 更新日 | 2026-03-06 |
| ステータス | 実装済み |

---

## 1. システム概要

### 1.1 目的

認証・証明チェーンを基盤としたB2Bデジタルコンテンツマーケットプレイス。パートナー（メーカー/代理店）が商品・在庫を登録し、バイヤーが購買エージェントで自動検索・スコアリングを行い、クリエイターがカスタムLPで商品を訴求する統合プラットフォーム。

### 1.2 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| バックエンド | Next.js Server Actions, Server Components, API Routes |
| データベース | PostgreSQL (Supabase), Row Level Security |
| 認証 | Supabase Auth + user_profiles ロール管理 |
| 決済 | Stripe Checkout |
| ファイル管理 | Supabase Storage |

### 1.3 ユーザーロール

| ロール | ポータルパス | 説明 |
|--------|------------|------|
| admin | `/admin/*` | システム管理。全データの閲覧・編集 |
| partner | `/partner/*` | パートナー（メーカー/代理店）。商品・在庫・帳票・証明管理 |
| buyer | `/buyer/*` | バイヤー。購買エージェント・注文管理 |
| (public) | `/`, `/c/*`, `/products/*` 等 | 非認証ユーザー。商品閲覧・購入・アンケート回答 |

---

## 2. 機能モジュール一覧

| # | モジュール | 文書ID | 概要 |
|---|----------|--------|------|
| 1 | 商品・在庫管理 | (本書 §3) | Product/Lot/Tag のCRUD、Stripe連携 |
| 2 | 5層証明チェーン | (本書 §4) | 主体/商品/在庫/所有/配送の証明管理 |
| 3 | 購買エージェント | REQ-BUYING-AGENT-001 | 自動検索・スコアリング・引合い |
| 4 | オークション | (本書 §5) | 入札・即決・自動入札 |
| 5 | クリエイターLP | (本書 §6) | ブロックベースLP作成、コレクション |
| 6 | EC埋め込みウィジェット | REQ-EMBED-001 | iframe埋め込みウィジェット |
| 7 | 帳票管理 | (本書 §7) | 見積書・請求書・納品書 |
| 8 | グループウェア | (本書 §8) | メッセージ・タスク・ファイル・カレンダー |
| 9 | アンケート・掲示板 | (本書 §9) | 商品/ロット紐づけアンケート・掲示板 |
| 10 | アフィリエイト | (本書 §10) | 紹介コード・クリエイター連携 |
| 11 | ランキング | (本書 §11) | パートナー/商品ランキング |

---

## 3. 商品・在庫管理

### 3.1 データモデル

| エンティティ | 主要フィールド | 管理者 |
|------------|-------------|--------|
| Partner | company_name, certification_status, partner_type, invoice_registration_number | admin |
| Product | name, slug, base_price, image_url, is_active, min_order_quantity | admin, partner |
| Lot | lot_number, stock, price, expiration_date, status(販売中/売切れ/期限切れ) | admin, partner |
| Tag | name, slug, tag_type(生産者/メーカー/カテゴリ/キーワード), is_active | admin |
| ProductTag | product_id, tag_id | admin |
| ProductAttribute | attribute_name, attribute_value | admin |

### 3.2 主要画面

| パス | 概要 |
|------|------|
| `/admin/partners`, `/admin/partners/new`, `/admin/partners/[id]` | パートナーCRUD |
| `/admin/products`, `/admin/products/new`, `/admin/products/[id]` | 商品CRUD |
| `/admin/lots`, `/admin/lots/new`, `/admin/lots/[id]` | ロットCRUD |
| `/admin/tags`, `/admin/tags/new`, `/admin/tags/[id]` | タグCRUD |
| `/partner/products`, `/partner/products/new`, `/partner/products/[id]` | パートナー商品管理 |
| `/partner/lots`, `/partner/lots/new`, `/partner/lots/[id]` | パートナーロット管理 |
| `/products/[slug]/[lotId]` | 公開商品詳細ページ（Stripe購入） |
| `/t`, `/t/[slug]` | タグ別商品一覧 |

### 3.3 決済フロー

```
購入ボタン → POST /api/checkout (lot_id, affiliate_ref)
  → Stripe Checkout Session 作成
  → 成功: /success → lot_purchases 記録
  → キャンセル: /cancel
```

---

## 4. 5層証明チェーン

### 4.1 レイヤー構成

| 層 | テーブル | 証明内容 |
|----|---------|---------|
| 1. 主体証明 | entity_proofs | 生産者署名/代理店署名/販売権証明/事業許可証 |
| 2. 商品証明 | product_proofs | 成分表/スペックシート/試験成績書/品質証明書 |
| 3. 在庫証明 | inventory_proofs | 在庫数検証（目視/バーコード/WMS連動/IoTセンサー） |
| 4. 所有権記録 | ownership_records | 移転履歴（出品/購入/落札/移管/返品）、tx_hash対応 |
| 5. 配送証明 | delivery_proofs | 追跡番号/配達写真/受領署名 |

### 4.2 ステータス遷移

- 証明ステータス: `未検証` → `検証済み` → `失効`
- 所有権ステータス: `仮確定` → `確定` / `取消`
- 配送ステータス: `準備中` → `発送済み` → `配達中` → `配達完了` → `受領確認済み`

### 4.3 画面

| パス | 概要 |
|------|------|
| `/admin/proofs/*` | 全証明管理（entity/product/inventory/ownership/delivery） |
| `/partner/proofs/*` | パートナー証明管理（entity/product/inventory/delivery） |

---

## 5. オークション

### 5.1 データモデル

| エンティティ | 主要フィールド |
|------------|-------------|
| Auction | lot_id, start_price, buy_now_price, min_bid_increment, current_price, status(出品中/落札済み/キャンセル), ends_at |
| Bid | auction_id, bidder_name, amount, is_buy_now, buyer_id, agent_result_id |

### 5.2 機能

- 手動入札・即決購入
- 購買エージェント連携の自動入札（auto_bid_enabled, auto_bid_max_price）
- auto_rebid_for_auction RPC による自動再入札
- 落札後のStripe決済（`/api/auctions/checkout`）

### 5.3 画面

| パス | 概要 |
|------|------|
| `/products/[slug]/[lotId]/auction` | 入札ページ |
| `/partner/auctions`, `/partner/auctions/new`, `/partner/auctions/[id]` | パートナーオークション管理 |
| `/admin/auctions`, `/admin/auctions/[id]` | 管理者オークション管理 |
| `/buyer/auto-bids` | 自動入札履歴 |

---

## 6. クリエイターLPシステム

### 6.1 概要

クリエイター（is_creator=true のアフィリエイト）が、ブロックベースのドラッグ&ドロップエディタでカスタムLPとコレクション（まとめページ）を作成・公開できるシステム。

### 6.2 データモデル

| エンティティ | 主要フィールド |
|------------|-------------|
| Affiliate | name, email, code, commission_rate, is_creator, avatar_url, bio |
| CreatorLPDesign | affiliate_id, product_id, lot_id, slug, design_config(LPBlock[]), theme(LPTheme), is_published, views_count |
| CreatorLPCollection | affiliate_id, slug, title, filter_conditions, design_config(CollectionBlock[]), theme, is_published, views_count |

### 6.3 ブロックシステム

**単品LPブロック (BlockType)**:
hero, product_info, lot_details, image, text, features, testimonial, faq, cta, divider

**コレクションブロック (CollectionBlockType)**:
hero, image, text, features, testimonial, faq, cta, divider, collection_grid, collection_filter_bar

**テーマ (LPTheme)**: primary_color, secondary_color, bg_color, font

### 6.4 コレクションフィルタ条件

```typescript
CollectionFilterConditions = {
  tag_ids?: string[];        // タグ絞り込み
  partner_ids?: string[];    // パートナー絞り込み
  keyword?: string;          // キーワード検索
  include_design_ids?: string[];   // 特定デザイン含む
  exclude_product_ids?: string[];  // 特定商品除外
}
```

### 6.5 画面

| パス | 概要 |
|------|------|
| `/creator` | クリエイターダッシュボード |
| `/creator/designs`, `/creator/designs/new`, `/creator/designs/[id]/edit` | LP作成・編集 |
| `/creator/collections`, `/creator/collections/new`, `/creator/collections/[id]/edit`, `/creator/collections/[id]/settings` | コレクション管理 |
| `/creator/analytics` | アクセス解析 |
| `/creator/profile` | プロフィール管理 |
| `/c/[code]/[slug]/[lotId]` | 公開LP（単品） |
| `/c/[code]/[slug]` | 公開LP（コレクション） |

### 6.6 API

| エンドポイント | 概要 |
|--------------|------|
| `POST /api/creator/verify` | クリエイターコード認証 |
| `POST /api/creator/upload` | アセットアップロード |
| `PUT /api/creator/designs/[id]` | デザイン保存 |
| `PUT /api/creator/collections/[id]` | コレクション保存 |

---

## 7. 帳票管理

### 7.1 帳票種別

| 帳票 | テーブル | ステータス | 適格請求書対応 |
|------|---------|----------|-------------|
| 見積書 | quotes, quote_items | 下書き→送付済み→承諾/辞退/期限切れ | - |
| 請求書 | invoices, invoice_items | 下書き→送付済み→入金済み/期限超過/取消 | tax_10_total, tax_8_total, registration_number |
| 納品書 | delivery_slips, delivery_slip_items | 下書き→発行済み | - |

### 7.2 画面

| パス | 概要 |
|------|------|
| `/partner/quotes/*` | 見積書CRUD + 印刷 |
| `/partner/invoices/*` | 請求書CRUD + 印刷 |
| `/partner/delivery-slips/*` | 納品書CRUD + 印刷 |
| `/partner/approvals` | 承認ワークフロー |
| `/admin/quotes`, `/admin/invoices`, `/admin/delivery-slips` | 管理者帳票一覧 |

---

## 8. グループウェア

### 8.1 機能

| 機能 | テーブル | 概要 |
|------|---------|------|
| メッセージ | messages | スレッド型1対1メッセージ |
| お知らせ | announcements | 公開/下書き管理付きお知らせ |
| タスク | tasks | 優先度(高/中/低)、ステータス(未着手/進行中/完了)、担当者割当 |
| ファイル共有 | shared_files | パートナー単位のファイル管理 |
| カレンダー | (UI上) | イベント管理 |
| 通知 | notifications | エンティティ紐づけ通知 |
| アクティビティ | activity_logs | 操作ログ |

### 8.2 画面

| パス | 概要 |
|------|------|
| `/partner/groupware/messages`, `/partner/groupware/messages/[threadId]` | メッセージ |
| `/partner/groupware/announcements` | お知らせ |
| `/partner/groupware/tasks` | タスク管理 |
| `/partner/groupware/files` | ファイル共有 |
| `/partner/groupware/calendar` | カレンダー |
| `/partner/groupware/notifications` | 通知 |
| `/partner/groupware/activity` | アクティビティログ |
| `/admin/groupware/*` | 管理者グループウェア（同構成 + お知らせ・タスクCRUD） |

---

## 9. アンケート・掲示板

### 9.1 アンケート

| テーブル | 概要 |
|---------|------|
| surveys | タイトル、対象(general/product/lot)、有効状態 |
| survey_questions | 質問テキスト、種別(text/radio/checkbox/rating)、選択肢、必須 |
| survey_responses | 回答者情報 |
| survey_answers | 回答データ |

画面: `/admin/surveys/*` (管理), `/surveys/[surveyId]` (回答)

### 9.2 掲示板

| テーブル | 概要 |
|---------|------|
| board_threads | 対象(product/lot)紐づけスレッド |
| board_posts | スレッド内投稿 |

画面: `/boards/[threadId]`, `/admin/boards/*`

---

## 10. アフィリエイト

### 10.1 機能

- `?ref=CODE` パラメータでアフィリエイト追跡（localStorage + Cookie保存）
- Stripe Checkout metadata にアフィリエイトコード付与
- クリエイター（is_creator=true）はLP作成・コレクション管理が可能
- アフィリエイト登録API: `POST /api/affiliates/register`

### 10.2 画面

| パス | 概要 |
|------|------|
| `/affiliate` | アフィリエイト登録 |
| `/admin/affiliates` | アフィリエイト管理 |
| `/admin/creator-designs` | クリエイターデザインモデレーション |

---

## 11. ランキング

| パス | 概要 |
|------|------|
| `/rankings` | パートナー/商品ランキング表示 |
| `/admin/rankings` | ランキング管理 |

---

## 12. 認証・認可

### 12.1 ミドルウェア

```
リクエスト → pathname が /admin/* or /partner/* or /buyer/* ?
  NO → 通過
  YES → 認証チェック
    未認証 → /login?redirect=pathname
    認証済み → ロール判定
      /admin/* → admin以外は自ロールポータルへリダイレクト
      /partner/* → buyer は /buyer へリダイレクト
      /buyer/* → 認証済みなら許可
```

### 12.2 認証関数

| 関数 | 用途 |
|------|------|
| `getSessionProfile()` | セッション + プロフィール取得 |
| `requirePartnerId()` | partner ロール検証、partnerId 取得 |
| `requireBuyerId()` | buyer ロール検証、buyerId 取得 |

### 12.3 パートナーメンバー管理

| テーブル | 概要 |
|---------|------|
| partner_invitations | 招待メール送信、トークン管理 |

画面: `/partner/members`, `/(auth)/invite`

---

## 13. API ルート一覧

| メソッド | パス | 概要 |
|---------|------|------|
| POST | `/api/checkout` | Stripe Checkout セッション作成 |
| POST | `/api/auctions/checkout` | オークション落札決済 |
| POST | `/api/auctions/bid` | 入札（自動再入札トリガー付き） |
| POST | `/api/affiliates/register` | アフィリエイト登録 |
| POST | `/api/creator/verify` | クリエイターコード認証 |
| POST | `/api/creator/upload` | クリエイターアセットアップロード |
| PUT | `/api/creator/designs/[id]` | LPデザイン保存 |
| PUT | `/api/creator/collections/[id]` | コレクション保存 |
| POST | `/api/boards/threads` | スレッド作成 |
| POST | `/api/boards/posts` | 投稿作成 |
| POST | `/api/surveys/respond` | アンケート回答 |
| POST | `/api/files/upload` | ファイルアップロード |
| POST | `/api/requests` | 入荷リクエスト |
| POST | `/api/auth/callback` | 認証コールバック |

---

## 14. 関連文書

| 文書ID | タイトル | 概要 |
|--------|---------|------|
| REQ-BUYING-AGENT-001 | 購買エージェント機能 要件定義書 | 購買エージェントの詳細要件 |
| DES-BUYING-AGENT-001 | 購買エージェント機能 設計書 | 購買エージェントの詳細設計 |
| REQ-EMBED-001 | EC埋め込みウィジェット 要件定義書 | 埋め込みウィジェットの要件 |
| DES-EMBED-001 | EC埋め込みウィジェット 設計書 | 埋め込みウィジェットの詳細設計 |
