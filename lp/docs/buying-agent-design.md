# 購買エージェント機能 設計書

| 項目 | 内容 |
|------|------|
| 文書ID | DES-BUYING-AGENT-001 |
| バージョン | 1.2 |
| 作成日 | 2026-03-03 |
| 更新日 | 2026-03-06 |
| ステータス | 実装済み |
| 対応要件 | REQ-BUYING-AGENT-001 v1.2 |
| 関連文書 | REQ-SYSTEM-001（システム全体要件）, DES-EMBED-001（埋め込みウィジェット設計） |

---

## 1. システムアーキテクチャ

### 1.1 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router), React 19 Server Components, Tailwind CSS 4 |
| バックエンド | Next.js Server Actions, Supabase RPC (PL/pgSQL) |
| データベース | PostgreSQL (Supabase), Row Level Security |
| 認証 | Supabase Auth + user_profiles テーブルによるロール管理 |

### 1.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│  ブラウザ                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ LoginForm│  │ Sidebar  │  │ SpecRequirements │   │
│  │(client)  │  │(client)  │  │(client)          │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ form action / fetch
┌───────────────────────▼─────────────────────────────┐
│  Next.js Server                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ middleware.ts                                 │   │
│  │  - /buyer/* ルート保護                        │   │
│  │  - ロールベースリダイレクト                     │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Server Components (pages)                     │   │
│  │  - buyer/page.tsx (ダッシュボード)             │   │
│  │  - buyer/agents/page.tsx (一覧)               │   │
│  │  - buyer/agents/new/page.tsx (新規作成)        │   │
│  │  - buyer/agents/[id]/page.tsx (編集)           │   │
│  │  - buyer/agents/[id]/results/page.tsx (結果)   │   │
│  │  - buyer/inquiries/page.tsx (注文リスト)       │   │
│  │  - buyer/orders/page.tsx (購入履歴)            │   │
│  │  - partner/inquiries/page.tsx (引合い一覧)     │   │
│  │  - partner/inquiries/[id]/page.tsx (引合い詳細)│   │
│  │  - admin/buying-agents/page.tsx (管理者閲覧)   │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Server Actions (buyer/actions.ts)             │   │
│  │  - createAgent / updateAgent / deleteAgent    │   │
│  │  - runAgent / submitInquiry / updateResultSt. │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Server Actions (partner/inquiries/actions.ts) │   │
│  │  - updateInquiryStatus (承諾/辞退+理由)       │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ lib/auth.ts                                   │   │
│  │  - requireBuyerId()                           │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ Supabase Client
┌───────────────────────▼─────────────────────────────┐
│  Supabase (PostgreSQL)                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ Tables: buying_agents, agent_results,          │   │
│  │         agent_inquiries                       │   │
│  │ RPC: run_buying_agent(p_agent_id)             │   │
│  │ RLS: owner_id ベースのアクセス制御             │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ 参照テーブル:                                  │   │
│  │  products, lots, partners, tags, product_tags │   │
│  │  entity_proofs, product_proofs,               │   │
│  │  inventory_proofs                             │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 2. データベース設計

### 2.1 ER 図

```
user_profiles (id, role, partner_id, display_name)
    │ id = owner_id                    │ id = buyer_id
    ▼                                  ▼
buying_agents (id, owner_id, name, ...)
    │ id = agent_id
    ▼
agent_results (id, agent_id, lot_id, product_id, scores..., status)
    │               │              │
    │               ▼              ▼
    │           lots (id, ...)   products (id, partner_id, ...)
    │                              │
    │                              ▼
    │                          partners (id, certification_status, ...)
    │                              │       ▲
    │                              ▼       │ partner_id
    │                      entity_proofs   │
    │                      product_proofs  │
    │                      inventory_proofs│
    │                                      │
    ├──── tags (via target_tag_ids) ──► product_tags ──► tags
    │
    │ agent_result_id
    ▼
agent_inquiries (id, agent_result_id, buyer_id, partner_id,
                 buyer_price, buyer_quantity, buyer_notes,
                 partner_status, rejection_reason, ...)
```

### 2.2 テーブル定義

#### 2.2.1 buying_agents（購買エージェント設定）

| カラム | 型 | NULL | デフォルト | 制約 | 説明 |
|--------|-----|------|----------|------|------|
| id | uuid | NO | uuid_generate_v4() | PK | |
| owner_id | uuid | NO | | FK → auth.users(id) ON DELETE CASCADE | エージェント所有者 |
| name | text | NO | | | エージェント名 |
| description | text | YES | | | 説明 |
| keyword | text | YES | | | 検索キーワード |
| target_tag_ids | jsonb | NO | '[]' | | 対象タグIDの配列 |
| min_price | integer | YES | | | 最低価格 |
| max_price | integer | YES | | | 最高価格 |
| require_certified | boolean | NO | false | | 認証済みパートナーのみ |
| require_entity_proof | boolean | NO | false | | 主体証明（検証済み）必須 |
| require_product_proof | boolean | NO | false | | 商品証明（検証済み）必須 |
| spec_requirements | jsonb | NO | '[]' | | 成分・特徴条件の配列 |
| certification_weight | integer | NO | 80 | CHECK 0-100 | 認証スコア重み |
| proof_chain_weight | integer | NO | 60 | CHECK 0-100 | 証明チェーン重み |
| preferred_partner_type | text | YES | | CHECK ('メーカー','代理店') | パートナー種別フィルタ |
| require_in_stock | boolean | NO | true | | 在庫あり必須 |
| min_total_score | numeric(5,2) | YES | | | 最低総合スコア |
| status | text | NO | '有効' | CHECK ('有効','一時停止') | エージェントステータス |
| last_run_at | timestamptz | YES | | | 最終実行日時 |
| created_at | timestamptz | NO | now() | | |
| updated_at | timestamptz | NO | now() | | |

**インデックス:**
- `idx_buying_agents_owner` ON (owner_id)

**spec_requirements の JSONB 構造:**
```json
[
  { "label": "成分", "value": "ビタミンC" },
  { "label": "原産地", "value": "北海道" },
  { "label": "認定・規格", "value": "有機JAS" }
]
```

#### 2.2.2 agent_results（エージェント実行結果）

| カラム | 型 | NULL | デフォルト | 制約 | 説明 |
|--------|-----|------|----------|------|------|
| id | uuid | NO | uuid_generate_v4() | PK | |
| agent_id | uuid | NO | | FK → buying_agents(id) ON DELETE CASCADE | |
| lot_id | uuid | NO | | FK → lots(id) | |
| product_id | uuid | NO | | FK → products(id) | |
| certification_score | numeric(5,2) | NO | 0 | | 認証スコア |
| proof_chain_score | numeric(5,2) | NO | 0 | | 証明チェーンスコア |
| tag_match_score | numeric(5,2) | NO | 0 | | タグマッチスコア |
| price_match_score | numeric(5,2) | NO | 0 | | 価格マッチスコア |
| spec_match_score | numeric(5,2) | NO | 0 | | 成分マッチスコア |
| total_score | numeric(5,2) | NO | 0 | | 総合スコア |
| score_details | jsonb | NO | '{}' | | スコア詳細 |
| status | text | NO | '未確認' | CHECK | 結果ステータス |
| created_at | timestamptz | NO | now() | | |

**制約:**
- `UNIQUE (agent_id, lot_id)` — 同一エージェント・ロットの重複防止

**インデックス:**
- `idx_agent_results_agent` ON (agent_id)
- `idx_agent_results_total` ON (total_score DESC)

**status の状態遷移:**
```
未確認 ──→ 確認済み
  │           │
  ├──→ 却下   ├──→ 購入済み
  │
  └──→ 購入済み
```

**score_details の JSONB 構造:**
```json
{
  "certification": { "score": 100, "status": "認証済み" },
  "proof_chain": {
    "score": 70,
    "entity_verified": 2, "entity_total": 3,
    "product_verified": 1, "product_total": 2,
    "has_inventory": true
  },
  "tag_match": { "score": 66.67, "matched": 2, "total": 3 },
  "price_match": { "score": 85.5, "price": 3000 },
  "spec_match": { "score": 50, "matched": 1, "total": 2 }
}
```

#### 2.2.3 agent_inquiries（引合い管理）

| カラム | 型 | NULL | デフォルト | 制約 | 説明 |
|--------|-----|------|----------|------|------|
| id | uuid | NO | uuid_generate_v4() | PK | |
| agent_result_id | uuid | NO | | FK → agent_results(id) ON DELETE CASCADE, UNIQUE | |
| agent_id | uuid | NO | | FK → buying_agents(id) ON DELETE CASCADE | |
| buyer_id | uuid | NO | | | バイヤーのユーザーID |
| product_id | uuid | NO | | FK → products(id) | |
| lot_id | uuid | NO | | FK → lots(id) | |
| partner_id | uuid | NO | | FK → partners(id) | |
| total_score | numeric(5,2) | NO | 0 | | マッチングスコア |
| score_details | jsonb | NO | '{}' | | スコア詳細 |
| buyer_price | integer | YES | | | バイヤー希望価格（指値） |
| buyer_quantity | integer | YES | | | バイヤー希望数量 |
| buyer_notes | text | YES | | | バイヤーメモ（要望など） |
| partner_status | text | NO | '新規' | CHECK ('新規','対応中','承諾','辞退') | パートナー対応ステータス |
| response_notes | text | YES | | | パートナー回答メモ |
| rejection_reason | text | YES | | | 辞退理由（辞退時に入力） |
| responded_at | timestamptz | YES | | | 回答日時 |
| created_at | timestamptz | NO | now() | | |
| updated_at | timestamptz | NO | now() | | |

**制約:**
- `UNIQUE (agent_result_id)` — 1結果に対して1引合い

**インデックス:**
- `idx_agent_inquiries_partner` ON (partner_id)
- `idx_agent_inquiries_buyer` ON (buyer_id)
- `idx_agent_inquiries_agent` ON (agent_id)
- `idx_agent_inquiries_status` ON (partner_status)

**partner_status の状態遷移:**
```
新規 ──→ 対応中 ──→ 承諾
  │         │
  ├──→ 承諾 ├──→ 辞退 (rejection_reason 保存)
  │
  └──→ 辞退 (rejection_reason 保存)
```

### 2.3 RLS ポリシー

#### buying_agents

| ポリシー名 | 操作 | 条件 |
|-----------|------|------|
| Owner select | SELECT | `auth.uid() = owner_id` |
| Owner insert | INSERT | `auth.uid() = owner_id` |
| Owner update | UPDATE | `auth.uid() = owner_id` |
| Owner delete | DELETE | `auth.uid() = owner_id` |
| Admin select all | SELECT | user_profiles.role = 'admin' |

#### agent_results

| ポリシー名 | 操作 | 条件 |
|-----------|------|------|
| Owner select results | SELECT | buying_agents.owner_id = auth.uid() (JOIN) |
| Owner insert results | INSERT | buying_agents.owner_id = auth.uid() (JOIN) |
| Owner update results | UPDATE | buying_agents.owner_id = auth.uid() (JOIN) |
| Admin select all results | SELECT | user_profiles.role = 'admin' |

#### agent_inquiries

| ポリシー名 | 操作 | 条件 |
|-----------|------|------|
| Buyers can view own inquiries | SELECT | auth.uid() = buyer_id |
| Buyers can insert own inquiries | INSERT | auth.uid() = buyer_id |
| Partners can view own inquiries | SELECT | partner_id IN (user_profiles.partner_id WHERE id = auth.uid()) |
| Partners can update own inquiries | UPDATE | partner_id IN (user_profiles.partner_id WHERE id = auth.uid()) |

### 2.4 user_profiles 変更

```sql
-- 変更前
CHECK (role IN ('admin', 'partner'))

-- 変更後
CHECK (role IN ('admin', 'partner', 'buyer'))
```

---

## 3. スコアリングアルゴリズム設計

### 3.1 処理フロー

```
run_buying_agent(p_agent_id)
  │
  ├── 1. エージェント取得 & オーナー検証 & ステータス確認
  │
  ├── 2. 既存の未確認結果をクリア
  │
  ├── 3. 対象ロット走査（ハードフィルタ適用）
  │     ├── 在庫フィルタ (require_in_stock)
  │     ├── キーワードフィルタ (keyword ILIKE)
  │     ├── 価格フィルタ (min_price, max_price)
  │     ├── パートナー種別フィルタ (preferred_partner_type)
  │     ├── 認証済みフィルタ (require_certified)
  │     ├── 主体証明フィルタ (require_entity_proof)
  │     └── 商品証明フィルタ (require_product_proof)
  │
  ├── 4. 各ロットのスコア算出
  │     ├── 4a. 認証スコア
  │     ├── 4b. 証明チェーンスコア
  │     ├── 4c. タグマッチスコア
  │     ├── 4d. 成分マッチスコア
  │     ├── 4e. 価格マッチスコア
  │     └── 4f. 総合スコア（重み付き平均）
  │
  ├── 5. 最低スコアチェック (min_total_score)
  │     └── 未満の場合 → スキップ (CONTINUE)
  │
  ├── 6. 結果 UPSERT (agent_results)
  │
  └── 7. 最終実行日時更新
```

### 3.2 各スコアの算出式

#### 3.2.1 認証スコア (certification_score)

```
certification_score = CASE partners.certification_status
  WHEN '認証済み'  THEN 100
  WHEN '未認証'    THEN 30
  WHEN '期限切れ'  THEN 10
  ELSE 30
END
```

#### 3.2.2 証明チェーンスコア (proof_chain_score)

```
entity_rate   = entity_proofs で status='検証済み' の割合 (0〜1)
product_rate  = product_proofs で status='検証済み' の割合 (0〜1)
has_inventory = inventory_proofs が存在するか (true/false)

proof_chain_score =
    entity_rate  * 100 * 0.3    -- 主体証明 30%
  + product_rate * 100 * 0.4    -- 商品証明 40%
  + (has_inventory ? 100 : 0) * 0.3  -- 在庫証明 30%
```

#### 3.2.3 タグマッチスコア (tag_match_score)

```
IF target_tag_ids が空 THEN
  tag_match_score = 100  -- 全商品マッチ扱い
ELSE
  matched = product_tags で tag_id が target_tag_ids に含まれる件数
  tag_match_score = (matched / target_tag_ids の要素数) * 100
END
```

#### 3.2.4 成分マッチスコア (spec_match_score)

```
IF spec_requirements が空 THEN
  spec_match_score = 100
ELSE
  searchable = products.description + product_proofs.spec_data (全件結合)
  matched = 0
  FOR EACH req IN spec_requirements:
    IF searchable ILIKE '%' || req.value || '%' THEN
      matched += 1
    END
  END
  spec_match_score = (matched / spec_requirements の要素数) * 100
END
```

#### 3.2.5 価格マッチスコア (price_match_score)

```
price = COALESCE(lots.price, products.base_price)

IF min_price AND max_price が指定かつ max_price > min_price THEN
  price_match_score = GREATEST(0, LEAST(100,
    (1 - (price - min_price) / (max_price - min_price)) * 100
  ))
  -- min_price に近いほど高スコア
ELSE
  price_match_score = 100
END
```

#### 3.2.6 総合スコア (total_score)

```
weight_sum = certification_weight + proof_chain_weight + 50 + 30 + 40
             (認証)                (証明チェーン)   (タグ)(価格)(成分)

total_score = (
    certification_score * certification_weight
  + proof_chain_score   * proof_chain_weight
  + tag_match_score     * 50
  + price_match_score   * 30
  + spec_match_score    * 40
) / weight_sum
```

**デフォルト重みでの配分:**

| スコア | 重み | 比率 |
|--------|------|------|
| 認証 | 80 | 30.8% |
| 証明チェーン | 60 | 23.1% |
| タグマッチ | 50 | 19.2% |
| 成分マッチ | 40 | 15.4% |
| 価格マッチ | 30 | 11.5% |
| **合計** | **260** | **100%** |

---

## 4. 認証・認可設計

### 4.1 ミドルウェア (middleware.ts)

```
リクエスト
  │
  ├── pathname が /admin/* or /partner/* or /buyer/* ?
  │   NO → そのまま通過
  │   YES ↓
  │
  ├── ユーザー認証済み?
  │   NO → /login?redirect=pathname にリダイレクト
  │   YES ↓
  │
  ├── user_profiles.role 取得
  │
  ├── /admin/* へのアクセス?
  │   YES → role が admin でなければ:
  │          buyer → /buyer にリダイレクト
  │          partner → /partner にリダイレクト
  │
  ├── /partner/* へのアクセス?
  │   YES → role が buyer なら /buyer にリダイレクト
  │
  └── /buyer/* へのアクセス?
      → 認証済みであればアクセス許可
```

**matcher 設定:**
```typescript
matcher: ["/admin/:path*", "/partner/:path*", "/buyer/:path*"]
```

### 4.2 認証関数 (auth.ts)

```typescript
// 既存
getSessionProfile()  → { user, profile, supabase }
requirePartnerId()   → { partnerId, supabase, profile }

// 新規追加
requireBuyerId()     → { buyerId, supabase, profile }
```

`requireBuyerId()` の実装:
```typescript
export async function requireBuyerId() {
  const { user, profile, supabase } = await getSessionProfile();
  if (profile.role !== "buyer") throw new Error("Buyer role required");
  return { buyerId: user.id, supabase, profile };
}
```

- `buyerId` は `auth.users.id`（= `user_profiles.id`）を使用
- partner と異なり `partner_id` ではなく `user.id` を所有者識別子とする

### 4.3 LoginForm のロールベースリダイレクト

```
ログイン成功
  │
  ├── redirect パラメータあり → そのURLへ
  ├── role = 'admin'  → /admin
  ├── role = 'buyer'  → /buyer
  └── その他          → /partner
```

---

## 5. Server Actions 設計

### 5.1 アクション一覧

| アクション | ファイル | 認証 | 説明 |
|-----------|---------|------|------|
| createAgent | buyer/actions.ts | requireBuyerId() | エージェント新規作成 |
| updateAgent | buyer/actions.ts | requireBuyerId() + owner_id チェック | エージェント更新 |
| deleteAgent | buyer/actions.ts | requireBuyerId() + owner_id チェック | 論理削除（一時停止） |
| runAgent | buyer/actions.ts | requireBuyerId() + owner_id チェック | RPC 呼び出し |
| submitInquiry | buyer/actions.ts | requireBuyerId() + 所有権JOIN検証 | 注文送信（引合い作成 + 確認済みに更新） |
| updateResultStatus | buyer/actions.ts | requireBuyerId() + 所有権JOIN検証 | 結果ステータス更新（却下用） |
| updateInquiryStatus | partner/inquiries/actions.ts | requirePartnerId() + partner_id チェック | 引合い対応（承諾/辞退 + 辞退理由保存） |

### 5.2 createAgent

```
入力: FormData
  ├── name (text, required)
  ├── description (text)
  ├── keyword (text)
  ├── tag_ids (text[], checkbox multiple)
  ├── min_price (number)
  ├── max_price (number)
  ├── require_certified (checkbox)
  ├── require_entity_proof (checkbox)
  ├── require_product_proof (checkbox)
  ├── spec_requirements (hidden, JSON string)
  ├── certification_weight (range, 0-100)
  ├── proof_chain_weight (range, 0-100)
  ├── preferred_partner_type (select)
  ├── require_in_stock (checkbox)
  └── min_total_score (number)

処理:
  1. requireBuyerId() で認証
  2. spec_requirements を JSON.parse
  3. buying_agents に INSERT (owner_id = buyerId)
  4. revalidatePath("/buyer/agents")
  5. redirect("/buyer/agents")
```

### 5.3 updateAgent

```
入力: id (string), FormData (createAgent と同じ)

処理:
  1. requireBuyerId() で認証
  2. buying_agents を UPDATE
     WHERE id = id AND owner_id = buyerId
  3. revalidatePath, redirect
```

### 5.4 deleteAgent

```
入力: id (string)

処理:
  1. requireBuyerId() で認証
  2. buying_agents を UPDATE: status = '一時停止'
     WHERE id = id AND owner_id = buyerId
  3. revalidatePath("/buyer/agents")
  4. redirect("/buyer/agents")
```

### 5.5 runAgent

```
入力: id (string)

処理:
  1. requireBuyerId() で認証
  2. buying_agents から id + owner_id で SELECT して所有権確認
  3. supabase.rpc('run_buying_agent', { p_agent_id: id })
  4. revalidatePath
  5. redirect("/buyer/agents/{id}/results")
```

### 5.6 submitInquiry

```
入力: resultId (string), FormData
  ├── buyer_price (number, optional)    -- 希望価格
  ├── buyer_quantity (number, optional)  -- 希望数量
  └── buyer_notes (text, optional)       -- メモ

処理:
  1. requireBuyerId() で認証
  2. agent_results から resultId で SELECT
     JOIN buying_agents で owner_id = buyerId を確認
  3. agent_results を UPDATE: status = '確認済み'
  4. products から partner_id を取得
  5. agent_inquiries に UPSERT:
     - agent_result_id, agent_id, buyer_id, product_id, lot_id, partner_id
     - total_score, score_details
     - buyer_price, buyer_quantity, buyer_notes
  6. revalidatePath (results + inquiries)
```

### 5.7 updateResultStatus

```
入力: resultId (string), newStatus (string)

処理:
  1. requireBuyerId() で認証
  2. agent_results から resultId で SELECT
     JOIN buying_agents で owner_id = buyerId を確認
  3. agent_results を UPDATE: status = newStatus
  4. revalidatePath
```

### 5.8 updateInquiryStatus

```
入力: inquiryId (string), newStatus (string), FormData
  ├── response_notes (text, optional)    -- 回答メモ
  └── rejection_reason (text, optional)  -- 辞退理由

処理:
  1. requirePartnerId() で認証
  2. agent_inquiries から inquiryId で SELECT
     partner_id = partnerId を確認
  3. agent_inquiries を UPDATE:
     - partner_status = newStatus
     - response_notes
     - rejection_reason (辞退時のみ保存)
     - responded_at, updated_at
  4. revalidatePath (partner/inquiries)
```

---

## 6. コンポーネント設計

### 6.1 コンポーネント一覧

| コンポーネント | ファイル | 種別 | 説明 |
|---------------|---------|------|------|
| BuyerSidebar | components/buyer/Sidebar.tsx | Client | ナビゲーションサイドバー |
| ScoreBar | components/buyer/ScoreBar.tsx | Server | スコア表示プログレスバー |
| SpecRequirements | components/buyer/SpecRequirements.tsx | Client | 動的条件入力フォーム |
| InquiryForm | components/buyer/InquiryForm.tsx | Client | 注文フォーム（希望価格・数量・メモ入力） |

### 6.2 BuyerSidebar

```
Props: { items: { href, label, icon }[] }
状態: usePathname() でアクティブ判定

テーマ: ティール系
  Active:   text-teal-600 bg-teal-50 font-medium
  Inactive: text-gray-700 hover:text-teal-600 hover:bg-teal-50

ナビ項目:
  📊 ダッシュボード    /buyer
  🤖 購買エージェント  /buyer/agents
  📋 注文リスト       /buyer/inquiries
  🧾 購入履歴         /buyer/orders
```

### 6.3 ScoreBar

```
Props: { label: string, value: number }

色分け:
  70以上: bg-teal-500 (緑系)
  40以上: bg-yellow-400 (黄系)
  40未満: bg-red-400 (赤系)

レイアウト: [ラベル 8文字] [プログレスバー] [数値]
```

### 6.4 SpecRequirements

```
Props: { defaultValue?: { label, value }[] }
状態: useState で specs 配列を管理

プリセットラベル:
  成分 / 原材料 / 原産地 / 製造方法 / 特徴 / 規格 / 認定・規格 / アレルゲン

UI:
  各行: [ラベル select] [値 input] [削除ボタン]
  「+ 条件を追加」ボタン

データ送信:
  <input type="hidden" name="spec_requirements" value={JSON.stringify(specs)} />
```

### 6.5 InquiryForm

```
Props: { resultId: string, lotPrice: number, lotStock: number }
状態: useState で open (展開/折畳み)、submitting (送信中)

折畳み時: 「注文する」ボタン表示
展開時:
  - 希望価格 (number input, placeholder=ロット価格)
  - 希望数量 (number input, placeholder=在庫数, max=lotStock)
  - メモ (textarea)
  - 「送信」「キャンセル」ボタン

送信: submitInquiry Server Action を呼出
```

---

## 7. 画面設計

### 7.1 レイアウト (buyer/layout.tsx)

```
┌──────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────┐ │
│ │ Sidebar  │ │ Main Content               │ │
│ │ w-64     │ │ flex-1 bg-gray-50 p-8      │ │
│ │ bg-white │ │                             │ │
│ │ border-r │ │  {children}                │ │
│ │          │ │                             │ │
│ │ ┌──────┐ │ │                             │ │
│ │ │Title │ │ │                             │ │
│ │ │購買   │ │ │                             │ │
│ │ │ポータル│ │ │                             │ │
│ │ │User  │ │ │                             │ │
│ │ └──────┘ │ │                             │ │
│ │ NavItems │ │                             │ │
│ │ ┌──────┐ │ │                             │ │
│ │ │Logout│ │ │                             │ │
│ │ └──────┘ │ │                             │ │
│ └──────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### 7.2 ダッシュボード (SCR-01)

```
┌─────────────────────────────────────────┐
│ ダッシュボード                   h1      │
│                                         │
│ ┌───────────┐┌───────────┐┌───────────┐ │
│ │エージェント ││未確認結果  ││購入済み    │ │
│ │    3      ││    12     ││    5      │ │
│ └───────────┘└───────────┘└───────────┘ │
└─────────────────────────────────────────┘
```

### 7.3 エージェント新規作成フォーム (SCR-03)

```
┌──────────────────────────────────────────────┐
│ 購買エージェント 新規作成              h1      │
│                                              │
│ ┌─ 基本情報 ──────────────────────────────┐  │
│ │ エージェント名 *  [________________]    │  │
│ │ 説明             [________________]    │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ── 検索条件 ──────────────────────────────── │
│ │ キーワード       [________________]    │  │
│ │ 最低価格 [______]  最高価格 [______]   │  │
│                                              │
│ ── 認証条件（絞り込み）──────────────────── │
│ │ ☐ 認証済みパートナーのみ               │  │
│ │ ☐ 主体証明（検証済み）が必須           │  │
│ │ ☐ 商品証明（検証済み）が必須           │  │
│ │ パートナー種別 [指定なし ▼]            │  │
│                                              │
│ ── 成分・特徴条件 ───────────────────────── │
│ │ [成分 ▼] [ビタミンC_______] [削除]     │  │
│ │ [原産地▼] [北海道__________] [削除]     │  │
│ │ + 条件を追加                           │  │
│                                              │
│ ── 対象タグ ─────────────────────────────── │
│ │ 生産者: ☐A ☐B ☐C                     │  │
│ │ メーカー: ☐X ☐Y                        │  │
│ │ カテゴリ: ☐α ☐β ☐γ                   │  │
│                                              │
│ ── スコア重み設定 ───────────────────────── │
│ │ 認証スコア重み    ──●──────── 80        │  │
│ │ 証明チェーン重み  ──●──────── 60        │  │
│ │ (タグ:50固定 / 価格:30固定 / 成分:40固定) │  │
│                                              │
│ ── その他条件 ───────────────────────────── │
│ │ ☑ 在庫ありの商品のみ対象にする         │  │
│ │ 最低総合スコア [____] (0-100)           │  │
│                                              │
│ [作成]                                       │
└──────────────────────────────────────────────┘
```

### 7.4 マッチング結果一覧 (SCR-05)

```
┌──────────────────────────────────────────────────────┐
│ マッチング結果                                 h1     │
│ エージェント名                        ← 設定に戻る   │
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ 商品名A                                        │   │
│ │ パートナーX [認証済] (メーカー)                  │   │
│ │ ロット: L001 / 在庫: 50 / ¥3,000 [販売中]      │   │
│ │                                                │   │
│ │   認証 ████████████████████░░  100              │   │
│ │   証明 ██████████████░░░░░░░░   70              │   │
│ │   タグ ████████████████░░░░░░   80              │   │
│ │   成分 ██████████░░░░░░░░░░░░   50              │   │
│ │   価格 ██████████████████░░░░   85              │   │
│ │                                                │   │
│ │                        総合 82.3               │   │
│ │                                                │   │
│ │       [注文する]→展開→希望価格/数量/メモ入力   │   │
│ │       注文済み: 希望¥2,800 / 数量10 / メモ...  │   │
│ │       辞退理由: 在庫不足のため (赤文字)         │   │
│ │                    [購入ページへ] [却下]         │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ 商品名B  (opacity-50 if 却下)                  │   │
│ │ ...                                            │   │
│ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 7.5 注文リスト (SCR-06)

```
┌──────────────────────────────────────────────────────────────┐
│ 注文リスト                                            h1      │
│                                                              │
│ ┌──────┬──────┬──────┬────────┬──┬──────┬──────────┬────┐   │
│ │商品名│ロット│取引先│希望価格 │数量│ステータス│辞退理由  │送信日│   │
│ ├──────┼──────┼──────┼────────┼──┼──────┼──────────┼────┤   │
│ │商品A │L001  │企業X │¥2,800  │10│[承諾]│ -       │3/3 │   │
│ │商品B │L002  │企業Y │¥5,000  │5 │[辞退]│在庫不足  │3/3 │   │
│ │商品C │L003  │企業Z │  -     │- │[新規]│ -       │3/3 │   │
│ └──────┴──────┴──────┴────────┴──┴──────┴──────────┴────┘   │
│                                                              │
│ ※ 辞退理由は赤文字で表示                                      │
└──────────────────────────────────────────────────────────────┘
```

### 7.6 パートナー引合い詳細 (SCR-10)

```
┌──────────────────────────────────────────────────────┐
│ 引合い詳細                         ← 引合い一覧に戻る │
│                                                      │
│ [新規] ステータスバッジ                               │
│                                                      │
│ ┌─ 商品情報 ──────────────────────────────────────┐  │
│ │ 商品名: 商品A    バイヤー: バイヤー太郎          │  │
│ │ ロット: L001     在庫: 50                       │  │
│ │ 価格: ¥3,000     ロット状態: [販売中]            │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌─ バイヤー希望条件 ─────────────────────────────┐  │
│ │ 希望価格: ¥2,800 (-¥200 赤文字)               │  │
│ │ 希望数量: 10                                   │  │
│ │ メモ: できるだけ早く納品希望                     │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌─ スコア内訳 ─────────────────────────────────┐    │
│ │ (ScoreBar x 5)               総合 82.3       │    │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ ┌─ 対応 ────────────────────────────────────────┐  │
│ │ 回答メモ     [_____________________________]  │  │
│ │ 辞退理由     [_____________________________]  │  │
│ │ （辞退する場合は必須）                          │  │
│ │                                                │  │
│ │ [対応開始] [承諾] [辞退]                       │  │
│ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 8. ファイル構成

### 8.1 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `lp/setup.sql` | buyer ロール追加、buying_agents/agent_results/agent_inquiries テーブル、run_buying_agent RPC 追加 |
| `lp/src/middleware.ts` | `/buyer/*` 保護、buyer ロールのリダイレクトルール追加 |
| `lp/src/lib/auth.ts` | `requireBuyerId()` 関数追加 |
| `lp/src/lib/types.ts` | `SpecRequirement`, `BuyingAgent`, `AgentResult`, `AgentInquiry` 型追加、`UserProfile.role` に `buyer` 追加 |
| `lp/src/components/auth/LoginForm.tsx` | buyer ロールの `/buyer` リダイレクト追加 |
| `lp/src/app/admin/layout.tsx` | ナビに「購買エージェント」項目追加 |
| `lp/src/app/buyer/actions.ts` | `submitInquiry` 追加、`updateResultStatus` を却下用に整理 |
| `lp/src/app/buyer/agents/[id]/results/page.tsx` | 注文フォーム統合 + 辞退理由表示 |
| `lp/src/app/buyer/layout.tsx` | ナビに「注文リスト」追加 |
| `lp/src/app/partner/inquiries/actions.ts` | `rejection_reason` 保存追加 |
| `lp/src/app/partner/inquiries/page.tsx` | 「希望価格」カラム追加 |
| `lp/src/app/partner/inquiries/[id]/page.tsx` | バイヤー希望条件セクション + 辞退理由フォーム |

### 8.2 新規ファイル

| ファイル | 種別 | 説明 |
|---------|------|------|
| `lp/supabase/migrations/20260303_add_buying_agents.sql` | SQL | DBマイグレーション |
| `lp/src/components/buyer/Sidebar.tsx` | Client Component | バイヤーサイドバー |
| `lp/src/components/buyer/ScoreBar.tsx` | Server Component | スコア表示バー |
| `lp/src/components/buyer/SpecRequirements.tsx` | Client Component | 動的条件入力 |
| `lp/src/app/buyer/layout.tsx` | Server Component | バイヤーポータルレイアウト |
| `lp/src/app/buyer/page.tsx` | Server Component | ダッシュボード |
| `lp/src/app/buyer/actions.ts` | Server Actions | 全アクション定義 |
| `lp/src/app/buyer/agents/page.tsx` | Server Component | エージェント一覧 |
| `lp/src/app/buyer/agents/new/page.tsx` | Server Component | エージェント新規作成 |
| `lp/src/app/buyer/agents/[id]/page.tsx` | Server Component | エージェント編集+プレビュー |
| `lp/src/app/buyer/agents/[id]/results/page.tsx` | Server Component | マッチング結果一覧 |
| `lp/src/app/buyer/orders/page.tsx` | Server Component | 購入履歴 |
| `lp/src/app/buyer/inquiries/page.tsx` | Server Component | バイヤー注文リスト一覧 |
| `lp/src/components/buyer/InquiryForm.tsx` | Client Component | 注文フォーム（希望価格・数量・メモ） |
| `lp/src/app/admin/buying-agents/page.tsx` | Server Component | 管理者エージェント一覧 |

---

## 9. テスト観点

### 9.1 認証・認可テスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-01 | 未ログインで /buyer にアクセス | /login にリダイレクト |
| T-02 | partner ロールで /buyer にアクセス | /partner にリダイレクト |
| T-03 | buyer ロールで /admin にアクセス | /buyer にリダイレクト |
| T-04 | buyer ロールで /partner にアクセス | /buyer にリダイレクト |
| T-05 | buyer ロールでログイン | /buyer にリダイレクト |
| T-06 | 他ユーザーのエージェントを編集 | エラーまたは 404 |

### 9.2 エージェント CRUD テスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-07 | 最小限の必須項目でエージェント作成 | 成功、一覧に表示 |
| T-08 | 全項目入力でエージェント作成 | 成功、全条件保存 |
| T-09 | エージェント名を変更して更新 | 成功、変更反映 |
| T-10 | エージェントを一時停止 | status='一時停止'、一覧で表示 |

### 9.3 スコアリングテスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-11 | 認証済みパートナーの商品 | certification_score = 100 |
| T-12 | 未認証パートナーの商品 | certification_score = 30 |
| T-13 | require_certified=true でエージェント実行 | 未認証パートナーの商品が除外 |
| T-14 | タグ3つ指定、2つマッチ | tag_match_score = 66.67 |
| T-15 | 成分条件2つ指定、1つマッチ | spec_match_score = 50 |
| T-16 | min_total_score=70 設定 | 70未満の結果が除外 |
| T-17 | 全条件なしで実行 | 全ロットが結果に含まれる |

### 9.4 結果管理テスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-18 | 結果を「却下」 | status='却下'、半透明表示 |
| T-19 | 再実行後、却下済みの結果 | 却下は保持、新しい未確認結果が追加 |
| T-20 | 「購入ページへ」リンク | /products/[slug]/[lotId] に遷移 |

### 9.5 注文フォームテスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-21 | 「注文する」ボタンクリック | 注文フォームが展開される |
| T-22 | 希望価格・数量・メモ入力して送信 | agent_inquiries に buyer_price, buyer_quantity, buyer_notes が保存 |
| T-23 | 送信後の結果カード | 注文内容の要約が表示される |
| T-24 | 希望価格・数量なしで送信 | NULL で保存され、引合いは正常に作成される |
| T-25 | 注文フォームのキャンセル | フォームが閉じ、「注文する」ボタンに戻る |

### 9.6 注文リストテスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-26 | バイヤーが注文リストを表示 | 自分の全引合いが一覧表示される |
| T-27 | 辞退された引合いの表示 | 辞退理由が赤文字で表示される |
| T-28 | 他バイヤーの引合い | 表示されない（buyer_id フィルタ） |

### 9.7 パートナー引合い対応テスト

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-29 | パートナーの引合い詳細でバイヤー希望条件表示 | 希望価格・数量・メモが表示される |
| T-30 | 希望価格とロット価格の差額表示 | 差額がハイライト表示される（+緑/-赤） |
| T-31 | パートナーが辞退 + 辞退理由入力 | rejection_reason が保存される |
| T-32 | パートナーが承諾 | partner_status='承諾'、rejection_reason は null |
| T-33 | バイヤー側に辞退理由が表示される | 結果ページ・注文リストに辞退理由が表示 |
| T-34 | パートナー引合い一覧に希望価格カラム | 希望価格が表示される |
