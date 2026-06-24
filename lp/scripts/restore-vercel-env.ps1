# 本番Vercel環境変数 復旧スクリプト
# 用途: lp プロジェクトの Production 環境変数を、対話入力で一括更新する
# 仕様:
#   - 既存値を vercel env rm で削除 → vercel env add で再登録
#   - stdin リダイレクトで値を渡すため末尾改行が混入しない
#   - 空Enterで該当変数をスキップ
#
# 実行例（lp ディレクトリで）:
#   powershell -ExecutionPolicy Bypass -File .\scripts\restore-vercel-env.ps1

$ErrorActionPreference = "Stop"

# lp/ ディレクトリで実行されているか確認
if (-not (Test-Path ".\package.json") -or -not (Test-Path ".\.vercel\project.json")) {
    Write-Host "[ERROR] このスクリプトは lp/ ディレクトリで実行してください" -ForegroundColor Red
    exit 1
}

# Vercel CLI 認証確認
Write-Host "=== Vercel CLI 認証確認 ===" -ForegroundColor Cyan
& vercel whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] vercel login を先に実行してください" -ForegroundColor Red
    exit 1
}

# 対象環境
$TargetEnv = "production"

# 更新したい変数の定義
# group: 表示用カテゴリ / hint: 入力欄に出すガイド文
$envVars = @(
    @{ name = "NEXT_PUBLIC_SUPABASE_URL";     group = "Supabase"; hint = "https://xxxx.supabase.co" }
    @{ name = "NEXT_PUBLIC_SUPABASE_ANON_KEY"; group = "Supabase"; hint = "eyJhbGciOi... (anon public)" }
    @{ name = "SUPABASE_SERVICE_ROLE_KEY";    group = "Supabase"; hint = "eyJhbGciOi... (service_role / 漏洩注意)" }
    @{ name = "STRIPE_SECRET_KEY";            group = "Stripe";   hint = "sk_test_..." }
    @{ name = "STRIPE_WEBHOOK_SECRET";        group = "Stripe";   hint = "whsec_... (Stripeダッシュボード > Webhooks)" }
    @{ name = "STRIPE_PRICE_ID";              group = "Stripe";   hint = "price_... (定期購入で参照)" }
    @{ name = "NEXT_PUBLIC_BASE_URL";         group = "Base URL"; hint = "https://lot-lp.vercel.app または独自ドメイン" }
    @{ name = "RESEND_API_KEY";               group = "Email";    hint = "re_... (ステップメール用 / 未使用ならスキップ)" }
    @{ name = "RESEND_FROM_EMAIL";            group = "Email";    hint = "noreply@example.com (未使用ならスキップ)" }
    @{ name = "CRON_SECRET";                  group = "Cron";     hint = "ランダム文字列 (Vercel Cron保護用 / 未設定ならスキップ)" }
)

function Set-VercelEnv {
    param([string]$Name, [string]$Value, [string]$Env)

    # 1) 既存値を削除（無くてもエラーにしない）
    & vercel env rm $Name $Env --yes 2>$null | Out-Null

    # 2) 一時ファイルに改行なしで値を書く
    $tmp = New-TemporaryFile
    try {
        [System.IO.File]::WriteAllText($tmp.FullName, $Value)
        # 3) stdin リダイレクトで vercel env add に渡す
        & cmd /c "vercel env add $Name $Env < `"$($tmp.FullName)`""
        if ($LASTEXITCODE -ne 0) {
            throw "vercel env add $Name 失敗 (exit=$LASTEXITCODE)"
        }
    }
    finally {
        Remove-Item $tmp.FullName -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "=== Production 環境変数の更新を開始します ===" -ForegroundColor Cyan
Write-Host "値を入力 -> Enter で登録 / 空のまま Enter でスキップ" -ForegroundColor Yellow
Write-Host ""

$updated = @()
$skipped = @()
$failed  = @()
$lastGroup = ""

foreach ($v in $envVars) {
    if ($v.group -ne $lastGroup) {
        Write-Host ""
        Write-Host "--- [$($v.group)] ---" -ForegroundColor Magenta
        $lastGroup = $v.group
    }

    Write-Host ""
    Write-Host "$($v.name)" -ForegroundColor Green
    Write-Host "  形式: $($v.hint)" -ForegroundColor DarkGray
    $input = Read-Host "  値"

    if ([string]::IsNullOrWhiteSpace($input)) {
        Write-Host "  [SKIP]" -ForegroundColor DarkYellow
        $skipped += $v.name
        continue
    }

    try {
        Set-VercelEnv -Name $v.name -Value $input -Env $TargetEnv
        Write-Host "  [OK]" -ForegroundColor Green
        $updated += $v.name
    }
    catch {
        Write-Host "  [FAIL] $_" -ForegroundColor Red
        $failed += $v.name
    }
}

Write-Host ""
Write-Host "=== サマリ ===" -ForegroundColor Cyan
Write-Host "更新: $($updated.Count) 件" -ForegroundColor Green
$updated | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }
if ($skipped.Count -gt 0) {
    Write-Host "スキップ: $($skipped.Count) 件" -ForegroundColor DarkYellow
    $skipped | ForEach-Object { Write-Host "  - $_" -ForegroundColor DarkYellow }
}
if ($failed.Count -gt 0) {
    Write-Host "失敗: $($failed.Count) 件" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Red }
}

# .env.prod を再生成して、ローカルから現状を確認できるようにする
if ($updated.Count -gt 0) {
    Write-Host ""
    Write-Host "=== .env.prod を再取得 ===" -ForegroundColor Cyan
    & vercel env pull .env.prod --environment=production --yes
}

Write-Host ""
Write-Host "完了。次は本番デプロイを実行してください:" -ForegroundColor Cyan
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""
