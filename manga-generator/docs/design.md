# 漫画ジェネレーター 設計書

| 項目 | 内容 |
|------|------|
| プロジェクト名 | 漫画ジェネレーター (Manga Generator) |
| 版数 | 1.0 |
| 作成日 | 2026-03-17 |
| ステータス | 実装完了 |

---

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                    クライアント (Browser)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Dashboard │ │ Projects │ │ Editor   │ │ Settings │   │
│  │          │ │ + Create │ │ (DnD)    │ │          │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       └─────────────┴────────────┴─────────────┘         │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTP (REST API)
┌─────────────────────────┼────────────────────────────────┐
│                  Next.js 16 Server                        │
│  ┌──────────────────────┴──────────────────────────┐     │
│  │              API Routes (App Router)              │     │
│  │  /api/projects  /api/characters  /api/generate    │     │
│  │  /api/panels    /api/export                       │     │
│  └──────┬──────────────┬──────────────┬─────────────┘     │
│         │              │              │                    │
│  ┌──────┴──────┐ ┌─────┴─────┐ ┌─────┴──────┐           │
│  │ Generation  │ │  Tonmana  │ │ Providers  │           │
│  │ Pipeline    │ │ Compiler  │ │ Factory    │           │
│  └──────┬──────┘ └───────────┘ └─────┬──────┘           │
│         │                            │                    │
└─────────┼────────────────────────────┼────────────────────┘
          │                            │
    ┌─────┴─────┐          ┌──────────┼──────────┐
    │ Claude    │          │          │          │
    │ API       │     ┌────┴───┐ ┌───┴────┐ ┌──┴───┐
    │(Anthropic)│     │ OpenAI │ │Stability│ │Gemini│
    └───────────┘     │  API   │ │  API    │ │ API  │
                      └────────┘ └────────┘ └──────┘
          │
    ┌─────┴──────────────────────────┐
    │         Supabase               │
    │  ┌──────────┐ ┌────────────┐  │
    │  │PostgreSQL │ │  Storage   │  │
    │  │  (RLS)    │ │(manga-imgs)│  │
    │  └──────────┘ └────────────┘  │
    │  ┌──────────┐                 │
    │  │   Auth   │                 │
    │  └──────────┘                 │
    └────────────────────────────────┘
