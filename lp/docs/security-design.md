# Cross Infinity セキュリティ対策 設計書

| 項目 | 内容 |
|------|------|
| 文書ID | DES-SECURITY-001 |
| バージョン | 1.0 |
| 作成日 | 2026-04-15 |
| 更新日 | 2026-04-15 |
| ステータス | 実装済み |
| 対応要件 | REQ-SECURITY-001 |

---

## 1. アーキテクチャ概要

```
ブラウザ
  │
  ├── proxy.ts (Edge Runtime)
  │     └── セッションリフレッシュのみ（DB照会なし）
  │         supabase.auth.getUser() → cookie更新
  │
  ├── Layout (Server Component)
  │     └── getPartnerData() / try-catch 保護
  │         ├── createSupabaseServerClient → getUser()
  │         └── createAdminClient → DB照会（RLS回避）
  │
  └── Page (Server Component)
        └── requirePartnerId() / requireBuyerId() / requireAdmin()
            ├── 認証失敗 → redirect("/login")（throwしない）
            └── admin client でDB照会
```

---

## 2. 認証・認可設計

### 2.1 認証フロー

```
ログイン(/login)
  ├── メール+パスワード → supabase.auth.signInWithPassword()
  └── Google OAuth → supabase.auth.signInWithOAuth()
        → /api/auth/callback
        → redirect 検証（相対パスのみ）
        → user_profiles + partners 自動作成（admin client）

新規登録(/signup)
  ├── supabase.auth.signUp()
  └── POST /api/signup/complete
        ├── auth.admin.getUserById() で検証
        ├── user_profiles upsert
        ├── partners insert + partner_id 紐付け
        └── admin role 設定を拒否
```

### 2.2 セッション管理

```
proxy.ts (全認証ルートで実行)
  │
  ├── createServerClient（cookie ベース）
  ├── supabase.auth.getUser()
  │     └── JWT 期限切れ → refresh_token で自動更新
  │           → setAll() で新しい cookie をレスポンスに設定
  └── NextResponse.next()（通過のみ、リダイレクトしない）

matcher: ["/admin/:path*", "/partner/:path*", "/buyer/:path*"]
```

### 2.3 認可関数

```typescript
// src/lib/auth.ts

getSessionProfile()
  ├── try { createSupabaseServerClient → getUser() } catch { }
  ├── user が null → redirect("/login")
  ├── createAdminClient → user_profiles 取得（RLS回避）
  └── profile が null → redirect("/login")

requirePartnerId()
  ├── getSessionProfile()
  ├── partner_id なし → 自動作成（admin client）
  └── redirect("/login") on failure

requireBuyerId()
  ├── getSessionProfile()
  └── role !== "buyer" → redirect("/login")

requireAdmin()
  ├── getSessionProfile()
  └── role !== "admin" → redirect("/partner")
```

---

## 3. 決済セキュリティ設計

### 3.1 チェックアウトフロー

```
POST /api/checkout
  │
  ├── 1. レート制限チェック（20 req/h per IP）
  │
  ├── 2. 入力検証
  │     ├── ロット存在・販売中・在庫確認
  │     ├── 最小注文数チェック
  │     └── 賞味期限チェック
  │
  ├── 3. 金額上限チェック
  │     └── totalAmount > ¥500,000 → 拒否
  │
  ├── 4. 在庫予約（reserve_lot_stock RPC）
  │
  ├── 5. Stripe Checkout Session 作成
  │     ├── 通常注文: mode="payment", 自動キャプチャ
  │     └── 高額注文（≥¥100,000）:
  │           ├── capture_method: "manual"
  │           └── metadata: { high_value: "true", requires_review: "true" }
  │
  └── 6. 3Dセキュア: Stripe が自動判定
        └── Stripe Radar: AI不正スコアリング
```

### 3.2 高額注文の手動キャプチャフロー

