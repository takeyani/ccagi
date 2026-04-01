# CCAGI マーケットプレイス システム全体 要件定義書

| 項目 | 内容 |
|------|------|
| 文書ID | REQ-SYSTEM-001 |
| バージョン | 2.0 |
| 作成日 | 2026-03-06 |
| 更新日 | 2026-03-31 |
| ステータス | 実装済み |

---

## 1. システム概要

### 1.1 目的

認証・証明チェーンを基盤としたBtoB/BtoCマーケットプレイス。一般商材および健康食品・化粧品を取り扱い、パートナー（メーカー/販売代理店）が商品・在庫を登録し、バイヤーが購買エージェントで自動検索・スコアリングを行い、クリエイターがカスタムLPで商品を訴求する統合プラットフォーム。

### 1.2 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| バックエンド | Next.js Server Actions, Server Components, API Routes |
| データベース | PostgreSQL (Supabase), Row Level Security |
| 認証 | Supabase Auth + user_profiles ロール管理 |
| 決済 | Stripe Checkout + Stripe Connect（メーカー自動送金） |
| ファイル管理 | Supabase Storage |

### 1.3 ユーザーロール

| ロール | ポータルパス | 説明 |
|--------|------------|------|
| admin | `/admin/*` | システム管理。全データの閲覧・編集 |
| partner | `/partner/*` | パートナー（メーカー/販売代理店）。商品・在庫・帳票・証明管理 |
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
| 12 | アワード | (本書 §12) | デイリー/週間/月間の自動表彰、カテゴリ×指標マトリクス、ロール別ランキング |
| 13 | Stripe Connect | (本書 §18) | メーカーへの自動売上送金、手数料計算、送金記録 |
| 14 | 記事LP | (本書 §19) | SNSバイラル投稿風テンプレート、9種のテンプレート |
| 15 | マーケティング | (本書 §20) | ダッシュボード、アナリティクス、レポート |
| 16 | EC連携コネクタ | (本書 §21) | 8プラットフォーム対応、最大7並列同期 |
| 17 | モバイル対応 | (本書 §22) | レスポンシブデザイン、モバイルナビゲーション |
| 18 | 商品Q&A | (本書 §23) | メーカー・生産者への質問→回答フロー |
| 19 | 定期購入 | (本書 §24) | 毎週/隔週/毎月/隔月の定期注文管理 |
| 20 | ASPアフィリエイト | (本書 §25) | 外部サイト連携ASPサービス |
| 21 | LPアクセス分析 | (本書 §26) | 流入元・流出・PV・CVR分析ダッシュボード |

---

## 3. 商品・在庫管理

### 3.1 データモデル

| エンティティ | 主要フィールド | 管理者 |
|------------|-------------|--------|
| Partner | company_name, certification_status, partner_type, invoice_registration_number | admin |
| Product | name, slug, base_price, image_url, is_active, min_order_quantity | admin, partner |
| Lot | lot_number, stock, price, wholesale_price, selling_unit(個/箱/ケース/パレット), units_per_case, cases_per_pallet, min_order_units, shipping_method, shipping_fee, expiration_date, status(販売中/売切れ/期限切れ) | admin, partner |
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
| `/partner/wholesale` | 卸価格一覧（メーカー: 自社管理、代理店: メーカー卸価格参照） |
| `/partner/authorizations` | 商品承認（クリエイター販売許可の承認/拒否） |
| `/admin/authorizations` | 管理者商品承認管理 |
| `/products/[slug]/[lotId]` | 公開商品詳細ページ（Stripe購入・定期購入・Q&A） |
| `/t`, `/t/[slug]` | タグ別商品一覧 |

### 3.3 決済フロー

```
購入ボタン → POST /api/checkout (lot_id, affiliate_ref)
  → reserve_lot_stock RPC で在庫を原子的に予約（FOR UPDATE ロック）
  → 在庫不足の場合はエラー返却
  → Stripe Checkout Session 作成（metadata: lot_id, product_id, shipping_method, shipping_fee, partner_id）
  → 成功: /success → lot_purchases 記録（冪等性保証）
  → キャンセル: /cancel

定期購入ボタン → POST /api/recurring (lot_id, frequency, customer_name, customer_email)
  → 初回Stripe決済 → recurring_orders レコード作成
  → 次回配送日を自動計算（頻度に基づく）
```

