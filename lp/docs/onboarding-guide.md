# CCAGI 開発環境セットアップ & オンボーディングガイド

| 項目 | 内容 |
|------|------|
| 文書ID | GUIDE-ONBOARDING-001 |
| バージョン | 1.0 |
| 作成日 | 2026-03-06 |
| 更新日 | 2026-03-06 |

---

## 1. 前提条件

| ツール | バージョン | 確認コマンド |
|--------|----------|------------|
| Node.js | v24 以上 | `node -v` |
| npm | v11 以上 | `npm -v` |
| Git | 最新推奨 | `git -v` |
| Docker Desktop | 最新推奨 | `docker info` |

> Docker は Supabase ローカル環境に必要です。

---

## 2. リポジトリ取得

```bash
git clone https://github.com/takeyani/ccagi.git
cd ccagi
```

### リポジトリ構成

```
ccagi/
├── cli.js              # ccagi-sdk CLI（Claude Agent SDK）
├── index.js            # エントリーポイント
├── package.json        # ルート（ccagi-sdk依存）
└── lp/                 # メインアプリ（Next.js 16）
    ├── package.json
    ├── next.config.ts
    ├── setup.sql       # DBスキーマ（マスター）
    ├── scripts/
    │   └── setup.sh    # ローカル環境自動セットアップ
    ├── src/
    │   ├── app/        # Next.js App Router（全ルート）
    │   ├── components/ # Reactコンポーネント
    │   ├── lib/        # ユーティリティ・型定義
    │   └── middleware.ts
    ├── supabase/       # Supabase設定・マイグレーション
    ├── public/         # 静的ファイル（embed.js等）
    └── docs/           # 設計ドキュメント
```

---

## 3. ローカル環境セットアップ

### 3.1 自動セットアップ（推奨）

```bash
cd lp
npm run setup
```

`setup.sh` が以下を自動実行します:

1. Docker起動確認
2. Supabase初期化（`supabase init`）
3. `setup.sql` → マイグレーションファイルへコピー
4. Supabaseコンテナ起動（初回は数分）
5. `.env.local` 自動生成（Supabase URL/Key）
6. `npm install`

### 3.2 Stripeキーの設定

自動生成された `.env.local` のStripeキーはプレースホルダーです。実際の値に差し替えてください。

```bash
# .env.local の該当箇所を編集
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_実際の値
STRIPE_SECRET_KEY=sk_test_実際の値
STRIPE_WEBHOOK_SECRET=whsec_実際の値
```

> Stripeテストキーはプロジェクト管理者から受け取ってください。

### 3.3 環境変数一覧

| 変数 | 説明 | 自動生成 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | setup.sh で自動 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | setup.sh で自動 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | setup.sh で自動 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー | 手動 |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー | 手動 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット | 手動 |
| `NEXT_PUBLIC_BASE_URL` | アプリのベースURL（省略時 localhost:3000） | 任意 |

---

## 4. 開発サーバー起動

```bash
cd lp
npm run dev
```

| URL | 用途 |
|-----|------|
| http://localhost:3000 | Next.js アプリ |
| http://127.0.0.1:54323 | Supabase Studio（DB管理UI） |

### よく使うコマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run lint          # ESLint 実行
npx tsc --noEmit      # TypeScript 型チェック
npm run dev:local     # setup + dev を一括実行

