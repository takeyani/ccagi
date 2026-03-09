# IFC 3Dビューア — セットアップガイド

## 1. 前提条件

- Node.js 18以上
- npm
- Supabase プロジェクト（認証・DB機能を使う場合）

## 2. インストール

```bash
cd cad
npm install
```

## 3. 環境変数

`.env.local` を作成（`.env.local.example` を参考）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 4. データベースセットアップ

Supabase の SQL Editor で `setup.sql` を実行:

```bash
# setup.sql の内容:
# - cad_user_profiles テーブル
# - cad_projects テーブル
# - cad_files テーブル
# - cad_file_versions テーブル
# - RLSポリシー（全テーブル）
# - cad-files ストレージバケット
```

## 5. 起動

```bash
npm run dev
```

ポート3002で起動: http://localhost:3002

## 6. テスト（Supabase不要）

サンプルIFCファイルを配置:

```bash
mkdir -p public/samples
cp /path/to/your/file.ifc public/samples/sample.ifc
```

ブラウザでアクセス:
- http://localhost:3002/test-sample — サンプルIFCを自動読込
- http://localhost:3002/test-viewer — ドラッグ&ドロップでIFC読込

## 7. 本番ビルド

```bash
npm run build
npm start
```

## 8. 検証チェックリスト

- [ ] `npx tsc --noEmit` — TypeScriptエラーなし
- [ ] `/test-sample` — IFCファイルが3D表示される
- [ ] マウスで回転・ズーム・パンが動作する
- [ ] ツールバーのボタンが動作する（全体表示、正面、上面、側面、ワイヤーフレーム）
- [ ] 3Dモデルの要素をクリック → プロパティパネルに情報表示
- [ ] ログイン → ダッシュボード表示
- [ ] プロジェクト作成 → ファイルアップロード → 一覧表示
- [ ] ビューアでアップロードしたIFCが表示される