---

## 4. 5層証明チェーン

### 4.1 レイヤー構成

| 層 | テーブル | 証明内容 |
|----|---------|---------|
| 1. 主体証明 | entity_proofs | 生産者署名/販売代理店署名/販売権証明/事業許可証 |
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

### 9.3 商品Q&A

| テーブル | 概要 |
|---------|------|
| product_questions | 商品/ロット紐づけ質問、メーカー回答。ステータス: 未回答→回答済み |

**フロー:**
1. 購入者がロットLPの「メーカー・生産者に質問する」から質問投稿
2. パートナー画面「商品Q&A」に未回答として表示
3. パートナーが回答を入力 → ステータスが「回答済み」に
4. 回答済みQ&AがロットLP上に公開表示

**画面:**

| パス | 概要 |
|------|------|
| `/partner/questions`, `/partner/questions/[id]` | パートナー質問管理・回答 |
| `/admin/questions`, `/admin/questions/[id]` | 管理者Q&A管理 |
| ロットLP内 QuestionSection | 公開Q&A表示 + 質問フォーム |

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
| `/affiliate/asp` | ASPプログラム一覧（アフィリエイター向け） |

---

## 11. ランキング

| パス | 概要 |
|------|------|
| `/rankings` | パートナー/商品ランキング表示 |
| `/admin/rankings` | ランキング管理 |

---

## 12. アワード

### 12.1 集計期間

| 期間 | 集計タイミング | 表彰数 | バッジ |
|------|-------------|--------|--------|
| デイリー | 毎日 0:00 | TOP3 | − |
| 週間 | 毎週月曜 0:00 | TOP5 | Weekly Star |
| 月間 | 毎月1日 0:00 | TOP10 | ゴールド/シルバー/ブロンズ |

### 12.2 対象カテゴリー（7種）

家電・電子機器、アパレル・ファッション、食品・飲料、健康食品・サプリメント、化粧品・美容、工業製品・部品、その他

### 12.3 評価指標（12種）

売上高、販売件数、レビュースコア、プルーフチェーンスコア、LPコンバージョン率、クリエイター月間売上、新規バイヤー獲得数、リピート率、オークション落札総額、共同購入成立数、アフィリエイト紹介数、問い合わせ応答速度

### 12.4 ロール別ランキング

| ロール | 対象指標 |
|--------|---------|
| メーカー | 売上高、販売件数、レビュースコア、プルーフチェーンスコア、新規バイヤー獲得数、リピート率、問い合わせ応答速度 |
| 販売代理店 | 売上高、販売件数、新規バイヤー獲得数、リピート率、オークション落札総額、共同購入成立数 |
| クリエイター | LPコンバージョン率、クリエイター月間売上、売上高、販売件数、レビュースコア、アフィリエイト紹介数、共同購入成立数 |
| 紹介者 | アフィリエイト紹介数、売上高、新規バイヤー獲得数、リピート率、共同購入成立数、問い合わせ応答速度 |

### 12.5 表彰ティア

| ティア | 条件 | 特典 |
|--------|------|------|
| ゴールド | 月間TOP1 | 手数料1%OFF + バッジ |
| シルバー | 月間TOP2-3 | 手数料0.5%OFF + バッジ |
| ブロンズ | 月間TOP4-10 | バッジ |
| ノミネート | TOP20 | リスト掲載 |

### 12.6 画面

| パス | 概要 |
|------|------|
| `/awards` | アワード公開ページ（集計期間・カテゴリ・ロール別表示） |

---

## 13. カテゴリ別業務フロー

取扱商品と取引形態に応じた4つのカテゴリ別ガイドページを提供。

| パス | カテゴリ | 内容 |
|------|---------|------|
| `/flow/general-btob` | 一般商材 BtoB | SKU管理・気配値ボード・共同購入・AI販売/購買エージェント |
| `/flow/general-btoc` | 一般商材 BtoC | LP作成・SNS連携・クーポン・レビュー・コンバージョン分析 |
| `/flow/health-btob` | 健康食品・化粧品 BtoB | 成分管理・賞味期限・温度管理・法規制対応（食品表示法/薬機法/健康増進法/景品表示法） |
| `/flow/health-btoc` | 健康食品・化粧品 BtoC | 成分検索・肌質別レビュー・定期購入・専門クリエイターLP |