```

### 1.2 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.1.6 |
| UIフレームワーク | React | 19.2.3 |
| スタイリング | Tailwind CSS | 4 |
| 言語 | TypeScript | 5 |
| DB | PostgreSQL (Supabase) | — |
| 認証 | Supabase Auth | — |
| ストレージ | Supabase Storage | — |
| LLM | Claude Sonnet 4 (Anthropic SDK) | 0.79.0 |
| 画像生成 | OpenAI / Stability AI / Gemini | 切替可能 |
| D&D | @dnd-kit | core 6.3, sortable 10.0 |
| エクスポート | html-to-image + jsPDF | 1.11 / 4.2 |
| テスト | Vitest | 4.1.0 |

---

## 2. ディレクトリ構成

```
manga-generator/
├── docs/
│   ├── requirements.md          # 要件定義書
│   └── design.md                # 設計書（本書）
├── setup.sql                     # DBスキーマ
├── .env.local.example            # 環境変数テンプレート
├── vitest.config.ts              # テスト設定
├── package.json
├── next.config.ts
├── tsconfig.json
└── src/
    ├── middleware.ts              # 認証ミドルウェア
    ├── __tests__/                 # ユニットテスト
    │   ├── tonmana-compiler.test.ts
    │   ├── story-parser.test.ts
    │   ├── prompt-builder.test.ts
    │   └── provider-factory.test.ts
    ├── lib/                       # コアロジック
    │   ├── types.ts               # 全型定義
    │   ├── auth.ts                # 認証ヘルパー
    │   ├── supabase/
    │   │   ├── server.ts          # Server Component用
    │   │   ├── client.ts          # Client Component用
    │   │   └── admin.ts           # サービスロール用
    │   ├── tonmana/
    │   │   ├── presets.ts         # スタイルプリセット定義
    │   │   └── compiler.ts        # 設定→プロンプト変換
    │   ├── providers/
    │   │   ├── types.ts           # ImageProviderインターフェース
    │   │   ├── factory.ts         # プロバイダーファクトリー
    │   │   ├── openai.ts          # OpenAI実装
    │   │   ├── stability.ts       # Stability AI実装
    │   │   └── gemini.ts          # Gemini実装
    │   └── generation/
    │       ├── pipeline.ts        # フルパイプライン
    │       ├── story-parser.ts    # Claude応答パーサー
    │       └── prompt-builder.ts  # プロンプト構築
    ├── components/
    │   ├── AppShell.tsx           # ナビゲーション付きレイアウト
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── SignupForm.tsx
    │   │   └── LogoutButton.tsx
    │   ├── characters/
    │   │   └── CharacterForm.tsx
    │   ├── projects/
    │   │   └── TonmanaEditor.tsx
    │   ├── generate/
    │   │   ├── PromptInput.tsx
    │   │   └── GenerationProgress.tsx
    │   └── editor/
    │       ├── PanelCanvas.tsx    # メインエディタ
    │       ├── SortablePanel.tsx  # D&Dパネル
    │       └── DialogueEditor.tsx # セリフ編集モーダル
    └── app/
        ├── layout.tsx             # ルートレイアウト
        ├── page.tsx               # ダッシュボード
        ├── globals.css
        ├── (auth)/
        │   ├── layout.tsx
        │   ├── login/page.tsx
        │   └── signup/page.tsx
        ├── projects/
        │   ├── page.tsx           # 一覧
        │   ├── new/page.tsx       # 作成
        │   └── [id]/
        │       ├── page.tsx       # 詳細
        │       ├── generate/page.tsx  # 生成
        │       └── edit/page.tsx      # エディタ
        ├── characters/
        │   ├── page.tsx           # 一覧
        │   ├── new/page.tsx       # 作成
        │   └── [id]/page.tsx      # 編集
        ├── settings/page.tsx
        └── api/
            ├── projects/
            │   ├── route.ts       # GET, POST
            │   └── [id]/route.ts  # GET, PATCH, DELETE
            ├── characters/
            │   ├── route.ts       # GET, POST
            │   └── [id]/route.ts  # GET, PATCH, DELETE
            ├── generate/
            │   ├── story/route.ts # POST
            │   ├── image/route.ts # POST
            │   └── manga/route.ts # POST
            ├── panels/
            │   └── [id]/route.ts  # PATCH, DELETE
            └── export/route.ts    # POST
```

---

## 3. データベース設計

### 3.1 ER図

```
┌──────────────┐     ┌──────────────┐
│ user_profiles │     │  characters  │
│──────────────│     │──────────────│
│ id (PK/FK)   │◄────│ user_id (FK) │
│ display_name │     │ id (PK)      │
│ default_prov │     │ name         │
│ api_keys     │     │ appearance.. │
│ created_at   │     │ visual_prompt│
│ updated_at   │     │ ref_images[] │
└──────────────┘     └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   projects   │     │ manga_pages  │     │    panels    │
│──────────────│     │──────────────│     │──────────────│
│ id (PK)      │◄────│ project_id   │◄────│ page_id (FK) │
│ user_id (FK) │     │ id (PK)      │     │ id (PK)      │
│ title        │     │ page_number  │     │ panel_order  │
│ tonmana_cfg  │     │ layout_tpl   │     │ image_url    │
│ default_prov │     │ layout_cfg   │     │ scene_desc   │
│ char_ids[]   │     │ created_at   │     │ dialogue[]   │
│ status       │     │ updated_at   │     │ sound_fx[]   │
│ created_at   │     └──────────────┘     │ layout_rect  │
│ updated_at   │                          │ created_at   │
└──────────────┘                          │ updated_at   │
       │                                  └──────────────┘
       │ 1:N
       ▼
