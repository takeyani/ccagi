# EC埋め込みウィジェット 設計書

| 項目 | 内容 |
|------|------|
| 文書ID | DES-EMBED-001 |
| バージョン | 1.0 |
| 作成日 | 2026-03-06 |
| 更新日 | 2026-03-06 |
| ステータス | 実装済み |
| 対応要件 | REQ-EMBED-001 v1.0 |

---

## 1. アーキテクチャ

### 1.1 全体フロー

```
ECサイト（親フレーム）                    our-domain（iframe内）
┌─────────────────────────┐          ┌──────────────────────────┐
│ <div data-ccagi-widget  │          │                          │
│   data-type="collection"│          │  /embed/collection/      │
│   data-code="abc"       │          │    [code]/[slug]         │
│   data-slug="organic">  │          │                          │
│                         │          │  embed/layout.tsx         │
│ <script src="embed.js"> │          │    ├── globals.css        │
│                         │  iframe  │    ├── EmbedProvider      │
│ embed.js が div 検知 ────┼────→────┤    └── 高さ報告 script   │
│   → iframe 生成         │          │                          │
│                         │          │  CollectionBlockRenderer │
│ message リスナー ←───────┼────←────┤    → postMessage         │
│   → iframe高さ調整      │          │      { type:             │
│                         │          │        'ccagi-embed-     │
│                         │          │         resize',         │
│                         │          │        height: N }       │
└─────────────────────────┘          └──────────────────────────┘
```

### 1.2 設計方針

| 決定事項 | 理由 |
|---------|------|
| iframe方式 | CSS競合なし、任意のECプラットフォームで動作 |
| postMessage高さ同期 | scrolling=no + 動的高さでシームレス埋め込み |
| ES5構文のembed.js | EC訪問者ブラウザ互換性最大化 |
| Stripe決済→新タブ | iframe内Stripe制約回避 |
| 既存コンポーネント完全再利用 | BlockRenderer, CollectionBlockRenderer等 |
| noindex/nofollow | 重複コンテンツSEOペナルティ回避 |

---

## 2. ファイル構成

### 2.1 新規ファイル

| ファイル | 種別 | 説明 |
|---------|------|------|
| `lp/public/embed.js` | JavaScript (ES5) | ECサイト読み込みスクリプト |
| `lp/src/app/embed/layout.tsx` | Server Component | 埋め込み専用レイアウト |
| `lp/src/lib/embed-context.tsx` | Client Component | EmbedProvider + useEmbed() |
| `lp/src/app/embed/lp/[code]/[slug]/[lotId]/page.tsx` | Server Component | 単品LP embed |
| `lp/src/app/embed/collection/[code]/[slug]/page.tsx` | Server Component | コレクション embed |
| `lp/src/app/embed/collection/[code]/[slug]/CollectionPageClient.tsx` | Client Component | CollectionBlockRenderer ラッパー |
| `lp/public/embed-demo.html` | HTML | テスト用デモページ |

### 2.2 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `lp/next.config.ts` | `/embed/:path*` に frame-ancestors * ヘッダー追加 |
| `lp/src/components/LotPurchaseButton.tsx` | embed内ではStripe決済を新タブで開く |
| `lp/src/components/creator-lp/CollectionBlockRenderer.tsx` | CollectionContext に `isEmbed?: boolean` 追加 |
| `lp/src/components/creator-lp/blocks/CollectionGridBlock.tsx` | `isEmbed` prop → ProductCard に伝播 |
| `lp/src/components/creator-lp/blocks/ProductCard.tsx` | `isEmbed` → `/embed/lp/...` リンク生成 |

---

## 3. コンポーネント設計

### 3.1 embed/layout.tsx

```
html lang="ja"
  body style={{ margin: 0, background: 'transparent' }}
    EmbedProvider (isEmbed: true)
      {children}
    <script> (inline)
      MutationObserver → reportHeight()
      setInterval(1000ms) → reportHeight()
      window.onload → reportHeight()
      reportHeight():
        height = document.documentElement.scrollHeight
        parent.postMessage({ type: 'ccagi-embed-resize', height }, '*')
```