各カテゴリでプルーフチェーン要件が異なる（一般商材はL1/L2推奨、健康食品はL1-L3必須）。

---

## 14. 認証・認可

### 14.1 ミドルウェア

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

### 14.2 認証関数

| 関数 | 用途 |
|------|------|
| `getSessionProfile()` | セッション + プロフィール取得 |
| `requirePartnerId()` | partner ロール検証、partnerId 取得 |
| `requireBuyerId()` | buyer ロール検証、buyerId 取得 |

### 14.3 パートナーメンバー管理

| テーブル | 概要 |
|---------|------|
| partner_invitations | 招待メール送信、トークン管理 |

画面: `/partner/members`, `/(auth)/invite`

---

## 15. API ルート一覧

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
| DELETE | `/api/creator/designs/[id]` | LPデザイン削除 |
| DELETE | `/api/creator/collections/[id]` | コレクション削除 |
| POST | `/api/boards/threads` | スレッド作成 |
| POST | `/api/boards/posts` | 投稿作成 |
| POST | `/api/surveys/respond` | アンケート回答 |
| POST | `/api/files/upload` | ファイルアップロード |
| POST | `/api/requests` | 入荷リクエスト |
| POST | `/api/auth/callback` | 認証コールバック |
| POST | `/api/questions` | 商品Q&A 質問投稿 |
| POST | `/api/recurring` | 定期購入 初回決済＋スケジュール登録 |
| POST | `/api/asp/click` | ASP クリック記録 |
| POST | `/api/asp/conversion` | ASP コンバージョン記録（APIキー認証） |
| GET | `/api/asp/programs` | ASP 募集中プログラム一覧 |
| GET | `/api/asp/tracking.js` | ASP 外部サイト埋め込みトラッキングスクリプト |
| GET/POST | `/api/marketing/analytics` | LPアクセス分析 イベント記録/取得 |

---

## 16. 法令ガイドライン・特商法対応

### 16.1 対応法令一覧

多業種対応のため、以下の法令を業種横断で遵守する。

| 法令 | 略称 | 適用範囲 | 主な義務 |
|------|------|---------|---------|
| 特定商取引に関する法律 | 特商法 | 全EC取引 | 事業者情報の表示義務、クーリングオフ、誇大広告の禁止 |
| 景品表示法 | 景表法 | 全商材 | 不当表示（優良・有利誤認）の禁止、打消し表示の適正化 |
| 個人情報保護法 | 個情法 | 全サービス | 利用目的の明示、第三者提供の制限、安全管理措置 |
| 薬機法（旧薬事法） | 薬機法 | 医薬品・化粧品・健康食品 | 効能効果の広告規制、製造販売業許可、成分表示 |
| 食品表示法 | 食表法 | 食品全般 | 原材料・アレルゲン・栄養成分・賞味期限の表示 |
| 健康増進法 | 健増法 | 健康食品・機能性表示食品 | 虚偽・誇大な栄養・健康表示の禁止 |
| 電子消費者契約法 | 電消法 | 全EC取引 | 操作ミスによる意思表示の無効、確認画面の設置義務 |
| 不正競争防止法 | 不競法 | 全商材 | 商品等表示の混同行為、ドメイン名の不正取得禁止 |
| 消費者契約法 | 消契法 | BtoC取引 | 不当な勧誘・契約条項の無効、取消権 |
| 資金決済法 | 資決法 | ポイント・前払式支払 | 前払式支払手段の届出・供託義務 |
| 古物営業法 | 古物法 | 中古品・オークション | 古物商許可、本人確認義務、帳簿記載 |
| 製造物責任法 | PL法 | 製造・輸入品 | 製品の欠陥による損害賠償責任 |

### 16.2 特定商取引法の表示事項

`/legal` ページで以下を必ず掲載する。