┌──────────────┐
│ generations  │
│──────────────│
│ id (PK)      │
│ user_id (FK) │
│ project_id   │
│ input_text   │
│ panel_break..│
│ provider     │
│ status       │
│ result       │
│ error_msg    │
│ created_at   │
│ updated_at   │
└──────────────┘
```

### 3.2 テーブル詳細

#### user_profiles

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, FK→auth.users | ユーザーID |
| display_name | text | NOT NULL, DEFAULT '' | 表示名 |
| default_provider | text | NOT NULL, DEFAULT 'openai', CHECK IN ('openai','stability','gemini') | デフォルトプロバイダー |
| api_keys | jsonb | NOT NULL, DEFAULT '{}' | 各プロバイダーのAPIキー |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### characters

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | キャラクターID |
| user_id | uuid | NOT NULL, FK→auth.users | 所有者 |
| name | text | NOT NULL | キャラクター名 |
| appearance_description | text | NOT NULL, DEFAULT '' | 外見の日本語説明 |
| visual_prompt | text | NOT NULL, DEFAULT '' | 画像生成用英語プロンプト |
| reference_images | text[] | NOT NULL, DEFAULT '{}' | 参考画像URL配列 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### projects

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | プロジェクトID |
| user_id | uuid | NOT NULL, FK→auth.users | 所有者 |
| title | text | NOT NULL | タイトル |
| tonmana_config | jsonb | NOT NULL, DEFAULT '{}' | トンマナ設定 (TonmanaConfig) |
| default_provider | text | NOT NULL, DEFAULT 'openai', CHECK | 画像プロバイダー |
| character_ids | uuid[] | NOT NULL, DEFAULT '{}' | 使用キャラクターID配列 |
| status | text | NOT NULL, DEFAULT 'draft', CHECK IN ('draft','generating','completed') | ステータス |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### manga_pages

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | ページID |
| project_id | uuid | NOT NULL, FK→projects ON DELETE CASCADE | プロジェクト |
| page_number | integer | NOT NULL, DEFAULT 1 | ページ番号 |
| layout_template | text | NOT NULL, DEFAULT 'auto' | レイアウトテンプレート名 |
| layout_config | jsonb | NOT NULL, DEFAULT '{}' | レイアウト設定 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### panels

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | パネルID |
| page_id | uuid | NOT NULL, FK→manga_pages ON DELETE CASCADE | ページ |
| panel_order | integer | NOT NULL, DEFAULT 0 | 表示順 |
| image_url | text | NULL | 生成画像URL |
| scene_description | text | NOT NULL, DEFAULT '' | シーン説明 |
| dialogue | jsonb | NOT NULL, DEFAULT '[]' | セリフ配列 (DialogueEntry[]) |
| sound_effects | jsonb | NOT NULL, DEFAULT '[]' | 効果音配列 (SoundEffect[]) |
| layout_rect | jsonb | NOT NULL, DEFAULT '{"x":0,"y":0,"w":1,"h":1}' | レイアウト矩形 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### generations

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | 生成ID |
| user_id | uuid | NOT NULL, FK→auth.users | 実行者 |
| project_id | uuid | FK→projects ON DELETE SET NULL | プロジェクト |
| input_text | text | NOT NULL, DEFAULT '' | 入力テキスト |
| panel_breakdown | jsonb | NOT NULL, DEFAULT '[]' | パネル分解結果 |
| provider | text | NOT NULL, DEFAULT 'openai' | 使用プロバイダー |
| status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','processing','completed','failed') | ステータス |
| result | jsonb | NOT NULL, DEFAULT '{}' | 実行結果 |
| error_message | text | NULL | エラーメッセージ |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

### 3.3 RLSポリシー設計

| テーブル | ポリシー | ルール |
|---------|---------|--------|
| user_profiles | SELECT/INSERT/UPDATE own | `auth.uid() = id` |
| characters | SELECT/INSERT/UPDATE/DELETE own | `auth.uid() = user_id` |
| projects | SELECT/INSERT/UPDATE/DELETE own | `auth.uid() = user_id` |
| manga_pages | SELECT/INSERT/UPDATE/DELETE own | `projects.user_id = auth.uid()` (JOIN経由) |
| panels | SELECT/INSERT/UPDATE/DELETE own | `projects.user_id = auth.uid()` (2段JOIN経由) |
| generations | SELECT/INSERT/UPDATE own | `auth.uid() = user_id` |

### 3.4 ストレージ

| バケット | 公開 | 用途 |
|---------|------|------|
| manga-images | public | 生成画像・参考画像の保存 |

ストレージポリシー:
- INSERT: 認証済みユーザーのみ
- SELECT: 全員（公開）
- DELETE: 認証済みユーザーのみ

---

## 4. コンポーネント設計

### 4.1 画像生成プロバイダー（Strategy パターン）

```typescript
// インターフェース
interface ImageProvider {
  name: 'openai' | 'stability' | 'gemini';
  generate(prompt: string, options?: ImageOptions): Promise<ImageResult>;
}