メタデータ: `robots: { index: false, follow: false }`

CSSは `globals.css` のみ読み込み（サイトヘッダー/フッターなし）。

### 3.2 embed-context.tsx

```typescript
// React Context
type EmbedContextValue = { isEmbed: boolean }
const EmbedContext = createContext({ isEmbed: false })

// Provider（embed/layout.tsx から使用）
export function EmbedProvider({ children }) {
  return <EmbedContext.Provider value={{ isEmbed: true }}>{children}</EmbedContext.Provider>
}

// Hook（任意のコンポーネントから使用可能）
export function useEmbed() {
  return useContext(EmbedContext)
}
```

### 3.3 embed LP ページ

`/embed/lp/[code]/[slug]/[lotId]/page.tsx` — 既存 `/c/[code]/[slug]/[lotId]/page.tsx` と同一のデータ取得フロー:

```
1. affiliate 検証 (code, is_creator=true)
2. product 取得 (slug, is_active=true)
3. lot 取得 (lotId, product_id)
4. design 取得 (affiliate_id, slug, lot_id, is_published=true)
5. increment_lp_views RPC
6. partner 取得 (product.partner_id)
7. tags 取得 (product_tags JOIN tags)
8. BlockRenderer 描画
```

差分: `CreatorAffiliateTracker` コンポーネントなし（iframe内では不要）。

### 3.4 embed コレクションページ

`/embed/collection/[code]/[slug]/page.tsx` — 既存と同一のデータ取得:

```
1. affiliate 検証
2. collection 取得 (is_published=true)
3. increment_collection_views RPC
4. resolveCollectionFilters() でアイテム取得
5. allTags 集約
6. CollectionPageClient に isEmbed=true 渡す
```

`CollectionPageClient` が `CollectionBlockRenderer` に `context.isEmbed=true` を渡し、
→ `CollectionGridBlock` → `ProductCard` へ伝播。

### 3.5 isEmbed prop 伝播チェーン

```
embed/collection/page.tsx
  → CollectionPageClient (isEmbed=true)
    → CollectionBlockRenderer (context.isEmbed)
      → CollectionGridBlock (isEmbed prop)
        → ProductCard (isEmbed prop)
          → href = isEmbed
              ? `/embed/lp/${code}/${slug}/${lotId}`
              : `/c/${code}/${slug}/${lotId}`
```

### 3.6 LotPurchaseButton 変更

```typescript
// 決済URL取得後の分岐
if (data.url) {
  if (window.self !== window.top) {
    // embed（iframe内）: 新タブで開く
    window.open(data.url, "_blank");
    setLoading(false);
  } else {
    // 通常ページ: 同一ウィンドウで遷移
    window.location.href = data.url;
  }
}
```

---

## 4. embed.js 設計

### 4.1 処理フロー

```
(即時実行関数)
  │
  ├── 1. スクリプトタグの src から baseUrl を算出
  │
  ├── 2. initWidgets()
  │     ├── querySelectorAll("[data-ccagi-widget]")
  │     ├── data-ccagi-initialized ガードチェック
  │     ├── data-type, data-code, data-slug, data-lot-id 読み取り
  │     ├── URL パス組み立て
  │     │   ├── lp → /embed/lp/{code}/{slug}/{lotId}
  │     │   └── collection → /embed/collection/{code}/{slug}
  │     ├── iframe 生成
  │     │   ├── width: 100%, border: none
  │     │   ├── scrolling: no, overflow: hidden
  │     │   ├── minHeight: 200px
  │     │   ├── loading: lazy
  │     │   └── data-ccagi-iframe 属性付与
  │     └── div に appendChild
  │
  ├── 3. message リスナー登録
  │     └── event.data.type === 'ccagi-embed-resize'
  │         → 対応 iframe の height を更新
  │
  ├── 4. DOM ready で initWidgets() 呼び出し
  │
  └── 5. window.ccagiEmbed = { init: initWidgets }
```

### 4.2 baseUrl 算出