```
¥100,000以上の注文
  │
  ├── Stripe: オーソリのみ（カード枠確保、決済未確定）
  ├── metadata に high_value=true を付与
  │
  ├── 管理者: Stripe Dashboard で確認
  │     ├── 正常 → キャプチャ（決済確定）
  │     └── 不正疑い → キャンセル（オーソリ解放）
  │
  └── 7日間未対応 → オーソリ自動失効
```

### 3.3 定数定義

```typescript
// src/app/api/checkout/route.ts
const MAX_ORDER_AMOUNT = 500_000;     // 1回の注文上限
const HIGH_VALUE_THRESHOLD = 100_000; // 手動キャプチャ閾値
```

---

## 4. 商品登録セキュリティ設計

### 4.1 バリデーション

```
商品登録（フォーム / CSV）
  │
  ├── base_price > 0 必須（¥0以下は拒否）
  ├── base_price ≤ ¥500,000（超過は拒否）
  ├── name.length ≥ 2（2文字未満は拒否）
  │
  └── 取扱禁止商品の注意表示
        ├── 古物（古物営業法）
        ├── 酒類（酒税法）
        ├── たばこ（たばこ事業法）
        ├── 医薬品・医療機器（薬機法）
        └── 銃砲刀剣類（銃刀法）
```

### 4.2 対象ファイル

| ファイル | チェック内容 |
|---------|------------|
| `src/app/partner/products/actions.ts` | createPartnerProduct: 価格・名前バリデーション |
| `src/app/api/products/import/route.ts` | CSV一括: 同じバリデーション + 500件上限 |
| `src/app/partner/products/new/page.tsx` | 禁止商品の注意バナー |
| `src/app/partner/products/import/page.tsx` | 禁止商品の注意バナー |

---

## 5. レート制限設計

### 5.1 実装

```typescript
// src/lib/rate-limit.ts

rateLimit(key, { maxRequests, windowMs })
  ├── メモリベース Map で管理
  ├── key: "{endpoint}:{IP}" 形式
  ├── ウィンドウ期限切れ → カウントリセット
  └── 定期クリーンアップ（60秒ごと）

getClientIp(request)
  ├── x-forwarded-for ヘッダー
  ├── x-real-ip ヘッダー
  └── フォールバック: "unknown"
```

### 5.2 制限値

| エンドポイント | maxRequests | windowMs | 理由 |
|--------------|------------|----------|------|
| signup/complete | 10 | 1h | アカウント列挙防止 |
| affiliates/register | 10 | 1h | スパム登録防止 |
| creator/profile | 20 | 1min | ブルートフォース防止 |
| checkout | 20 | 1h | 不正決済防止 |
| auctions/checkout | 10 | 1h | 不正決済防止 |
| products/import | 5 | 1h | 大量登録防止 |

---

## 6. IDOR対策設計

### 6.1 クリエイター系API

```
リクエスト: { code, email, ... }
  │
  ├── affiliates テーブルで code+email 一致を検証
  ├── is_creator = true を確認
  ├── DB から affiliate_id を取得（クライアント入力を信頼しない）
  └── 対象リソースの affiliate_id と照合
```

### 6.2 対象エンドポイント

| エンドポイント | 検証方式 |
|--------------|---------|
| `PATCH /api/creator/profile` | code + email |
| `PUT /api/creator/designs/[id]` | code + email + DB所有権 |
| `PUT /api/creator/collections/[id]` | code + email + DB所有権 |
| `POST /api/articles` | code + email |
| `POST /api/signup/complete` | セッション本人確認 + admin role 拒否 |

---

## 7. データベース保護設計

### 7.1 admin client パターン

```
全ての認証済みページ
  │
  ├── createSupabaseServerClient → getUser()（認証のみ）
  │     └── anon key + cookie でセッション検証
  │
  └── createAdminClient → DB操作（RLS回避）
        └── service_role_key で全テーブルアクセス
```

**理由:** 本番DBのRLSポリシーが session-based client の読み取りをブロックするため、全DB操作を admin client 経由に統一。