// ファクトリー
function createImageProvider(name, apiKey?): ImageProvider
```

| プロバイダー | クラス | モデル | サイズ対応 |
|------------|--------|--------|-----------|
| OpenAI | OpenAIProvider | gpt-image-1 | 1024x1024, 1536x1024, 1024x1536 |
| Stability | StabilityProvider | SD3 (v2beta) | 1:1, 3:2, 16:9, 2:3, 9:16 |
| Gemini | GeminiProvider | Imagen 3.0 | 1:1 固定 |

選択ロジック: プロジェクト設定 > ユーザーデフォルト > openai

### 4.2 トンマナコンパイラ

```
TonmanaConfig
  ├── art_style  → ART_STYLE_PROMPTS[key]
  ├── genre      → GENRE_PROMPTS[key]
  ├── color_mode → COLOR_MODE_PROMPTS[key]
  ├── line_style → LINE_STYLE_PROMPTS[key]
  ├── color_palette → "using color palette: #xxx, #yyy"
  └── custom_prompt → そのまま結合
       ↓
  カンマ区切りで結合 → プロンプト修飾子文字列
```

各プリセットキーに対応する英語プロンプトテンプレートを保持。`compileTonmana()` で設定オブジェクトを画像生成用の修飾子文字列に変換する。

### 4.3 生成パイプライン

```
runGenerationPipeline(input: PipelineInput): Promise<PipelineResult>

PipelineInput:
  userId, projectId, inputText, provider, tonmana, characters, apiKeys

処理フロー:
  1. generations レコード作成 (status: processing)
  2. Claude API 呼び出し
     - system: buildStorySystemPrompt(characterNames)
     - user: inputText
     → レスポンスをパース: parseStoryResponse() → PanelBreakdown[]
  3. manga_pages レコード作成
  4. 各パネルを Promise.all で並列処理:
     a. buildImagePrompt(panel, characters, tonmana)
     b. imageProvider.generate(prompt)
     c. base64 → Supabase Storage アップロード
     d. panels レコード作成 (with computeLayoutRect)
  5. generations.status = 'completed'
  6. projects.status = 'completed'
```

#### パネル分解のJSON形式（Claude出力）

```json
[
  {
    "panel_number": 1,
    "scene_description": "シーンの視覚的説明（画像生成用）",
    "camera_angle": "close-up | medium shot | wide shot | bird's eye | low angle | dutch angle",
    "dialogue": [
      {
        "character_name": "キャラ名",
        "text": "セリフ内容",
        "position": { "x": 0.5, "y": 0.1 },
        "style": "speech | thought | narration | shout"
      }
    ],
    "sound_effects": [
      {
        "text": "ドカーン",
        "position": { "x": 0.5, "y": 0.5 },
        "rotation": 15
      }
    ],
    "mood": "感情トーン",
    "characters": ["キャラ名1", "キャラ名2"]
  }
]
```

#### 画像プロンプト構築ロジック

```
最終プロンプト = [
  compileTonmana(tonmana),               // スタイル修飾子
  panel.scene_description,                // シーン説明
  "camera angle: " + panel.camera_angle,  // カメラアングル
  "characters: " + charVisualPrompts,     // キャラ外見
  "mood: " + panel.mood,                  // ムード (neutral以外)
  "single manga panel, clear composition, no text overlay"
].join(". ")
```

### 4.4 レイアウト計算

```typescript
computeLayoutRect(index, total):
  cols = total <= 4 ? 2 : 3
  col = index % cols
  row = floor(index / cols)
  w = 1 / cols
  h = 1 / ceil(total / cols)
  → { x: col*w, y: row*h, w, h }
```

| パネル数 | グリッド | 配置 |
|---------|---------|------|
| 1-4 | 2列 | 2x1, 2x2 |
| 5-9 | 3列 | 3x2, 3x3 |

---

## 5. 画面設計

### 5.1 画面遷移図

```
[ログイン] ←→ [新規登録]
     │
     ▼
[ダッシュボード] ─────────────────────────────────┐
     │              │              │              │
     ▼              ▼              ▼              ▼
[プロジェクト一覧] [キャラクター一覧] [設定]        │
     │              │                             │
     ▼              ├→ [キャラクター作成]           │
