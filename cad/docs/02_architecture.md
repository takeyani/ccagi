# IFC 3Dビューア — アーキテクチャ設計書

## 1. 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js (App Router) | 16.1.6 | フレームワーク |
| React | 19.2.3 | UI |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 4.x | スタイリング |
| Supabase | 共有インスタンス | Auth + DB + Storage |
| Three.js | ^0.183 | 3Dレンダリング |
| web-ifc | ^0.0.77 | IFCパーサー（WASM） |

## 2. リポジトリ配置

```
ccagi/
├── lp/           # ランディングページ
├── estimator/    # 見積もりツール
├── cad/          # 本プロジェクト（IFC 3Dビューア）
├── cli.js
└── package.json
```

同一Supabaseインスタンスを共有。テーブルは `cad_` プレフィックスで他プロジェクトと分離。

## 3. ディレクトリ構成

```
cad/
├── public/
│   └── samples/           # テスト用IFCファイル
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/callback/route.ts    # OAuth callback
│   │   │   └── test-ifc/route.ts         # テスト用IFC配信API
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # ダッシュボード共通レイアウト
│   │   │   ├── page.tsx                  # ダッシュボードトップ
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx              # プロジェクト一覧
│   │   │   │   ├── actions.ts            # Server Actions
│   │   │   │   ├── new/page.tsx          # プロジェクト作成
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # プロジェクト詳細
│   │   │   │       └── upload/page.tsx   # ファイルアップロード
│   │   │   ├── viewer/
│   │   │   │   └── [fileId]/page.tsx     # 3Dビューア（認証付き）
│   │   │   └── settings/
│   │   │       ├── page.tsx              # ユーザー設定
│   │   │       └── actions.ts
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── test-sample/page.tsx          # サンプルIFCテスト
│   │   ├── test-viewer/page.tsx          # ローカルファイルテスト
│   │   ├── layout.tsx                    # ルートレイアウト
│   │   ├── page.tsx                      # リダイレクト
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── FileUploadForm.tsx
│   │   │   ├── DeleteProjectButton.tsx
│   │   │   └── SettingsForm.tsx
│   │   └── viewer/
│   │       ├── ViewerLoader.tsx          # dynamic import ラッパー
│   │       ├── ViewerClient.tsx          # ビューア全体レイアウト
│   │       ├── IFCViewer.tsx             # Three.js + web-ifc コア
│   │       ├── Toolbar.tsx               # 上部ツールバー
│   │       ├── ModelTree.tsx             # 左パネル: モデルツリー
│   │       └── PropertiesPanel.tsx       # 右パネル: プロパティ
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts                 # ブラウザ用クライアント
│   │       └── server.ts                 # サーバー用クライアント
│   └── middleware.ts                     # 認証ミドルウェア
├── setup.sql                             # DBスキーマ
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## 4. コンポーネントアーキテクチャ

### 4.1 レンダリング戦略

| コンポーネント | 種類 | 理由 |
|--------------|------|------|
| ページ（dashboard/*） | Server Component | Supabaseからのデータ取得 |
| LoginForm / SignupForm | Client Component | フォーム操作 |
| Sidebar | Client Component | pathname による active 判定 |
| IFCViewer | Client Component | Three.js / web-ifc はブラウザ専用 |
| ViewerLoader | Client Component | `dynamic(ssr:false)` による SSR 回避 |

### 4.2 3Dビューア構成

```
ViewerLoader（Client, dynamic import, ssr: false）
└── ViewerClient（ビューア全体のstate管理）
    ├── Toolbar（上部ツールバー）
    ├── ModelTree（左パネル）
    ├── IFCViewer（中央、Three.js Canvas）
    └── PropertiesPanel（右パネル）
```

**データフロー:**
1. IFCViewer がモデル読込完了 → `onModelLoaded(viewerApi)` を呼出
2. ViewerClient が `viewerApi` をstateに保存
3. Toolbar のボタン押下 → `viewerApi.fitView()` 等を呼出
4. IFCViewer 内でクリック → `onElementSelected(expressId, props)` を呼出
5. ViewerClient が PropertiesPanel に props を渡す

### 4.3 IFC読込フロー

```
1. fetch(fileUrl) → ArrayBuffer取得
2. new WebIFC.IfcAPI() → WASM初期化（CDN: unpkg.com）
3. ifcApi.OpenModel(data) → IFCモデル展開
4. ifcApi.StreamAllMeshes() → ジオメトリ取得
5. 各メッシュ → Three.js BufferGeometry + MeshStandardMaterial → Group に追加
6. カメラをモデル全体にフィット
```

## 5. SSR回避の方針

Three.js / web-ifc は `window` / `document` に依存するため、サーバーサイドで実行するとエラーになる。

**対策:**
- `ViewerLoader.tsx` を `"use client"` にし、`dynamic(() => import('./ViewerClient'), { ssr: false })` で読み込む
- サーバーコンポーネント（ビューアページ）は ViewerLoader を使用

## 6. WASM配信

web-ifc の WASM ファイルは CDN（unpkg）から配信。ローカルにコピー不要。

```ts
ifcApi.SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true);
```

シングルスレッドWASM使用。COOP/COEPヘッダー不要でデプロイが簡単。
