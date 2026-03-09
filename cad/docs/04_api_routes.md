# IFC 3Dビューア — ルート・API設計書

## 1. ページルート

| パス | 種類 | 認証 | 説明 |
|------|------|------|------|
| `/` | Server | - | 認証状態で `/dashboard` or `/login` へリダイレクト |
| `/login` | Static | 不要 | ログインページ |
| `/signup` | Static | 不要 | 新規登録ページ |
| `/dashboard` | Server | 必要 | ダッシュボード（統計・最近のファイル） |
| `/dashboard/projects` | Server | 必要 | プロジェクト一覧 |
| `/dashboard/projects/new` | Static | 必要 | プロジェクト作成フォーム |
| `/dashboard/projects/[id]` | Server | 必要 | プロジェクト詳細（ファイル一覧） |
| `/dashboard/projects/[id]/upload` | Server | 必要 | ファイルアップロード |
| `/dashboard/viewer/[fileId]` | Server | 必要 | 3Dビューア（メイン） |
| `/dashboard/settings` | Server | 必要 | ユーザー設定 |
| `/test-sample` | Client | 不要 | サンプルIFCテスト表示 |
| `/test-viewer` | Client | 不要 | ローカルファイルテスト |

## 2. APIルート

| パス | メソッド | 認証 | 説明 |
|------|---------|------|------|
| `/api/auth/callback` | GET | - | OAuth コールバック（code → session交換） |
| `/api/test-ifc` | GET | 不要 | ローカルサンプルIFCファイルの配信 |

## 3. Server Actions

### `/dashboard/projects/actions.ts`

| 関数 | 引数 | 説明 |
|------|------|------|
| `createProject(formData)` | name, description | プロジェクト作成 → `/dashboard/projects` へリダイレクト |
| `deleteProject(projectId)` | projectId: string | プロジェクト削除（カスケード） → `/dashboard/projects` へリダイレクト |
| `archiveProject(projectId)` | projectId: string | ステータスを archived に変更 |

### `/dashboard/settings/actions.ts`

| 関数 | 引数 | 説明 |
|------|------|------|
| `updateProfile(formData)` | display_name | ユーザープロフィール更新 |

## 4. 認証ミドルウェア

**対象:** `/dashboard/*` 以下の全ルート

**処理フロー:**
1. Supabase Auth で `getUser()` を呼出
2. ユーザーが存在しない場合 → `/login?redirect={pathname}` へリダイレクト
3. ユーザーが存在する場合 → そのまま通過

## 5. ファイルアップロードフロー

```
1. クライアント: FileUploadForm でファイル選択
2. クライアント: supabase.auth.getUser() でユーザーID取得
3. クライアント: supabase.storage.from('cad-files').upload(path, file)
4. クライアント: supabase.from('cad_files').insert({...}) でDB登録
5. リダイレクト → プロジェクト詳細ページ
```

**ストレージパス:** `{userId}/{projectId}/{uuid}.{ext}`

## 6. 3Dビューア表示フロー

```
1. サーバー: cad_files テーブルからファイル情報取得
2. サーバー: supabase.storage.createSignedUrl() で署名付きURL生成（有効期限1時間）
3. クライアント: ViewerLoader → ViewerClient → IFCViewer にURLを渡す
4. クライアント: IFCViewer が fetch(signedUrl) でIFCデータ取得
5. クライアント: web-ifc で解析 → Three.js メッシュ生成 → シーンに追加
```
