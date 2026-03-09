# IFC 3Dビューア — ビューア詳細設計書

## 1. 概要

IFCファイルをブラウザ上で3D表示するビューアの詳細設計。
`web-ifc`（WASM）でIFCを解析し、`Three.js`でレンダリングする。

## 2. コンポーネント構成

```
ViewerLoader.tsx ─ Client Component, dynamic(ssr:false)
│
└── ViewerClient.tsx ─ 全体レイアウト・state管理
    │
    ├── Toolbar.tsx ─ 上部ツールバー
    │   ├── 「← 戻る」リンク
    │   ├── ファイル名表示
    │   ├── 全体表示ボタン
    │   ├── 正面 / 上面 / 側面ビューボタン
    │   ├── ワイヤーフレームトグル
    │   └── ツリー / プロパティ パネルトグル
    │
    ├── ModelTree.tsx ─ 左パネル（w-72）
    │   └── ツリーノード（再帰コンポーネント）
    │       ├── 展開/折りたたみ
    │       ├── クリックで選択
    │       └── 選択状態ハイライト
    │
    ├── IFCViewer.tsx ─ 中央（flex-1）
    │   ├── Three.js Scene
    │   ├── PerspectiveCamera
    │   ├── OrbitControls
    │   ├── WebGLRenderer
    │   ├── web-ifc ローダー
    │   └── Raycaster（クリック選択）
    │
    └── PropertiesPanel.tsx ─ 右パネル（w-80）
        └── PropertyGroup × N
            └── key-value ペア表示
```

## 3. ViewerClient — State管理

| State | 型 | 用途 |
|-------|-----|------|
| treeData | TreeNode[] | モデルツリーデータ |
| properties | PropertyGroup[] | 選択要素のプロパティ |
| selectedId | number \| null | 選択中のExpress ID |
| showTree | boolean | ツリーパネル表示 |
| showProps | boolean | プロパティパネル表示 |
| wireframe | boolean | ワイヤーフレームモード |
| viewerApi | ViewerApi | IFCViewer操作API |

## 4. ViewerApi インターフェース

```typescript
type ViewerApi = {
  getTree: () => TreeNode[];
  selectElement: (expressId: number) => void;
  fitView: () => void;
  setViewAngle: (angle: "front" | "top" | "right") => void;
  setWireframe: (enabled: boolean) => void;
};
```

IFCViewerがモデル読込完了時に `onModelLoaded(api)` で渡す。
ViewerClient が保持し、Toolbar等から呼び出す。

## 5. IFCViewer — Three.js セットアップ

### 5.1 シーン構成

| 要素 | 設定 |
|------|------|
| 背景色 | `#1a1a2e` |
| カメラ | PerspectiveCamera (FOV: 50, near: 0.1, far: 10000) |
| カメラ初期位置 | (20, 20, 20) |
| 操作 | OrbitControls (damping: 0.1) |
| 環境光 | AmbientLight (white, intensity: 0.6) |
| 指向性光1 | DirectionalLight (white, 0.8) at (50, 100, 50) |
| 指向性光2 | DirectionalLight (white, 0.3) at (-50, 50, -50) |
| グリッド | GridHelper (size: 100, divisions: 100) |

### 5.2 IFC読込処理

```
1. WebIFC.IfcAPI インスタンス生成
2. SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true)
3. await ifcApi.Init()
4. modelID = ifcApi.OpenModel(uint8Array)
5. ifcApi.StreamAllMeshes(modelID, callback)
   └── 各メッシュ:
       ├── GetGeometry() → 頂点・インデックス取得
       ├── 頂点データ分解（6floats: x,y,z,nx,ny,nz）
       ├── BufferGeometry 作成
       ├── MeshStandardMaterial 作成（IFCカラー適用）
       ├── Matrix4 変換適用
       └── modelGroup に追加
6. IFCタイプ情報取得（Wall, Slab, Column等）
7. ifcApi.CloseModel()
8. カメラフィット
```

### 5.3 要素選択（Raycasting）

```
1. click イベント
2. マウス座標 → NDC座標変換
3. Raycaster.intersectObject(modelGroup, true)
4. ヒットした場合:
   ├── 前回選択のマテリアル復元
   ├── ヒットメッシュを青色ハイライト
   ├── PropertyGroup[] を構築
   └── onElementSelected(expressId, props)
5. ヒットなし:
   └── onElementSelected(null, [])
```

### 5.4 カメラ操作

| 操作 | 実装 |
|------|------|
| fitView | BoundingBox → center計算 → カメラ距離 = maxDim * 1.5 |
| 正面 | camera.position = (cx, cy, cz + dist) |
| 上面 | camera.position = (cx, cy + dist, cz + 0.01) |
| 側面 | camera.position = (cx + dist, cy, cz) |

## 6. データ型定義

### TreeNode

```typescript
type TreeNode = {
  id: number;       // Express ID
  name: string;     // 要素名
  type: string;     // IFCタイプ or "Mesh"
  children: TreeNode[];
};
```

### PropertyGroup

```typescript
type PropertyGroup = {
  groupName: string;  // グループ名（例: "基本情報"）
  properties: {
    name: string;     // プロパティ名
    value: string;    // プロパティ値
  }[];
};
```

## 7. テストモード

| ルート | 動作 |
|--------|------|
| `/test-sample` | `public/samples/sample.ifc` を自動読込して3D表示 |
| `/test-viewer` | UIでファイル選択 or D&D → 読込して3D表示 |

どちらも認証不要。Supabase未設定でも動作確認可能。