[プロジェクト作成]  └→ [キャラクター編集]           │
     │                                            │
     ▼                                            │
[プロジェクト詳細] ←──────────────────────────────┘
     ├→ [漫画生成]
     │       │
     │       ▼
     └→ [コマ割りエディタ] → PNG/PDF出力
```

### 5.2 レイアウト構成

#### AppShell（共通レイアウト）

```
┌──────────────────────────────────────────┐
│ [サイドバー]          [メインコンテンツ]    │
│ ┌────────┐  ┌────────────────────────┐  │
│ │漫画     │  │                        │  │
│ │ジェネ   │  │   各ページの内容        │  │
│ │レーター  │  │                        │  │
│ │        │  │                        │  │
│ │■ ダッシュ│  │                        │  │
│ │  プロジェ│  │                        │  │
│ │  キャラク│  │                        │  │
│ │  設定   │  │                        │  │
│ │        │  │                        │  │
│ │[ログアウト]│ │                        │  │
│ └────────┘  └────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### トンマナエディタ

```
┌──────────────────────────────────────┐
│ アートスタイル                        │
│ ┌─────┐┌─────┐┌─────┐┌─────┐       │
│ │少年  ││少女  ││4コマ ││リアル │ ...   │
│ │漫画  ││漫画  ││     ││     │       │
│ └─────┘└─────┘└─────┘└─────┘       │
│ ┌─────┐┌─────┐┌─────┐┌─────┐       │
│ │グラレコ││水彩風 ││ピクセル││浮世絵│ ...   │
│ └─────┘└─────┘└─────┘└─────┘       │
│                                      │
│ ジャンル                              │
│ [アクション] [ラブコメ] [ホラー] ...   │
│                                      │
│ カラーモード                          │
│ [モノクロ] [フルカラー] [セピア] ...   │
│                                      │
│ 線のスタイル                          │
│ [太線] [細線] [ラフ] [クリーン] [ブラシ]│
│                                      │
│ カラーパレット  [■][■][■][+]         │
│                                      │
│ カスタムプロンプト                     │
│ ┌──────────────────────────────┐     │
│ │                              │     │
│ └──────────────────────────────┘     │
│ [プロンプトプレビューを表示]           │
└──────────────────────────────────────┘
```

#### コマ割りエディタ

```
┌──────────────────────────────────────┐
│ [4 パネル]              [PNG] [PDF]  │
│ ┌──────────────────────────────────┐│
│ │ ┌────────┐ ┌────────┐ ┌────────┐││
│ │ │≡ [画像] │ │≡ [画像] │ │≡ [画像] │││
│ │ │  D&D   │ │  D&D   │ │  D&D   │││
│ │ │ セリフ  │ │ セリフ  │ │ セリフ  │││
│ │ │[編集][再]│ │[編集][再]│ │[編集][再]│││
│ │ │   ① │ │   ② │ │   ③ │││
│ │ └────────┘ └────────┘ └────────┘││
│ │ ┌────────┐                      ││
│ │ │≡ [画像] │                      ││
│ │ │   ④ │                      ││
│ │ └────────┘                      ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

---

## 6. API設計

### 6.1 プロジェクトAPI

#### POST /api/projects

```
Request:
  { title, tonmana_config, default_provider, character_ids }

Response: 201
  { id, user_id, title, tonmana_config, ... }
```

#### GET /api/projects

```
Response: 200
  [{ id, title, status, updated_at, ... }]
  ※ user_id = 認証ユーザーのもののみ（RLS）
  ※ updated_at DESC
```

#### GET /api/projects/[id]

```
Response: 200 | 404
  { id, title, tonmana_config, ... }
```

#### PATCH /api/projects/[id]

```
Request: 更新対象フィールドのみ
  { title?, tonmana_config?, default_provider?, ... }

Response: 200
  { id, ... }
```

#### DELETE /api/projects/[id]

```
Response: 200
  { success: true }
```

### 6.2 キャラクターAPI

#### POST /api/characters

```
Request:
  { name, appearance_description, visual_prompt, reference_images }

Response: 201
  { id, user_id, name, ... }
```

#### GET /api/characters

```
Response: 200
  [{ id, name, appearance_description, ... }]
