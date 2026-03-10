# 3Dモデルビューア — コンポーネントリファレンス

## 1. 認証コンポーネント

### LoginForm (`components/auth/LoginForm.tsx`)
- **種類:** Client Component
- **Props:** なし
- **機能:** メール/パスワードログイン。URLパラメータ `redirect` でログイン後の遷移先を指定可能。
- **状態:** email, password, error, loading

### SignupForm (`components/auth/SignupForm.tsx`)
- **種類:** Client Component
- **Props:** なし
- **機能:** 新規登録。`cad_user_profiles` にプロフィールを自動作成。
- **状態:** displayName, email, password, error, loading

### LogoutButton (`components/auth/LogoutButton.tsx`)
- **種類:** Client Component
- **Props:** なし
- **機能:** ログアウト → `/login` へリダイレクト

## 2. ダッシュボードコンポーネント

### Sidebar (`components/dashboard/Sidebar.tsx`)
- **種類:** Client Component
- **Props:** `items: { href, label, icon }[]`
- **機能:** ナビゲーションメニュー。現在のパスに応じてアクティブ表示。

### StatsCard (`components/dashboard/StatsCard.tsx`)
- **種類:** Server Component（"use client" なし）
- **Props:** `label: string, value: string|number, sub?: string`
- **機能:** 統計カード表示

### DataTable (`components/dashboard/DataTable.tsx`)
- **種類:** Server Component
- **Props:** `columns, data, keyField?, editHref?, editLabel?`
- **機能:** 汎用テーブル。カラムごとにカスタムrender関数を指定可能。

### FileUploadForm (`components/dashboard/FileUploadForm.tsx`)
- **種類:** Client Component
- **Props:** `projectId: string`
- **機能:** 3Dファイルのアップロード。D&D対応。全対応形式（IFC, glTF/GLB, FBX, OBJ, STL, COLLADA, PLY, 3DS）。プログレスバー表示。
- **状態:** file, notes, uploading, error, progress
- **依存:** `@/lib/formats` から `ACCEPT_STRING`, `isSupportedFormat`, `SUPPORTED_3D_FORMATS` を使用

### DeleteProjectButton (`components/dashboard/DeleteProjectButton.tsx`)
- **種類:** Client Component
- **Props:** `projectId: string`
- **機能:** 確認ダイアログ付きプロジェクト削除

### SettingsForm (`components/dashboard/SettingsForm.tsx`)
- **種類:** Client Component
- **Props:** `profile: { display_name, email }`
- **機能:** 表示名の更新

## 3. ビューアコンポーネント

### ViewerLoader (`components/viewer/ViewerLoader.tsx`)
- **種類:** Client Component
- **Props:** `fileId, fileName, fileUrl`
- **機能:** `dynamic(import('./ViewerClient'), { ssr: false })` によるSSR回避ラッパー

### ViewerClient (`components/viewer/ViewerClient.tsx`)
- **種類:** Client Component (default export)
- **Props:** `fileId, fileName, fileUrl`
- **機能:** ビューア全体のレイアウトとstate管理。Toolbar/ModelTree/ModelViewer/PropertiesPanelを配置。
- **状態:** treeData, properties, selectedId, showTree, showProps, wireframe, viewerApi
- **連動:** ツリー選択 → `viewerApi.selectElement(id)` → カメラ移動 + ハイライト + プロパティ更新

### ModelViewer (`components/viewer/ModelViewer.tsx`)
- **種類:** Client Component
- **Props:**
  - `fileUrl: string | null` — ファイルURL（nullならローカルテストモード）
  - `fileName: string` — ファイル名（拡張子からフォーマット判定）
  - `onModelLoaded: (api: ViewerApi) => void` — モデル読込完了コールバック
  - `onElementSelected: (id, props) => void` — 要素選択コールバック
- **機能:** Three.jsシーン管理、マルチフォーマット3D読込（9形式対応）、レイキャスティングによる要素選択
- **内部状態:** status（ロード進捗）、error（エラーメッセージ）、loaded（読込完了フラグ）
- **ローダー:** IFCはweb-ifc、他はThree.jsローダー（dynamic importで必要時のみ読込）

### Toolbar (`components/viewer/Toolbar.tsx`)
- **種類:** Client Component
- **Props:** fileName, fileId, onFitView, onViewAngle, onToggleWireframe, wireframe, showTree, onToggleTree, showProps, onToggleProps
- **機能:** ビュー操作ボタン、パネルトグル

### ModelTree (`components/viewer/ModelTree.tsx`)
- **種類:** Client Component
- **Props:** `nodes: TreeNode[], selectedId: number|null, onSelect: (id) => void`
- **機能:** モデル要素のツリー表示。展開/折りたたみ。クリックで選択（カメラ移動・ハイライト・プロパティ連動）。
- **エクスポート:** `TreeNode` 型

### PropertiesPanel (`components/viewer/PropertiesPanel.tsx`)
- **種類:** Client Component
- **Props:** `properties: PropertyGroup[], selectedId: number|null`
- **機能:** 選択要素のプロパティをグループごとに表示
- **エクスポート:** `PropertyGroup` 型

## 4. ユーティリティ

### formats (`lib/formats.ts`)
- **エクスポート:**
  - `SUPPORTED_3D_FORMATS` — 対応形式リスト `{ ext, label }[]`
  - `SUPPORTED_EXTENSIONS` — 拡張子配列 `["ifc", "glb", "gltf", ...]`
  - `ACCEPT_STRING` — HTML input accept用文字列 `".ifc,.glb,.gltf,..."`
  - `getFormatFromFileName(fileName)` — ファイル名から拡張子を取得
  - `isSupportedFormat(fileName)` — 対応形式かどうかを判定