```javascript
var scripts = document.getElementsByTagName("script");
var currentScript = scripts[scripts.length - 1];
var scriptSrc = currentScript.getAttribute("src") || "";
var baseUrl = scriptSrc.replace(/\/embed\.js(\?.*)?$/, "") || window.location.origin;
```

### 4.3 iframe - メッセージ対応

```javascript
window.addEventListener("message", function(event) {
  if (event.data.type !== 'ccagi-embed-resize') return;
  // event.source === iframe.contentWindow で対応iframeを特定
  // iframe.style.height = event.data.height + "px"
});
```

---

## 5. Next.js 設定

### 5.1 next.config.ts ヘッダー設定

```typescript
async headers() {
  return [
    {
      source: "/embed/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors *",
        },
        {
          key: "X-Frame-Options",
          value: "ALLOWALL",
        },
      ],
    },
  ];
}
```

`/embed/*` 以外のルートはデフォルトの X-Frame-Options が適用され、iframe埋め込みは制限される。

---

## 6. ルーティング

| パス | 種別 | レイアウト |
|------|------|----------|
| `/embed/lp/[code]/[slug]/[lotId]` | Server Component | embed/layout.tsx |
| `/embed/collection/[code]/[slug]` | Server/Client | embed/layout.tsx |

embed/layout.tsx は `lp/src/app/embed/layout.tsx` に配置され、App Router の nested layout として `/embed/*` 配下全ページに適用される。

---

## 7. データフロー図

### 7.1 単品LP

```
ECサイト → embed.js → iframe src=/embed/lp/abc/product/lot123
  → embed/layout.tsx (EmbedProvider, 高さ報告)
    → embed/lp/page.tsx (Server Component)
      → Supabase: affiliate → product → lot → design → partner → tags
      → BlockRenderer (既存コンポーネント再利用)
        → HeroBlock, ProductInfoBlock, LotDetailsBlock, CTABlock, ...
        → LotPurchaseButton (window.self !== window.top → 新タブ)
```

### 7.2 コレクション

```
ECサイト → embed.js → iframe src=/embed/collection/abc/organic
  → embed/layout.tsx (EmbedProvider, 高さ報告)
    → embed/collection/page.tsx (Server Component)
      → Supabase: affiliate → collection → resolveFilters → allTags
      → CollectionPageClient (isEmbed=true)
        → CollectionBlockRenderer
          → CollectionFilterBarBlock (フィルタ操作)
          → CollectionGridBlock (isEmbed→ProductCard)
            → ProductCard (href=/embed/lp/...)
              → クリック → iframe内遷移
```

---

## 8. セキュリティ考慮事項

| 項目 | 対策 |
|------|------|
| クリックジャッキング | `/embed/*` のみ frame-ancestors * を許可、他ルートは不許可 |
| XSS | React のエスケープ機構に依存、dangerouslySetInnerHTML は高さ報告scriptのみ |
| postMessage検証 | メッセージタイプ `ccagi-embed-resize` を確認、event.source で送信元iframe特定 |
| 3rd party cookie | アフィリエイト追跡は iframe内 localStorage 経由（cookie制限回避） |
| Stripe決済 | iframe内Stripe制約を回避するため新タブで開く |

---

## 9. テスト手順

### 9.1 ローカル検証

1. `cd lp && npm run dev` で開発サーバー起動
2. `http://localhost:3000/embed-demo.html` にアクセス
3. `data-code`, `data-slug`, `data-lot-id` を実際の値に変更

### 9.2 検証チェックリスト

| # | 確認項目 |
|---|---------|
| 1 | `npx tsc --noEmit` コンパイルエラーなし |
| 2 | embed-demo.html でiframe表示確認 |
| 3 | 単品LP: ブロック表示、テーマ適用 |
| 4 | 単品LP: 購入ボタン → 新タブ遷移 |
| 5 | コレクション: グリッド表示 |
| 6 | コレクション: フィルタバー動作 |
| 7 | コレクション: カードクリック → iframe内LP遷移 |
| 8 | iframe高さ自動調整（初期表示、フィルタ変更後） |
| 9 | ビューカウント増加 |
| 10 | 二重初期化防止（embed.js 2回読み込み） |
