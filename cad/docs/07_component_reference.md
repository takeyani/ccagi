# IFC 3Dビューア — コンポーネントリファレンス

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
- **機能:** IFCファイルのアップロード。D&D対応。プログレスバー表示。
- **状態:** file, notes, uploading, error, progress

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
- **機能:** ビューア全体のレイアウトとstate管理。Toolbar/ModelTree/IFCViewer/PropertiesPanelを配置。
- **状態:** treeData, properties, selectedId, showTree, showProps, wireframe, viewerApi

### IFCViewer (`components/viewer/IFCViewer.tsx`)
- **種類:** Client Component
- **Props:**
  - `fileUrl: string | null` — IFCファイルのURL（nullならローカルテストモード）
  - `onModelLoaded: (api: ViewerApi) => void` — モデル読込完了コールバック
  - `onElementSelected: (expressId, props) => void` — 要素選択コールバック
- **機能:** Three.jsシーン管理、web-ifcによるIFC読込、レイキャスティングによる要素選択

### Toolbar (`components/viewer/Toolbar.tsx`)
- **種類:** Client Component
- **Props:** fileName, fileId, onFitView, onViewAngle, onToggleWireframe, wireframe, showTree, onToggleTree, showProps, onToggleProps
- **機能:** ビュー操作ボタン、パネルトグル

### ModelTree (`components/viewer/ModelTree.tsx`)
- **種類:** Client Component
- **Props:** `nodes: TreeNode[], selectedId: number|null, onSelect: (id) => void`
- **機能:** モデル要素のツリー表示。展開/折りたたみ。クリックで選択。
- **エクスポート:** `TreeNode` 型

### PropertiesPanel (`components/viewer/PropertiesPanel.tsx`)
- **種類:** Client Component
- **Props:** `properties: PropertyGroup[], selectedId: number|null`
- **機能:** 選択要素のプロパティをグループごとに表示
- **エクスポート:** `PropertyGroup` 型
