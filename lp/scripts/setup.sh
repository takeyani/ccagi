#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

echo "=== CCAGI LP ローカル開発環境セットアップ ==="
echo ""

# ─── [1] Docker起動確認 ───
echo "[1/6] Docker起動確認..."
if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Dockerが起動していません。Docker Desktopを起動してから再実行してください。"
  exit 1
fi
echo "  ✔ Docker is running"

# ─── [2] Supabase init（初回のみ） ───
echo "[2/6] Supabase初期化..."
if [ ! -f supabase/config.toml ]; then
  npx supabase init
  echo "  ✔ supabase/config.toml を生成しました"
else
  echo "  ✔ supabase/config.toml は既に存在します（スキップ）"
fi

# ─── [3] マイグレーションファイル配置 ───
echo "[3/6] マイグレーションファイル配置..."
mkdir -p supabase/migrations
MIGRATION_EXISTS=$(ls supabase/migrations/*_init.sql 2>/dev/null || true)
if [ -z "$MIGRATION_EXISTS" ]; then
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  cp setup.sql "supabase/migrations/${TIMESTAMP}_init.sql"
  echo "  ✔ setup.sql → supabase/migrations/${TIMESTAMP}_init.sql にコピーしました"
else
  echo "  ✔ initマイグレーションは既に存在します（スキップ）"
fi

# ─── [4] Supabase起動 ───
echo "[4/6] Supabaseコンテナ起動（初回は数分かかります）..."
npx supabase start
echo "  ✔ Supabaseが起動しました"

# ─── [5] .env.local 自動生成 ───
echo "[5/6] .env.local 生成..."
STATUS_OUTPUT=$(npx supabase status -o env)

API_URL=$(echo "$STATUS_OUTPUT" | grep "API_URL=" | head -1 | cut -d'=' -f2- | tr -d '"')
ANON_KEY=$(echo "$STATUS_OUTPUT" | grep "ANON_KEY=" | head -1 | cut -d'=' -f2- | tr -d '"')
SERVICE_ROLE_KEY=$(echo "$STATUS_OUTPUT" | grep "SERVICE_ROLE_KEY=" | head -1 | cut -d'=' -f2- | tr -d '"')

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "ERROR: Supabase statusからURL/Keyを取得できませんでした"
  echo "  npx supabase status を手動で確認してください"
  exit 1
fi

cat > .env.local << EOF
# Supabase（ローカル - 自動生成）
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# Stripe（手動で差し替えてください）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
EOF

echo "  ✔ .env.local を生成しました"

# ─── [6] npm install（必要時のみ） ───
echo "[6/6] 依存パッケージ確認..."
if [ ! -d node_modules ]; then
  npm install
  echo "  ✔ npm install 完了"
else
  echo "  ✔ node_modules は既に存在します（スキップ）"
fi

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "  Supabase Studio:  http://127.0.0.1:54323"
echo "  Supabase API:     ${API_URL}"
echo ""
echo "  次のステップ:"
echo "    1. .env.local のStripeキーを実際の値に差し替え"
echo "    2. npm run dev でNext.js開発サーバー起動"
echo ""
