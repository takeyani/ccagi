# CAD Viewer（3Dモデルビューア）— チーム連携ガイド

## このプロジェクトについて

3Dモデルファイルをブラウザ上で表示するマルチフォーマット対応ビューアWebアプリです。
IFCをはじめとする9種類の3Dファイルをアップロード・管理し、3Dモデルとして閲覧・操作できます。

**リポジトリ内の位置:** `ccagi/cad/`
**開発サーバーポート:** 3002

### 対応フォーマット

| 拡張子 | 形式名 | ローダー |
|--------|--------|---------|
| `.ifc` | IFC (Industry Foundation Classes) | web-ifc (WASM) |
| `.glb` / `.gltf` | glTF / glTF Binary | GLTFLoader |
| `.fbx` | Autodesk FBX | FBXLoader |
| `.obj` | Wavefront OBJ | OBJLoader |
| `.stl` | STL (3Dプリント) | STLLoader |
| `.dae` | COLLADA | ColladaLoader |
| `.ply` | PLY (Point Cloud) | PLYLoader |
| `.3ds` | 3D Studio | TDSLoader |

各ローダーは dynamic import で必要時のみロードされます。

---

## クイックスタート（5分で動かす）

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd my-project/cad
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3002 で起動します。

### 4. 動作確認（Supabase不要）

以下のテスト用ページは認証なしで使えます:

| URL | 説明 |
|-----|------|
| http://localhost:3002/test-viewer | 3Dファイルをドラッグ&ドロップ or ファイル選択で読み込んで3D表示 |
| http://localhost:3002/test-sample | `public/samples/sample.ifc` を自動で3D表示 |

test-viewer は全対応フォーマット（IFC, glTF, FBX, OBJ, STL, COLLADA, PLY, 3DS）を読み込めます。

サンプルファイルを配置するには:
```bash
mkdir -p public/samples
cp /path/to/your-file.ifc public/samples/sample.ifc
```

---

## Supabase連携（フル機能を使う場合）

### 1. 環境変数の設定

`.env.local` を作成:

```bash
cp .env.local.example .env.local
```

以下を記入（値はチームのSupabaseダッシュボードから取得）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**取得場所:** Supabase Dashboard → Settings → API → Project URL / anon key

### 2. データベーステーブルの作成

Supabase Dashboard → SQL Editor で `setup.sql` の内容を実行してください。

作成されるもの:
- `cad_user_profiles` — ユーザープロフィール
- `cad_projects` — プロジェクト
- `cad_files` — アップロードファイル
- `cad_file_versions` — ファイルバージョン
- `cad-files` — Storageバケット（非公開）
- RLSポリシー（全テーブル・Storage）

### 3. Supabase Auth設定

Supabase Dashboard → Authentication → Settings で以下を確認:
- Email Auth が有効になっていること
- Site URL に `http://localhost:3002` を追加
- Redirect URLs に `http://localhost:3002/api/auth/callback` を追加

### 4. フル機能の動作確認

1. http://localhost:3002/signup でアカウント作成
2. ダッシュボードが表示される
3. 「新規プロジェクト」でプロジェクト作成
4. プロジェクト詳細から「ファイルアップロード」で3Dファイルをアップロード
5. ファイル一覧の「3D表示」で3Dビューアが開く

---

## 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js (App Router) | 16.1.6 | フレームワーク |
| React | 19.2.3 | UI |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 4.x | スタイリング |
| Supabase | 共有 | Auth + DB + Storage |
| Three.js | ^0.183 | 3Dレンダリング + 各種ローダー |
| web-ifc | ^0.0.77 | IFCパーサー（WASM） |

---

## プロジェクト構成

