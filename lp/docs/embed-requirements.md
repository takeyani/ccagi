# EC埋め込みウィジェット 要件定義書

| 項目 | 内容 |
|------|------|
| 文書ID | REQ-EMBED-001 |
| バージョン | 1.0 |
| 作成日 | 2026-03-06 |
| 更新日 | 2026-03-06 |
| ステータス | 実装済み |

---

## 1. 概要

### 1.1 目的

任意のECサイトに `<script>` タグ1行で単品LP・コレクション（まとめサイト）を埋め込めるウィジェットシステムを提供する。iframe + postMessage による汎用アプローチで、CSS競合なしに任意のプラットフォームで動作する。

### 1.2 背景

クリエイターが作成したLPやコレクションは現在 `/c/[code]/[slug]` で公開されているが、外部ECサイトに直接埋め込むことができない。本機能により、自社サイトやブログ等に `<script>` タグとウィジェット用divを設置するだけで、LP/コレクションをシームレスに表示できるようにする。

### 1.3 スコープ

| 対象 | 内容 |
|------|------|
| 対象ユーザー | 外部ECサイト運営者、クリエイター |
| 埋め込み対象 | 単品LP、コレクション |
| 技術方式 | iframe + postMessage |
| スコープ外 | iframe内での直接Stripe決済（新タブに遷移） |

---

## 2. 機能要件

### 2.1 FR-E01: ウィジェットスクリプト（embed.js）

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E01-01 | ECサイトが `<script src="https://domain/embed.js">` で読み込める | 必須 |
| FR-E01-02 | `data-ccagi-widget` 属性を持つdiv要素を自動検出する | 必須 |
| FR-E01-03 | `data-type` で埋め込みタイプ（lp / collection）を指定できる | 必須 |
| FR-E01-04 | `data-code`, `data-slug`, `data-lot-id` でコンテンツを特定できる | 必須 |
| FR-E01-05 | 検出したdiv内にiframeを自動生成する | 必須 |
| FR-E01-06 | ES5構文でブラウザ互換性を最大化する | 必須 |
| FR-E01-07 | `data-ccagi-initialized` ガードで二重初期化を防止する | 必須 |
| FR-E01-08 | `window.ccagiEmbed.init()` をSPA向けに公開する | 必須 |

### 2.2 FR-E02: iframe高さ自動同期

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E02-01 | iframe内のコンテンツ高さを `postMessage` で親フレームに通知する | 必須 |
| FR-E02-02 | MutationObserverで動的コンテンツの高さ変更を検知する | 必須 |
| FR-E02-03 | setInterval(1000ms) でフォールバック高さ報告を行う | 必須 |
| FR-E02-04 | 親フレームが `ccagi-embed-resize` メッセージを受信してiframe高さを調整する | 必須 |
| FR-E02-05 | iframe は `scrolling="no"` で自身のスクロールバーを非表示にする | 必須 |

### 2.3 FR-E03: 埋め込み専用レイアウト

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E03-01 | `/embed/*` ルートはサイトクロム（ヘッダー/フッター）なしで表示する | 必須 |
| FR-E03-02 | body は margin:0, background:transparent とする | 必須 |
| FR-E03-03 | robots: noindex, nofollow を設定する | 必須 |
| FR-E03-04 | EmbedProvider で isEmbed コンテキストを提供する | 必須 |

### 2.4 FR-E04: 単品LP埋め込み

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E04-01 | `/embed/lp/[code]/[slug]/[lotId]` でLP表示する | 必須 |
| FR-E04-02 | 既存LP（`/c/[code]/[slug]/[lotId]`）と同じデータ取得を行う | 必須 |
| FR-E04-03 | BlockRenderer を再利用してブロック描画する | 必須 |
| FR-E04-04 | LP閲覧数（views_count）をインクリメントする | 必須 |

### 2.5 FR-E05: コレクション埋め込み

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E05-01 | `/embed/collection/[code]/[slug]` でコレクション表示する | 必須 |
| FR-E05-02 | 既存コレクション（`/c/[code]/[slug]`）と同じデータ取得を行う | 必須 |
| FR-E05-03 | CollectionBlockRenderer を再利用してブロック描画する | 必須 |
| FR-E05-04 | フィルタバー操作が埋め込み内で正常に動作する | 必須 |
| FR-E05-05 | コレクション閲覧数をインクリメントする | 必須 |

### 2.6 FR-E06: 埋め込み内リンク

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E06-01 | コレクション内のProductCardクリック時、iframe内で `/embed/lp/...` に遷移する | 必須 |
| FR-E06-02 | 通常ページ（非embed）のProductCardは従来通り `/c/...` に遷移する | 必須 |