| 表示項目 | 説明 | 必須 |
|---------|------|------|
| 事業者名 | 法人名または個人事業主名 | ○ |
| 代表者名 | 代表者の氏名 | ○ |
| 所在地 | 本店所在地（省略時は請求による開示義務） | ○ |
| 電話番号 | 連絡先電話番号 | ○ |
| メールアドレス | 問い合わせ先 | ○ |
| 販売価格 | 税込価格の表示（総額表示義務） | ○ |
| 送料 | 送料の有無・金額 | ○ |
| 支払方法 | クレジットカード・銀行振込等 | ○ |
| 支払時期 | 注文確定時・商品到着後等 | ○ |
| 商品引渡時期 | 発送までの日数 | ○ |
| 返品・交換 | 条件・期限・送料負担 | ○ |
| 申込み撤回（クーリングオフ） | 通信販売は法定クーリングオフなし・返品特約の記載 | ○ |

### 16.3 業種別コンプライアンスチェック

システム内でカテゴリ別の法令チェックを自動化する。

#### 一般商材（BtoB/BtoC）
- 特商法表示の完備確認
- 景表法チェック（価格表示・二重価格表示・「最安値」等の根拠）
- 総額表示義務（税込価格の明示）
- 返品特約の明示

#### 健康食品・化粧品（BtoB/BtoC）
上記に加えて：
- 薬機法チェック（効能効果をうたう表現のNG判定）
- 食品表示法チェック（アレルゲン・原材料・栄養成分表示の有無）
- 健康増進法チェック（虚偽・誇大な健康効果表示の検出）
- 機能性表示食品の届出番号確認
- 製造販売業許可番号の記載確認

#### オークション・中古品
- 古物営業法に基づく古物商許可番号の表示
- 本人確認（KYC）の実施
- 取引記録の帳簿保存（3年間）

#### 食品
- 食品衛生法に基づく営業許可の確認
- 賞味期限・消費期限の表示
- アレルゲン28品目の表示
- HACCP対応の衛生管理記録

### 16.4 EC連携時の法令対応

外部ECプラットフォーム（ネクストエンジン・Shopify・BASE・楽天・Yahoo!等）との連携時は、各プラットフォームの規約に加えて以下を遵守する。

| 項目 | 対応内容 |
|------|---------|
| 個人情報の取得同意 | 各ECの顧客情報取得時にプライバシーポリシーへの同意を確認 |
| データ保管期間 | 注文データは法定帳簿保存期間（7年）に準拠 |
| 越境EC対応 | 輸出入規制、関税、各国消費者保護法の確認 |
| ステップメール配信 | 特電法（特定電子メール法）準拠：オプトイン取得、配信停止機能 |
| クレジットカード情報 | PCI DSS準拠、カード情報の非保持化（Stripe経由） |

### 16.5 インボイス制度対応

2023年10月施行の適格請求書等保存方式（インボイス制度）に対応。

- 適格請求書発行事業者登録番号の表示
- 税率ごとの消費税額の記載
- BtoB帳票（見積書・請求書・納品書）へのインボイス記載事項の自動出力
- 免税事業者との取引における経過措置（仕入税額控除80%→50%）の計算対応

### 16.6 コンプライアンス管理機能

| 機能 | 説明 | 実装状態 |
|------|------|---------|
| プルーフチェーン | 出品者証明→商品証明→在庫証明→所有権→納品証明の5段階 | 実装済み |
| LP薬機法チェック | クリエイターLP内の表現をAIで薬機法チェック | 実装済み |
| 特商法表示ページ | `/legal` で法定表示事項を網羅 | 実装済み |
| プライバシーポリシー | `/privacy` で個人情報取扱いを明示 | 実装済み |
| 年齢確認 | 酒類・たばこ等の年齢制限商品の確認フロー | 未実装 |
| 輸出管理 | 該非判定・EAR規制チェック | 未実装 |

---

## 18. Stripe Connect パートナーペイアウト管理

### 18.1 概要

メーカー（パートナー）が商品を販売した際、プラットフォーム手数料を差し引いた利益分が自動でメーカーのStripeアカウントに送金される。

### 18.2 アーキテクチャ

```
購入者がCheckout → Stripe決済 → Webhook受信
  → partner_id特定（product.partner_id経由）
  → パートナーのstripe_account_id確認
    → 接続済み: Stripe Transfer APIで即時送金
    → 未接続: partner_payoutsにpendingで記録
```

### 18.3 手数料計算