### 7.2 Server Component / Client Component 境界

```
Server Component（page.tsx / layout.tsx）
  ├── DB操作: OK（admin client）
  ├── redirect(): OK
  └── render関数をClient Componentに渡す: NG
        → ServerDataTable を使用

Client Component（"use client"）
  ├── DB操作: NG（ブラウザからの直接mutation禁止）
  └── fetch() でAPI route経由: OK
```

---

## 8. エラーハンドリング設計

### 8.1 パターン

```
Layout:
  getPartnerData() {
    try {
      // 全DB操作
    } catch {
      return null;
    }
  }
  
  if (!data) redirect("/login");
  // ← redirect は try-catch の外で呼ぶ（Next.js が内部的に throw するため）

Page:
  requirePartnerId()
    → 認証失敗: redirect("/login")（throw しない）
    → DB操作は admin client でRLS回避
```

### 8.2 禁止パターン

```typescript
// NG: redirect を try-catch で囲む
try {
  redirect("/login"); // Next.js が throw → catch に捕まる
} catch {
  redirect("/login"); // 再度 throw → 無限ループ
}

// NG: Server Component から Client Component に関数を渡す
<DataTable render={(item) => item.name} />  // Error!

// OK: ServerDataTable（Server Component）を使う
<ServerDataTable render={(item) => item.name} />  // OK
```

---

## 9. ファイル構成

```
src/
├── proxy.ts                         # セッションリフレッシュ（Edge Runtime）
├── lib/
│   ├── auth.ts                      # 認証関数（requireAdmin等）
│   ├── rate-limit.ts                # レート制限
│   ├── supabase/
│   │   ├── server.ts                # session-based client（認証のみ）
│   │   ├── admin.ts                 # admin client（DB操作用）
│   │   └── client.ts                # browser client
│   └── stripe-connect.ts            # Stripe Connect 手数料計算
├── components/
│   └── admin/
│       ├── DataTable.tsx            # Client Component（batchActions用）
│       ├── ServerDataTable.tsx      # Server Component（render関数対応）
│       ├── DeleteButton.tsx         # 削除確認ダイアログ付き
│       └── SubmitButton.tsx         # 送信中状態表示
├── app/
│   ├── api/
│   │   ├── checkout/route.ts        # 金額上限 + 手動キャプチャ
│   │   ├── auctions/checkout/       # 同上
│   │   ├── signup/complete/         # admin role 拒否 + レート制限
│   │   ├── auth/callback/           # リダイレクト検証
│   │   ├── creator/profile/         # code+email 認証
│   │   ├── creator/designs/[id]/    # code+email + 所有権検証
│   │   ├── creator/collections/[id]/# code+email + 所有権検証
│   │   ├── articles/                # code+email 認証
│   │   ├── products/import/         # 価格バリデーション + レート制限
│   │   └── webhooks/stripe/         # 署名検証 + ログ最小化
│   └── legal/
│       ├── page.tsx                 # 特商法 + 禁止商品
│       └── seller-terms/page.tsx    # 出店規約（不正防止規定含む）
└── docs/
    ├── security-policy.md           # SEC-POLICY-001
    ├── security-requirements.md     # REQ-SECURITY-001（本書）
    └── security-design.md           # DES-SECURITY-001（本書）
```

---

## 10. 今後の拡張予定

| 対策 | 優先度 | タイミング |
|------|--------|----------|
| Stripe Webhook dispute イベント受信 | 高 | 本番移行時 |
| 管理画面に手動キャプチャ待ち一覧 | 高 | 本番移行時 |
| Redis ベースのレート制限（Upstash） | 中 | 利用者増加時 |
| 同一ユーザー短期間大量注文の自動検知 | 中 | 本番移行時 |
| KYC（本人確認）の強化 | 中 | 法令対応時 |
| WAF（Web Application Firewall）導入 | 低 | 大規模運用時 |