### 2.7 FR-E07: Stripe決済のembed対応

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E07-01 | iframe内の購入ボタンクリック時、Stripe Checkout を新タブで開く | 必須 |
| FR-E07-02 | 通常ページ（非embed）では従来通り同一ウィンドウで遷移する | 必須 |
| FR-E07-03 | `window.self !== window.top` でembed判定する | 必須 |

### 2.8 FR-E08: iframeセキュリティ

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-E08-01 | `/embed/*` ルートに `Content-Security-Policy: frame-ancestors *` ヘッダーを設定する | 必須 |
| FR-E08-02 | `/embed/*` ルートに `X-Frame-Options: ALLOWALL` ヘッダーを設定する | 必須 |
| FR-E08-03 | `/embed/*` 以外のルートはiframeヘッダーの影響を受けない | 必須 |

---

## 3. 非機能要件

### 3.1 NFR-E01: パフォーマンス

| ID | 要件 |
|----|------|
| NFR-E01-01 | embed.js は軽量（依存なし、ES5構文）で遅延なく読み込めること |
| NFR-E01-02 | iframe は `loading="lazy"` で遅延読み込みすること |
| NFR-E01-03 | 高さ同期の setInterval は 1000ms 間隔（過度なリソース消費を防止） |

### 3.2 NFR-E02: 互換性

| ID | 要件 |
|----|------|
| NFR-E02-01 | embed.js は ES5 構文で主要ブラウザ（Chrome, Firefox, Safari, Edge）で動作すること |
| NFR-E02-02 | 任意のCMSやECプラットフォーム（Shopify, WordPress等）で動作すること |
| NFR-E02-03 | iframe方式により親サイトのCSS・JSとの競合がないこと |

### 3.3 NFR-E03: SEO

| ID | 要件 |
|----|------|
| NFR-E03-01 | `/embed/*` ページは noindex, nofollow でSEOに影響を与えないこと |

---

## 4. ユースケース

### UC-E01: ECサイトにコレクションを埋め込む

```
アクター: ECサイト運営者
前提条件: クリエイターがコレクションを公開済み

1. ECサイトのHTMLに以下を追加:
   <div data-ccagi-widget data-type="collection"
        data-code="creator123" data-slug="organic-foods"></div>
   <script src="https://your-domain.com/embed.js"></script>
2. ページ読み込み時、embed.js がdivを検出
3. iframe が生成され /embed/collection/creator123/organic-foods をロード
4. コレクションのグリッドが表示される
5. 訪問者がフィルタを操作 → iframe内でフィルタ適用
6. 訪問者が商品カードをクリック → iframe内で /embed/lp/... に遷移
7. iframe高さが自動調整される
```

### UC-E02: 埋め込みLP内で購入

```
アクター: ECサイト訪問者
前提条件: 埋め込みLPが表示されている

1. 訪問者が「今すぐ購入する」ボタンをクリック
2. Stripe Checkout が新タブで開く
3. 決済完了後、新タブで /success ページ表示
4. 元のECサイトのiframeはそのまま残る
```

### UC-E03: SPAサイトでの動的初期化

```
アクター: SPAサイト開発者
前提条件: embed.js がロード済み

1. SPA内でルート変更時にウィジェットdivを動的に追加
2. window.ccagiEmbed.init() を呼び出し
3. 新しいdivが検出され、iframeが生成される
4. data-ccagi-initialized ガードにより既存のウィジェットは再初期化されない
```

---

## 5. ECサイト側の実装例

```html
<!-- 単品LP -->
<div data-ccagi-widget data-type="lp"
     data-code="creator123" data-slug="premium-product"
     data-lot-id="lot-uuid-here"></div>

<!-- コレクション -->
<div data-ccagi-widget data-type="collection"
     data-code="creator123" data-slug="organic-foods"></div>

<!-- スクリプト（ページ末尾に1回） -->
<script src="https://your-domain.com/embed.js"></script>
```

---

## 6. 検証項目

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| T-E01 | embed-demo.html をブラウザで開く | 両タイプのiframeが表示される |
| T-E02 | 単品LP embed でブロックが表示される | BlockRenderer による描画が正常 |
| T-E03 | コレクション embed でグリッドが表示される | フィルタ・ソートが正常動作 |
| T-E04 | コレクション内のカードクリック | iframe内で /embed/lp/... に遷移 |
| T-E05 | 購入ボタンクリック（embed内） | 新タブでStripe Checkout が開く |
| T-E06 | 購入ボタンクリック（通常ページ） | 同一ウィンドウでStripe Checkout に遷移 |
| T-E07 | フィルタ変更時のiframe高さ | 高さが自動調整される |
| T-E08 | ビューカウント | embed経由でも views_count が増加する |
| T-E09 | 二重初期化防止 | embed.js を2回読み込んでもiframeが1つだけ |
| T-E10 | `npx tsc --noEmit` | コンパイルエラーなし |