# Supabase
npm run supabase:start   # コンテナ起動
npm run supabase:stop    # コンテナ停止
npm run supabase:reset   # DBリセット（setup.sql再適用）
npm run supabase:status  # 状態確認
```

---

## 5. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| フレームワーク | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| スタイル | Tailwind CSS | 4.x |
| DB | PostgreSQL (Supabase) | - |
| 認証 | Supabase Auth | - |
| 決済 | Stripe | 20.x |
| D&D | @dnd-kit | 6.x / 10.x |
| 言語 | TypeScript | 5.x |

---

## 6. プロジェクト構成の理解

### 6.1 ユーザーロールとポータル

| ロール | ポータル | 主な機能 |
|--------|---------|---------|
| admin | `/admin/*` | 全データ管理、証明検証、ユーザー管理 |
| partner | `/partner/*` | 商品・在庫・帳票・証明・グループウェア |
| buyer | `/buyer/*` | 購買エージェント・注文管理 |
| (public) | `/`, `/c/*`, `/products/*` | 商品閲覧・購入 |
| creator | `/creator/*` | LP・コレクション作成（is_creator=trueのアフィリエイト） |

### 6.2 主要機能モジュール

| モジュール | 概要 | 詳細ドキュメント |
|----------|------|----------------|
| 商品・在庫管理 | Product/Lot/Tag CRUD、Stripe決済 | `system-requirements.md` §3 |
| 5層証明チェーン | 主体/商品/在庫/所有/配送の証明 | `system-requirements.md` §4 |
| 購買エージェント | 自動検索・5軸スコアリング・引合い | `buying-agent-requirements.md`, `buying-agent-design.md` |
| オークション | 入札・即決・自動入札 | `system-requirements.md` §5 |
| クリエイターLP | ブロックベースLP、コレクション | `system-requirements.md` §6 |
| EC埋め込みウィジェット | iframe埋め込み、外部EC対応 | `embed-requirements.md`, `embed-design.md` |
| 帳票管理 | 見積書・請求書・納品書 | `system-requirements.md` §7 |
| グループウェア | メッセージ・タスク・ファイル共有 | `system-requirements.md` §8 |

### 6.3 ディレクトリ規約

```
src/app/          → ルーティング（App Router）
src/app/*/actions.ts → Server Actions
src/app/api/      → API Routes
src/components/   → 機能別コンポーネント
  admin/          → 管理者UI
  buyer/          → バイヤーUI
  partner/        → パートナーUI
  creator-lp/     → クリエイターLP（ブロック、エディタ）
  groupware/      → グループウェア
  proofs/         → 証明チェーン
  shared/         → 共通コンポーネント
  auth/           → 認証
src/lib/          → ユーティリティ
  types.ts        → 全型定義（690行）
  auth.ts         → 認証ヘルパー
  supabase/       → Supabase クライアント（client/server/admin）
  creator-lp/     → LP関連ユーティリティ
```

---

## 7. 認証・ログインの確認

### 7.1 テストユーザー作成

Supabase Studio（http://127.0.0.1:54323）で:

1. **Authentication > Users** からユーザー作成
2. **Table Editor > user_profiles** でロール設定

```sql
-- 例: バイヤーユーザー追加
INSERT INTO user_profiles (id, role, display_name)
VALUES ('ユーザーのUUID', 'buyer', 'テストバイヤー');
```

### 7.2 ロール別ログイン後リダイレクト

| ロール | リダイレクト先 |
|--------|-------------|
| admin | `/admin` |
| partner | `/partner` |
| buyer | `/buyer` |

---

## 8. ドキュメント一覧

| ファイル | 文書ID | 内容 |
|---------|--------|------|
| `docs/system-requirements.md` | REQ-SYSTEM-001 | システム全体要件定義（全11モジュール） |
| `docs/buying-agent-requirements.md` | REQ-BUYING-AGENT-001 | 購買エージェント要件定義 |
| `docs/buying-agent-design.md` | DES-BUYING-AGENT-001 | 購買エージェント設計書 |
| `docs/embed-requirements.md` | REQ-EMBED-001 | EC埋め込みウィジェット要件定義 |
| `docs/embed-design.md` | DES-EMBED-001 | EC埋め込みウィジェット設計書 |
| `docs/onboarding-guide.md` | GUIDE-ONBOARDING-001 | 本書（セットアップ手順） |

---

## 9. 注意事項

### 9.1 リポジトリ公開状態

現在このリポジトリは **public** です。

- `.env.local` は `.gitignore` 済み（Gitに含まれない）
- Stripeキー・Supabaseキーを**絶対にコミットしない**こと
- 秘密情報は直接連絡で受け渡すこと

### 9.2 Gitignore 対象

| 対象 | 場所 |
|------|------|
| `node_modules/` | ルート & lp/ |
| `.env.local` | lp/ |
| `.next/` | lp/ |
| `.pem` ファイル | lp/ |

### 9.3 ブランチ運用

現在は `main` ブランチのみ。チーム開発開始時にブランチ戦略を決めることを推奨:

```
main ← develop ← feature/xxx
                ← fix/xxx
```

---

## 10. 困ったとき

| 問題 | 対処 |
|------|------|
| `supabase start` が失敗 | Docker Desktopが起動しているか確認 |
| DBが空 | `npm run supabase:reset` でスキーマ再適用 |
| 型エラー | `npx tsc --noEmit` で確認、`src/lib/types.ts` 参照 |
| ポート競合 | `lsof -i :3000` / `lsof -i :54323` で確認 |
| `.env.local` がない | `npm run setup` を再実行 |