| 項目 | 計算式 |
|------|--------|
| 売上総額 | Stripe決済金額 |
| プラットフォーム手数料 | 売上総額 × 12% |
| アフィリエイト報酬 | 売上総額 × 2%（アフィリエイト経由の場合） |
| メーカー受取額 | 売上総額 − 手数料 − アフィリエイト報酬 |

### 18.4 Stripe Connectオンボーディング

| ステップ | 内容 |
|---------|------|
| 1. 接続開始 | パートナープロフィール → 「Stripeアカウントを接続する」 |
| 2. Stripe画面 | Stripe hosted onboarding で本人確認・口座登録 |
| 3. 完了確認 | `/partner/stripe/complete` で charges_enabled/payouts_enabled を検証 |
| 4. ステータス更新 | partners.stripe_connect_status を "connected" に更新 |

### 18.5 データベース

```
partners テーブル（追加カラム）:
  stripe_account_id text          -- Stripe Connect アカウントID
  stripe_connect_status text      -- not_connected | pending | connected | disabled
  stripe_onboarding_completed_at timestamptz

partner_payouts テーブル:
  id, partner_id, stripe_session_id, stripe_transfer_id,
  gross_amount, platform_fee, affiliate_commission, net_amount,
  status (pending | transferred | failed | refunded),
  lot_purchase_id, transferred_at, error_message, created_at
```

### 18.6 APIルート

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/stripe-connect?partner_id=xxx` | Connectステータス・売上サマリー取得 |
| POST | `/api/stripe-connect` | オンボーディング開始・URL再生成 |

### 18.7 パートナーUI

パートナープロフィール（`/partner/profile`）に「売上受取設定」セクション:
- 接続ステータス表示（未接続/設定中/接続済み）
- 売上サマリー（総売上/手数料/受取済/未送金）
- Stripeダッシュボードへのリンク

---

## 19. 記事LP（SNSバイラルテンプレート）

### 19.1 概要

Threads・X(Twitter)・Instagram等のSNSでバズっている投稿形式を再現した記事LPを作成し、商品の認知拡大・コンバージョン向上を実現する。

### 19.2 テンプレート一覧

| ID | テンプレート名 | 特徴 |
|----|--------------|------|
| threads_viral | Threads風バイラル | 短文連投形式、エンゲージメント表示 |
| twitter_thread | X(Twitter)スレッド風 | データ・事例ベースの説得型 |
| instagram_story | Instagramストーリー風 | ビジュアル重視のカード型 |
| note_article | note記事風 | 長文マークダウン、目次付き |
| listicle | リスト型記事 | 「○選」形式、スキャンしやすい |
| comparison | 比較記事 | A vs B形式、客観データ比較 |
| how_to | ハウツー記事 | ステップバイステップ手順 |
| case_study | 事例紹介 | 導入事例ストーリー、数値実績 |
| custom | カスタム | 自由構成 |

### 19.3 記事専用ブロック

| ブロック | 説明 |
|---------|------|
| article_header | タイトル・著者・日付・読了時間・カバー画像 |
| article_body | スレッド形式/マークダウン/カードリスト（3モード） |
| sns_embed | SNS投稿の埋め込み表示（Threads/X/Instagram/TikTok/YouTube） |
| author_profile | 著者プロフィール（カード/インライン/バナー） |
| related_articles | 関連記事一覧（グリッド/リスト/カルーセル） |

### 19.4 マーケティング用ブロック

| ブロック | 説明 |
|---------|------|
| viral_cta | シェアボタン＋CTAボタン（フローティング/インライン/スティッキー） |
| social_proof | カウンター/ティッカー/バッジ（アニメーション対応） |
| countdown_timer | カウントダウンタイマー（デジタル/フリップ/円形） |
| ab_variant | A/Bテストのバリアント分岐 |
| popup_trigger | スクロール/時間/離脱意図トリガーのポップアップ |

### 19.5 データベース

```
article_lp_designs テーブル:
  id, affiliate_id, slug, title, description, cover_image_url,
  category, tags[], template_type, design_config (jsonb),
  theme (jsonb), seo_config (jsonb), analytics_config (jsonb),
  is_published, published_at, views_count, share_count,
  conversion_count, created_at, updated_at
  UNIQUE(affiliate_id, slug)
