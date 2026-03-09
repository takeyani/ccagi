# IFC 3Dビューア — データベース設計書

## 1. テーブル一覧

| テーブル名 | 説明 | RLS |
|-----------|------|-----|
| cad_user_profiles | ユーザープロフィール | user_id ベース |
| cad_projects | プロジェクト | user_id ベース |
| cad_files | アップロードファイル | user_id ベース |
| cad_file_versions | ファイルバージョン | uploaded_by ベース |

全テーブル `cad_` プレフィックスで他プロジェクト（estimator等）と分離。

## 2. ER図

```
auth.users
    │
    ├──< cad_user_profiles (1:1)
    │
    ├──< cad_projects (1:N)
    │       │
    │       └──< cad_files (1:N)
    │               │
    │               └──< cad_file_versions (1:N)
    │
    └── (user_id FK on cad_files, cad_file_versions)
```

## 3. テーブル詳細

### 3.1 cad_user_profiles

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, FK → auth.users(id) CASCADE | ユーザーID |
| display_name | text | | 表示名 |
| email | text | | メールアドレス |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

**RLSポリシー:**
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- INSERT: `auth.uid() = id`

### 3.2 cad_projects

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | プロジェクトID |
| user_id | uuid | NOT NULL, FK → auth.users(id) CASCADE | 所有者 |
| name | text | NOT NULL | プロジェクト名 |
| description | text | DEFAULT '' | 説明 |
| status | text | DEFAULT 'active', CHECK (active/archived) | ステータス |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

**RLSポリシー:**
- SELECT / INSERT / UPDATE / DELETE: `auth.uid() = user_id`

### 3.3 cad_files

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | ファイルID |
| project_id | uuid | NOT NULL, FK → cad_projects(id) CASCADE | 所属プロジェクト |
| user_id | uuid | NOT NULL, FK → auth.users(id) CASCADE | アップロード者 |
| file_name | text | NOT NULL | 元ファイル名 |
| storage_path | text | NOT NULL | Supabase Storageパス |
| file_size | bigint | DEFAULT 0 | ファイルサイズ（バイト） |
| version | integer | DEFAULT 1 | 現在のバージョン番号 |
| notes | text | DEFAULT '' | メモ |
| thumbnail_path | text | | サムネイル画像パス（将来用） |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

**RLSポリシー:**
- SELECT / INSERT / UPDATE / DELETE: `auth.uid() = user_id`

**ストレージパス形式:** `{user_id}/{project_id}/{uuid}.ifc`

### 3.4 cad_file_versions

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | バージョンID |
| file_id | uuid | NOT NULL, FK → cad_files(id) CASCADE | 親ファイル |
| version | integer | NOT NULL | バージョン番号 |
| storage_path | text | NOT NULL | Storageパス |
| file_size | bigint | DEFAULT 0 | ファイルサイズ |
| uploaded_by | uuid | NOT NULL, FK → auth.users(id) CASCADE | アップロード者 |
| notes | text | DEFAULT '' | バージョンメモ |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

**RLSポリシー:**
- SELECT / INSERT: `auth.uid() = uploaded_by`

## 4. Supabase Storage

| バケット名 | 公開 | 用途 |
|-----------|------|------|
| cad-files | false（非公開） | IFCファイル保存 |

**ストレージポリシー:**
- INSERT: `bucket_id = 'cad-files' AND auth.uid() IS NOT NULL`
- SELECT: `bucket_id = 'cad-files' AND auth.uid() IS NOT NULL`
- DELETE: `bucket_id = 'cad-files' AND auth.uid() IS NOT NULL`

**ファイルアクセス:** 署名付きURL（有効期限1時間）で配信

## 5. セットアップ

`setup.sql` を Supabase SQL Editor で実行してテーブル・RLS・Storageバケットを作成する。
