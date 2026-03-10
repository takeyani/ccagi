# 3Dモデルビューア — ビューア詳細設計書

## 1. 概要

複数形式の3Dモデルファイルをブラウザ上で3D表示するビューアの詳細設計。
IFC形式は `web-ifc`（WASM）で解析、その他の形式は Three.js 同梱ローダーで読み込み、`Three.js` でレンダリングする。

## 2. 対応フォーマットとローダー

| 形式 | ローダー | import元 | 出力 |
|------|---------|---------|------|
| IFC | web-ifc IfcAPI | `web-ifc` | 独自メッシュ構築 |
| glTF / GLB | GLTFLoader | `three/examples/jsm/loaders/GLTFLoader.js` | `gltf.scene` (Group) |
| FBX | FBXLoader | `three/examples/jsm/loaders/FBXLoader.js` | Group |
| OBJ | OBJLoader | `three/examples/jsm/loaders/OBJLoader.js` | Group |
| STL | STLLoader | `three/examples/jsm/loaders/STLLoader.js` | BufferGeometry → Mesh化 |
| COLLADA | ColladaLoader | `three/examples/jsm/loaders/ColladaLoader.js` | `collada.scene` (Group) |
| PLY | PLYLoader | `three/examples/jsm/loaders/PLYLoader.js` | BufferGeometry → Mesh化 |
| 3DS | TDSLoader | `three/examples/jsm/loaders/TDSLoader.js` | Group |

全ローダーは **dynamic import** で必要時のみロードされる。

## 3. コンポーネント構成

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
    │       ├── クリックで選択（カメラ移動 + ハイライト + プロパティ更新）
    │       └── 選択状態ハイライト
    │
    ├── ModelViewer.tsx ─ 中央（flex-1）
    │   ├── Three.js Scene / Canvas（JSX内に配置）
    │   ├── PerspectiveCamera
    │   ├── OrbitControls
    │   ├── WebGLRenderer
    │   ├── マルチフォーマットローダー
    │   └── Raycaster（クリック選択）
    │
    └── PropertiesPanel.tsx ─ 右パネル（w-80）
        └── PropertyGroup × N
            └── key-value ペア表示
```

## 4. ViewerClient — State管理

| State | 型 | 用途 |
|-------|-----|------|
| treeData | TreeNode[] | モデルツリーデータ |
| properties | PropertyGroup[] | 選択要素のプロパティ |
| selectedId | number \| null | 選択中の要素ID |
| showTree | boolean | ツリーパネル表示 |
| showProps | boolean | プロパティパネル表示 |
| wireframe | boolean | ワイヤーフレームモード |
| viewerApi | ViewerApi | ModelViewer操作API |

## 5. ViewerApi インターフェース

```typescript
type ViewerApi = {
  getTree: () => TreeNode[];
  selectElement: (id: number) => void;
  fitView: () => void;
  setViewAngle: (angle: "front" | "top" | "right") => void;
  setWireframe: (enabled: boolean) => void;
};
```

ModelViewerがモデル読込完了時に `onModelLoaded(api)` で渡す。
ViewerClient が保持し、Toolbar やツリー選択から呼び出す。

## 6. ModelViewer — Three.js セットアップ

### 6.1 シーン構成

| 要素 | 設定 |
|------|------|
| Canvas | JSX内の `<canvas>` 要素を ref で管理 |
| 背景色 | `#1a1a2e` |
| カメラ | PerspectiveCamera (FOV: 50, near: 動的, far: 動的) |
| カメラ初期位置 | (20, 20, 20) |
| 操作 | OrbitControls (damping: 0.1) |
| 環境光 | AmbientLight (white, intensity: 0.6) |
| 指向性光1 | DirectionalLight (white, 0.8) at (50, 100, 50) |
| 指向性光2 | DirectionalLight (white, 0.3) at (-50, 50, -50) |
| グリッド | GridHelper (size: 100, divisions: 100) |

### 6.2 IFC読込処理

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

### 6.3 汎用フォーマット読込処理

```
1. dynamic import で該当ローダーを読み込み
2. loader.load(url, onLoad, onProgress, onError)
3. STL/PLY: BufferGeometry → MeshStandardMaterial + Mesh に変換
4. PLY: vertexColors 対応、法線自動計算
5. 結果の Group/Mesh を modelGroup に追加
6. Object3D 階層からツリーノードを再帰構築（buildTreeFromObject3D）
7. カメラフィット
```

### 6.4 要素選択（Raycasting）

```
1. canvas click イベント
2. マウス座標 → NDC座標変換
3. Raycaster.intersectObject(modelGroup, true)
4. ヒットした場合:
   ├── 前回選択のマテリアル復元
   ├── ヒットメッシュを青色ハイライト
   ├── PropertyGroup[] を構築
   └── onElementSelected(id, props)
5. ヒットなし:
   └── onElementSelected(null, [])
```

### 6.5 ツリー選択（selectElement）

```
1. ツリーノードクリック → viewerApi.selectElement(id)
2. modelGroup.traverse で該当オブジェクトを検索
3. 該当オブジェクト:
   ├── BoundingBox 計算 → カメラ移動（要素サイズに応じた距離）
   ├── Meshの場合: 青色ハイライト
   ├── Groupの場合: ハイライトなし、子要素数をプロパティに追加
   └── onElementSelected(id, props) → プロパティパネル更新
```

### 6.6 カメラ操作

| 操作 | 実装 |
|------|------|
| fitView | BoundingBox → center計算 → カメラ距離 = maxDim * 1.5、near/far 動的調整 |
| 正面 | camera.position = (cx, cy, cz + dist) |
| 上面 | camera.position = (cx, cy + dist, cz + 0.01) |
| 側面 | camera.position = (cx + dist, cy, cz) |

## 7. データ型定義

### TreeNode

```typescript
type TreeNode = {
  id: number;       // Express ID（IFC）or Object3D.id（その他）
  name: string;     // 要素名
  type: string;     // IFCタイプ / "Mesh" / "Group" 等
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

## 8. ツリー構築

### IFC形式
フラットなリスト（各メッシュ = 1ノード）。StreamAllMeshesの結果から構築。

### その他の形式
`buildTreeFromObject3D` で Object3D 階層を再帰的にトラバースし、Mesh ノードまたは Mesh を子に持つ Group ノードをツリーに含める。

## 9. テストモード

| ルート | 動作 |
|--------|------|
| `/test-sample` | `public/samples/sample.ifc` を自動読込して3D表示 |
| `/test-viewer` | ファイル選択 or D&D → 全対応形式を読込して3D表示 |

どちらも認証不要。Supabase未設定でも動作確認可能。

## 10. 状態表示

ModelViewer にはロード状態の UI オーバーレイがある:
- `status`: 「WASMエンジン初期化中...」「IFCモデル解析中...」等のローディング表示
- `error`: 読込エラーメッセージ表示
- `loaded`: true になるとローカルモードのファイル選択オーバーレイを非表示