```

### 19.6 APIルート

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/articles` | 記事LP一覧（フィルタ: affiliate_id, category, published） |
| POST | `/api/articles` | 記事LP作成（テンプレート自動適用） |

### 19.7 管理画面

`/admin/articles` で記事LPの一覧・作成・統計サマリー（総記事数/公開中/閲覧数/CV数）を管理。

---

## 20. マーケティングダッシュボード・分析・レポート

### 20.1 概要

LP・記事・商品の販売パフォーマンスを一元管理し、データドリブンなマーケティング施策を支援する。

### 20.2 KPI指標

| 指標 | 説明 |
|------|------|
| 総閲覧数 | LP + 記事LP の合計ページビュー |
| 総シェア数 | SNSシェア回数 |
| コンバージョン数 | 購入・フォーム送信等の目標達成数 |
| CVR | コンバージョン率（CV / 閲覧数 × 100） |
| 総売上 | 期間内の売上合計（円） |
| 報酬合計 | アフィリエイト報酬合計 |
| CPA | 顧客獲得単価 |
| ROAS | 広告費用対効果 |

### 20.3 分析軸

| 軸 | 内容 |
|----|------|
| テンプレート別 | 各テンプレートの閲覧/シェア/CV/CVR |
| カテゴリ別 | 記事カテゴリごとのパフォーマンス |
| 期間別 | 日次/週次/月次/キャンペーン単位 |
| リファラー別 | 流入元ドメイントップ10 |
| デバイス別 | PC/モバイル/タブレットの割合 |

### 20.4 レポートAPI

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/marketing/reports` | 期間別レポート（KPI/テンプレート別/カテゴリ別/トップ記事） |
| GET | `/api/marketing/analytics` | コンテンツ別アナリティクス（イベント集計/日別/リファラー） |
| POST | `/api/marketing/analytics` | イベント記録（page_view/click/scroll/conversion/share） |

### 20.5 データベース

```
marketing_events テーブル:
  id, event_type, content_id, content_type,
  metadata (jsonb: user_agent, referer, timestamp),
  created_at
```

### 20.6 管理画面

`/admin/marketing` でマーケティングダッシュボードを表示:
- KPIカード8種（閲覧/シェア/CV/CVR/売上/報酬/公開LP数/公開記事数）
- テンプレート別パフォーマンス
- カテゴリ別パフォーマンス
- トップ記事TOP10（タイトル/閲覧/シェア/CV/CVR）

### 20.7 ロットLPアクセストラッキング

ロットLP（`/products/[slug]/[lotId]`）にアクセストラッカー（LPViewTracker）を埋め込み、`marketing_events` テーブルに `content_type = "lot_lp"` でイベントを記録。

記録データ: referrer, user_agent, page_path, product_id, lot_id, partner_id

---

## 21. ECプラットフォーム連携コネクタ

### 21.1 概要

外部ECプラットフォームの受注データを自動取得し、ステップメールキャンペーンへの登録やCRM連携を行う。最大7並列で同期実行。

### 21.2 対応プラットフォーム

| コネクタ | 認証方式 | API |
|---------|---------|-----|
| ネクストエンジン | OAuth2 | REST API v1 |
| Shopify | OAuth2 | Admin REST API 2024-01 |
| BASE | OAuth2 | BASE API v1 |
| STORES.jp | OAuth2 | STORES API v1 |
| MakeShop | APIキー認証 | MakeShop API v1 |
| カラーミーショップ | OAuth2 | ColorMe API v1 |
| 楽天市場 | サービスシークレット＋ライセンスキー | RMS API v2 |
| Yahoo!ショッピング | OAuth2 (Yahoo! ID連携) | Shopping WebService V1 |

### 21.3 同期フロー

```
ECプラットフォーム → コネクタがfetchNewOrders()
  → EcOrder共通形式に変換
  → mapToStepMailEvent()でイベント変換
  → enrollInCampaign()でステップメール登録
  → last_synced_at更新 + 同期ログ記録
```

### 21.4 並列実行

`syncAllConnectors()` は `Promise.allSettled` で最大7並列バッチ実行。1コネクタの失敗が他に影響しない。

### 21.5 APIルート

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/ec-connectors` | コネクタ一覧 |
| POST | `/api/ec-connectors/[connectorType]/sync` | 手動同期 |
| GET | `/api/ec-connectors/[connectorType]/callback` | OAuthコールバック |
| GET | `/api/cron/step-mail` | 定期同期（全コネクタ＋メール配信） |

