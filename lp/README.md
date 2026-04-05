# CCAGI マーケットプレイス

認証・証明チェーンを基盤としたBtoB/BtoCマーケットプレイスプラットフォーム。

メーカー/販売代理店が商品・在庫を登録し、バイヤーが購買エージェントで自動検索・スコアリングを行い、クリエイターがカスタムLPで商品を訴求する統合システム。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| DB | PostgreSQL (Supabase), Row Level Security |
| 認証 | Supabase Auth |
| 決済 | Stripe Checkout + Stripe Connect |
| テスト | Vitest |
| 言語 | TypeScript (Strict) |

## セットアップ

```bash
cd lp
npm run setup    # Supabase + DB + .env.local 自動構築
npm run dev      # http://localhost:3000
```

詳細は [docs/onboarding-guide.md](docs/onboarding-guide.md) を参照。

## 主要機能

- **商品・在庫管理** - Product/Lot/Tag CRUD、11カテゴリ対応
- **5層証明チェーン** - 主体/商品/在庫/所有/配送の認証
- **購買エージェント** - AI自動検索・5軸スコアリング・Cron自動実行（6h毎）
- **販売エージェント** - 在庫・引合い・賞味期限の自動監視
- **オークション** - 入札・即決・自動入札
- **クリエイターLP** - ブロックベースLP作成・コレクション
- **EC埋め込みウィジェット** - iframe埋め込み、外部EC対応
- **Stripe Connect** - メーカーへの自動売上送金
- **ステップメール** - トリガーベースのメール自動配信
- **グループウェア** - メッセージ・タスク・ファイル・カレンダー

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [docs/system-requirements.md](docs/system-requirements.md) | システム全体要件定義（25モジュール） |
| [docs/buying-agent-requirements.md](docs/buying-agent-requirements.md) | 購買エージェント要件定義 |
| [docs/buying-agent-design.md](docs/buying-agent-design.md) | 購買エージェント設計書 |
| [docs/embed-requirements.md](docs/embed-requirements.md) | EC埋め込みウィジェット要件定義 |
| [docs/embed-design.md](docs/embed-design.md) | EC埋め込みウィジェット設計書 |
| [docs/business-flow.md](docs/business-flow.md) | ビジネスフロー（15フロー） |
| [docs/onboarding-guide.md](docs/onboarding-guide.md) | 開発環境セットアップ |

## Cronジョブ

| エンドポイント | スケジュール | 概要 |
|--------------|------------|------|
| `/api/cron/step-mail` | 毎日 0:00 UTC | メール配信 + EC同期 |
| `/api/cron/agents` | 6時間ごと | 購買エージェント自動実行 |
| `/api/cron/sales-agent` | 毎日 8:00 UTC | 販売エージェント自動監視 |