```

#### GET /api/characters/[id]

```
Response: 200 | 404
```

#### PATCH /api/characters/[id]

```
Request: 更新対象フィールドのみ
Response: 200
```

#### DELETE /api/characters/[id]

```
Response: 200
  { success: true }
```

### 6.3 生成API

#### POST /api/generate/story

ストーリーテキストをClaudeで解析し、パネル分解結果を返す。

```
Request:
  { text: string, character_names?: string[] }

Response: 200
  { panels: PanelBreakdown[] }
```

#### POST /api/generate/image

単一の画像を生成する。

```
Request:
  { prompt: string, provider?: string, api_key?: string, options?: ImageOptions }

Response: 200
  { url: string, revised_prompt?: string }
```

#### POST /api/generate/manga

フルパイプラインを実行する。

```
Request:
  { project_id: string, input_text: string }

Response: 200
  { generationId, pageId, panels: [{ id, image_url }] }

処理:
  1. プロジェクト・キャラクター・ユーザー設定を取得
  2. projects.status = 'generating'
  3. runGenerationPipeline() 実行
  4. 結果を返却
```

### 6.4 パネルAPI

#### PATCH /api/panels/[id]

```
Request:
  { panel_order?, dialogue?, sound_effects?, scene_description? }

Response: 200
```

#### DELETE /api/panels/[id]

```
Response: 200
  { success: true }
```

### 6.5 エクスポートAPI

#### POST /api/export

```
Request:
  { project_id: string, format?: 'png' | 'pdf' }

Response: 200
  { format, pages: [{ ..., panels: [...] }] }
  ※ クライアント側で html-to-image / jsPDF を使って出力
```

---

## 7. 認証・認可設計

### 7.1 認証フロー

```
[ブラウザ] → Supabase Auth (signUp / signInWithPassword)
         ← セッションCookie設定
         → 各リクエストにCookie付与
         → Middleware: Supabase SSR でセッション検証
         → 未認証 → /login?redirect=... にリダイレクト
```

### 7.2 Middleware保護対象

```typescript
export const config = {
  matcher: [
    "/projects/:path*",
    "/characters/:path*",
    "/settings/:path*",
    "/api/generate/:path*",
    "/api/projects/:path*",
    "/api/characters/:path*",
    "/api/panels/:path*",
    "/api/export/:path*",
  ],
};
```

### 7.3 Supabaseクライアント使い分け

| クライアント | 用途 | ファイル |
|------------|------|---------|
| Server | Server Component / API Route (ユーザーコンテキスト) | supabase/server.ts |
| Client | Client Component (ブラウザ) | supabase/client.ts |
| Admin | パイプライン処理 (サービスロール) | supabase/admin.ts |

---

## 8. テスト設計

### 8.1 テストファイル一覧

| ファイル | テスト対象 | テスト数 |
|---------|-----------|---------|
| tonmana-compiler.test.ts | compileTonmana() | 6 |
| story-parser.test.ts | parseStoryResponse() | 5 |
| prompt-builder.test.ts | buildImagePrompt(), buildStorySystemPrompt() | 8 |
| provider-factory.test.ts | createImageProvider() | 4 |
| **合計** | | **24** (全通過) |

### 8.2 テスト観点

| モジュール | 観点 |
|-----------|------|
| tonmana-compiler | 全14スタイルが正常出力、カスタムプロンプト結合、カラーパレット反映 |
| story-parser | 正常JSON解析、Markdown code block抽出、不正入力のエラー、デフォルト値適用 |
| prompt-builder | シーン説明含有、キャラクター情報含有、トンマナスタイル含有、ムード条件分岐 |
| provider-factory | 各プロバイダー生成、不明プロバイダーのエラー |

### 8.3 テスト実行

```bash
npm run test       # 単発実行
npm run test:watch  # ウォッチモード
```

---

## 9. デプロイ設計

### 9.1 必要な環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # 任意（ユーザー設定で代替可）
STABILITY_API_KEY=sk-...       # 任意
GEMINI_API_KEY=AIza...         # 任意
```

### 9.2 DBセットアップ

```bash
# Supabaseプロジェクト作成後、SQLエディタで実行
psql < setup.sql
```

### 9.3 ビルド・起動

```bash
npm install
npm run build    # 本番ビルド
npm run start    # 本番起動
npm run dev      # 開発サーバー
```