### 21.6 データベース

```
ec_connectors テーブル:
  id, connector_type (unique), name, credentials (jsonb),
  settings (jsonb), is_active, last_synced_at,
  sync_interval_minutes, created_at, updated_at

ec_connector_sync_logs テーブル:
  id, connector_id, orders_fetched, events_created,
  errors[], synced_at
```

### 21.7 管理画面

`/admin/ec-connectors` で接続済み/利用可能なコネクタの管理、手動同期トリガー、同期状況の確認。

---

## 22. モバイルレスポンシブデザイン

### 22.1 方針

モバイルファーストのレスポンシブデザイン。Tailwind CSSのブレークポイントを使用。

| ブレークポイント | 幅 | 対応デバイス |
|---------------|-----|------------|
| (default) | 0px〜 | スマートフォン |
| sm: | 640px〜 | 大型スマートフォン |
| md: | 768px〜 | タブレット |
| lg: | 1024px〜 | デスクトップ |

### 22.2 管理画面のモバイル対応

| 要素 | デスクトップ | モバイル |
|------|------------|---------|
| サイドバー | 常時表示（w-64） | ハンバーガーメニュー（スライドイン） |
| KPIカード | 4列グリッド | 1-2列グリッド |
| データテーブル | フル表示 | 横スクロール対応 |
| モーダル | 中央表示 | フルスクリーン |
| パディング | p-8 | p-4 |

### 22.3 パートナー画面のモバイル対応

- プロフィール: 2カラム → 1カラム（md:grid-cols-2）
- Stripe Connect: 売上サマリー4列 → 2列
- 帳票一覧: テーブル横スクロール対応

### 22.4 公開ページのモバイル対応

- LP/記事LP: ブロックが自動で1カラムに
- 商品詳細: 画像/情報が縦積み
- フロー図: 凡例グリッドが1列に展開

---

## 23. 関連文書

| 文書ID | タイトル | 概要 |
|--------|---------|------|
| REQ-BUYING-AGENT-001 | 購買エージェント機能 要件定義書 | 購買エージェントの詳細要件 |
| DES-BUYING-AGENT-001 | 購買エージェント機能 設計書 | 購買エージェントの詳細設計 |
| REQ-EMBED-001 | EC埋め込みウィジェット 要件定義書 | 埋め込みウィジェットの要件 |
| DES-EMBED-001 | EC埋め込みウィジェット 設計書 | 埋め込みウィジェットの詳細設計 |

---

## 23. 商品Q&A（メーカー・生産者への質問）

### 23.1 概要

購入者が商品・サービスについてメーカーや生産者に直接質問でき、回答済みのQ&AがロットLP上に公開される。

### 23.2 データモデル

| フィールド | 型 | 説明 |
|-----------|------|------|
| product_id | uuid | 対象商品 |
| lot_id | uuid | 対象ロット（任意） |
| partner_id | uuid | 回答するパートナー |
| questioner_name | text | 質問者名 |
| questioner_email | text | 質問者メール（任意） |
| question | text | 質問内容 |
| answer | text | 回答内容 |
| status | text | 未回答/回答済み |

### 23.3 画面

| パス | 概要 |
|------|------|
| ロットLP内 QuestionSection | 回答済みQ&A一覧 + 質問フォーム |
| `/partner/questions` | パートナー質問一覧 |
| `/partner/questions/[id]` | 質問詳細・回答入力 |
| `/admin/questions` | 管理者Q&A一覧 |
| `/admin/questions/[id]` | 管理者Q&A詳細・削除 |

---

## 24. 定期購入

### 24.1 概要

サブスクリプション（Stripe Subscription）ではなく、指定頻度で繰り返し注文・決済を行う定期購入機能。初回はStripe Checkoutで決済し、以降は次回配送日に基づくスケジュール管理。

### 24.2 データモデル

| フィールド | 型 | 説明 |
|-----------|------|------|
| lot_id | uuid | 対象ロット |
| product_id | uuid | 対象商品 |
| partner_id | uuid | パートナー |
| customer_name | text | 顧客名 |
| customer_email | text | 顧客メール |
| frequency | text | 毎週/隔週/毎月/隔月 |
| quantity | integer | 数量 |
| next_delivery_date | date | 次回配送日 |
| status | text | 有効/一時停止/解約 |
| total_deliveries | integer | 累計配送回数 |