```
cad/
├── docs/                  # ドキュメント（本ファイル含む）
├── public/samples/        # テスト用3Dファイル
├── src/
│   ├── app/               # Next.js App Routerページ
│   │   ├── dashboard/     # 認証必要エリア
│   │   │   ├── projects/  # プロジェクトCRUD
│   │   │   ├── viewer/    # 3Dビューア
│   │   │   └── settings/  # ユーザー設定
│   │   ├── login/         # ログイン
│   │   ├── signup/        # 新規登録
│   │   ├── test-sample/   # テスト: サンプル自動読込
│   │   └── test-viewer/   # テスト: D&D / ファイル選択読込
│   ├── components/
│   │   ├── auth/          # 認証UI（LoginForm, SignupForm, LogoutButton）
│   │   ├── dashboard/     # ダッシュボードUI（Sidebar, DataTable, StatsCard等）
│   │   └── viewer/        # 3Dビューア（ModelViewer, ModelTree, PropertiesPanel等）
│   ├── lib/
│   │   ├── formats.ts     # 対応フォーマット定義・判定ユーティリティ
│   │   └── supabase/      # Supabaseクライアント（client.ts, server.ts）
│   └── middleware.ts      # 認証ミドルウェア（/dashboard/* を保護）
├── setup.sql              # DBスキーマ（Supabase SQL Editorで実行）
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## 画面一覧

| 画面 | パス | 説明 |
|------|------|------|
| ログイン | `/login` | メール/パスワード認証 |
| 新規登録 | `/signup` | アカウント作成 |
| ダッシュボード | `/dashboard` | 統計・最近のファイル |
| プロジェクト一覧 | `/dashboard/projects` | プロジェクト管理 |
| プロジェクト作成 | `/dashboard/projects/new` | 名前・説明を入力して作成 |
| プロジェクト詳細 | `/dashboard/projects/[id]` | ファイル一覧・アップロード・削除 |
| ファイルアップロード | `/dashboard/projects/[id]/upload` | 3Dファイルの D&D アップロード（全形式対応） |
| 3Dビューア | `/dashboard/viewer/[fileId]` | 3Dモデルの表示・操作 |
| 設定 | `/dashboard/settings` | 表示名の変更 |

---

## 3Dビューアの操作方法

| 操作 | 方法 |
|------|------|
| 回転 | マウス左ドラッグ |
| ズーム | マウスホイール |
| パン（移動） | マウス右ドラッグ |
| 要素選択 | 3Dモデルをクリック（青色ハイライト + プロパティ表示） |
| ツリーから選択 | 左パネルのノードをクリック（カメラ移動 + ハイライト + プロパティ連動） |
| 全体表示 | ツールバー「全体表示」ボタン |
| 正面/上面/側面 | ツールバーのビューボタン |
| ワイヤーフレーム | ツールバー「ワイヤー」ボタン |
| パネル表示切替 | ツールバー「ツリー」「プロパティ」ボタン |

### パネル連動

左のモデルツリー・中央の3Dビュー・右のプロパティパネルは完全に連動しています:

- **3Dモデルをクリック** → ツリーの該当ノードがハイライト + プロパティ表示
- **ツリーノードをクリック** → 3Dビューでカメラ移動＆青色ハイライト + プロパティ表示
- **空クリック** → 全選択解除

---

## データベーススキーマ概要

```
auth.users (Supabase管理)
  │
  ├── cad_user_profiles (1:1)  ← 表示名・メール
  │
  ├── cad_projects (1:N)       ← プロジェクト管理
  │     │
  │     └── cad_files (1:N)    ← 3Dファイル管理
  │           │
  │           └── cad_file_versions (1:N) ← バージョン管理
  │
  └── Storage: cad-files バケット ← 実ファイル保存
```

全テーブルにRLS（Row Level Security）が設定済み。自分のデータのみアクセス可能。

---

## 開発コマンド

```bash
# 開発サーバー起動（ポート3002）
npm run dev

# TypeScriptの型チェック
npx tsc --noEmit

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint
```

---

## 注意事項・既知の制限

- **ファイルサイズ:** 大きなファイル（50MB超）は読み込みに時間がかかります
- **web-ifc WASM:** IFCファイルの読込時、CDN（unpkg.com）からWASMを取得するため初回はネットワーク接続が必要です
- **ブラウザ対応:** Chrome / Edge / Firefox 最新版を推奨。WebGL対応が必要です
- **Supabase共有:** estimator プロジェクトと同じSupabaseインスタンスを使用。テーブルは `cad_` プレフィックスで分離
- **middleware 警告:** Next.js 16で「middleware is deprecated, use proxy」の警告が出ますが、動作に影響はありません

---

## 他ドキュメント

詳細な設計ドキュメントは `docs/` 配下にあります:

| ファイル | 内容 |
|---------|------|
| `01_requirements.md` | 要件定義（機能要件・非機能要件） |
| `02_architecture.md` | アーキテクチャ設計（ディレクトリ構成・コンポーネント設計） |
| `03_database.md` | データベース設計（全テーブル詳細・RLS） |
| `04_api_routes.md` | ルート・API設計（ページ一覧・Server Actions） |
| `05_viewer_design.md` | ビューア詳細設計（Three.js構成・読込フロー） |
| `06_setup_guide.md` | セットアップガイド（検証チェックリスト） |
| `07_component_reference.md` | コンポーネントリファレンス（Props・機能一覧） |

---

## 困ったとき

| 症状 | 対処 |
|------|------|
| `localhost:3002` に接続できない | `npm run dev` が起動しているか確認。ポート競合なら既存プロセスを終了 |
| ログインできない | `.env.local` のSupabase URLとキーを確認。Supabase AuthのEmail認証が有効か確認 |
| テーブルが見つからない | `setup.sql` をSupabase SQL Editorで実行したか確認 |
| 3Dモデルが表示されない | ブラウザのDevTools → Consoleでエラーを確認。WebGL対応ブラウザか確認 |
| アップロードが失敗する | Supabase Storageの `cad-files` バケットが作成されているか確認 |
| 対応形式がわからない | IFC, glTF/GLB, FBX, OBJ, STL, COLLADA, PLY, 3DS の9形式に対応 |