### 24.3 フロー

```
ロットLP「定期購入で申し込む」
  → 頻度・名前・メール入力
  → POST /api/recurring
  → 初回Stripe決済
  → recurring_orders レコード作成（next_delivery_date 自動計算）
  → 管理画面/パートナー画面で管理（有効/一時停止/解約）
```

### 24.4 画面

| パス | 概要 |
|------|------|
| ロットLP内 RecurringPurchaseForm | 定期購入申し込みフォーム |
| `/admin/recurring` | 管理者定期購入一覧 |
| `/admin/recurring/[id]` | 詳細・ステータス変更 |
| `/partner/recurring` | パートナー定期購入一覧 |

---

## 25. ASPアフィリエイトサービス

### 25.1 概要

本プラットフォームがASP（アフィリエイト・サービス・プロバイダー）として機能し、外部サイトとのアフィリエイト連携を提供する。広告主（外部サイト）がプログラムを登録し、既存のアフィリエイターがプログラムに参加して成果報酬を得る。

### 25.2 データモデル

| テーブル | 概要 |
|---------|------|
| asp_advertisers | 広告主（外部サイト）。APIキー・ドメイン・報酬率 |
| asp_programs | 案件。報酬タイプ（成果報酬/クリック報酬/リード報酬）・金額/率 |
| asp_clicks | クリックログ。click_id・referrer・IP・UA |
| asp_conversions | コンバージョン。click_id紐づけ・金額・コミッション・ステータス（発生→承認→支払済み） |

### 25.3 外部サイト連携フロー

```
1. 管理画面で広告主登録 → APIキー自動発行
2. 広告主サイトにトラッキングJS埋め込み（GET /api/asp/tracking.js）
3. アフィリエイターが紹介リンク付きで誘導（?ref=CODE）
4. クリック記録 → Cookie保存 → click_id発行
5. 購入完了時に広告主がコンバージョンAPI呼び出し（POST /api/asp/conversion）
6. コミッション自動計算 → 管理画面で承認・支払管理
```

### 25.4 画面

| パス | 概要 |
|------|------|
| `/admin/asp` | ASPダッシュボード（広告主/プログラム/コンバージョン一覧） |
| `/admin/asp/advertisers/new` | 広告主新規登録 |
| `/affiliate/asp` | アフィリエイター向けプログラム一覧・紹介リンク取得 |

### 25.5 APIルート

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/asp/click` | クリック記録・click_id発行 |
| POST | `/api/asp/conversion` | コンバージョン記録（X-Api-Key認証） |
| GET | `/api/asp/programs` | 募集中プログラム一覧 |
| GET | `/api/asp/tracking.js` | 外部サイト埋め込み用トラッキングスクリプト |

---

## 26. LPアクセス分析

### 26.1 概要

ロットLP（`/products/[slug]/[lotId]`）のアクセス状況を分析するダッシュボード。流入元・流出・PV・CVRを可視化し、マーケティング施策の効果測定を支援する。

### 26.2 トラッキング方式

LPViewTrackerコンポーネントをロットLPに埋め込み、ページビューイベントを `marketing_events` テーブルに記録。

記録データ: content_type("lot_lp"), referrer, user_agent, page_path, product_id, lot_id, partner_id

### 26.3 分析指標

| 指標 | 説明 |
|------|------|
| 総PV | 期間内のページビュー合計 |
| 流入元数 | ユニークな流入ドメイン数 |
| CV数 | コンバージョン（購入完了）数 |
| CVR | コンバージョン率 |
| 流入経路 | 直接/検索/SNS/アフィリエイト/その他の分類 |
| 流入元TOP10 | リファラードメインランキング |
| 商品別PV | 商品ごとのPVランキング |
| 日別PV推移 | 日次のPV数グラフ |

### 26.4 画面

| パス | 概要 |
|------|------|
| `/admin/lp-analytics` | 管理者LPアクセス分析ダッシュボード（全商品） |
| `/partner/lp-analytics` | パートナーLPアクセス分析（自社商品のみ） |
