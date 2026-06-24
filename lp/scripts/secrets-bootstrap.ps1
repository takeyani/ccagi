# 自動同期トークンの保管スクリプト（1回限り実行）
#
# 役割:
#   Vercel/Supabase/Stripe の API トークン等を Windows DPAPI で暗号化し、
#   $env:USERPROFILE\.auto-restore-env\secrets.json.enc に保管する。
#   この保管庫を auto-restore-env.ps1 が復号して利用する。
#
# セキュリティ:
#   - DPAPI（ユーザー固有鍵）で暗号化するため、同じ Windows アカウント以外では復号不可
#   - グローバル CLAUDE.md B-003（鍵は Credential Manager / 同等の OS 機構で保管）準拠
#   - リポジトリには一切値を残さない（保管先はホームディレクトリ配下）
#
# 実行:
#   powershell -ExecutionPolicy Bypass -File .\scripts\secrets-bootstrap.ps1

$ErrorActionPreference = "Stop"

$VaultDir  = Join-Path $env:USERPROFILE ".auto-restore-env"
$VaultFile = Join-Path $VaultDir "secrets.json.enc"

if (-not (Test-Path $VaultDir)) {
    New-Item -ItemType Directory -Path $VaultDir | Out-Null
}

Write-Host ""
Write-Host "=== 自動同期トークン保管 ===" -ForegroundColor Cyan
Write-Host "保管先: $VaultFile" -ForegroundColor DarkGray
Write-Host "暗号化: Windows DPAPI（このWindowsアカウントでのみ復号可）" -ForegroundColor DarkGray
Write-Host ""

# 既存があれば読み込み（差分更新用）
$existing = @{}
if (Test-Path $VaultFile) {
    Write-Host "[既存の保管庫を検出] 上書きしたい項目だけ入力、空Enterで既存値を維持" -ForegroundColor Yellow
    try {
        $encContent = Get-Content $VaultFile -Raw
        $secure = ConvertTo-SecureString $encContent
        $plain = [System.Net.NetworkCredential]::new("", $secure).Password
        $obj = $plain | ConvertFrom-Json
        $existing = @{}
        $obj.PSObject.Properties | ForEach-Object { $existing[$_.Name] = $_.Value }
    } catch {
        Write-Host "[警告] 既存ファイルの復号に失敗。新規作成します: $_" -ForegroundColor DarkYellow
        $existing = @{}
    }
    Write-Host ""
}

# 保管したいエントリ定義
# required: true なら未入力時に警告
$entries = @(
    # --- Vercel ---
    @{ key = "VERCEL_TOKEN";           required = $true;  hint = "Vercel > Account Settings > Tokens で発行"; secret = $true }
    @{ key = "VERCEL_PROJECT_ID";      required = $true;  hint = "既知の値: prj_5b1f3NJUofiBU47HIHoFfWC3Zw3g";    secret = $false; default = "prj_5b1f3NJUofiBU47HIHoFfWC3Zw3g" }
    @{ key = "VERCEL_TEAM_ID";         required = $true;  hint = "既知の値: team_ybyanaEo9VKIZQsgheKqgJB6";        secret = $false; default = "team_ybyanaEo9VKIZQsgheKqgJB6" }

    # --- Supabase ---
    @{ key = "SUPABASE_ACCESS_TOKEN";  required = $true;  hint = "https://supabase.com/dashboard/account/tokens"; secret = $true }
    @{ key = "SUPABASE_PROJECT_REF";   required = $true;  hint = "プロジェクトURLのサブドメイン（xxx.supabase.co の xxx）"; secret = $false }

    # --- Stripe ---
    @{ key = "STRIPE_API_KEY";         required = $true;  hint = "sk_test_... (Stripe > Developers > API keys)";  secret = $true }
    @{ key = "STRIPE_WEBHOOK_SECRET";  required = $false; hint = "whsec_... (未設定なら空Enter）";                    secret = $true }

    # --- アプリ固有 ---
    @{ key = "NEXT_PUBLIC_BASE_URL";   required = $true;  hint = "https://lot-lp.vercel.app または独自ドメイン";  secret = $false; default = "https://lot-lp.vercel.app" }
    @{ key = "RESEND_API_KEY";         required = $false; hint = "re_... (任意)";                                  secret = $true }
    @{ key = "RESEND_FROM_EMAIL";      required = $false; hint = "noreply@example.com (任意)";                     secret = $false }
    @{ key = "CRON_SECRET";            required = $false; hint = "ランダム文字列 / 空でランダム自動生成";          secret = $true; autogen = $true }
)

$result = @{}
$lastGroup = ""

foreach ($e in $entries) {
    $current = $existing[$e.key]
    $hasCurrent = -not [string]::IsNullOrEmpty($current)

    # 入力プロンプト
    Write-Host ""
    Write-Host "$($e.key)" -ForegroundColor Green
    Write-Host "  $($e.hint)" -ForegroundColor DarkGray
    if ($hasCurrent) {
        $masked = if ($e.secret) { "********" } else { $current }
        Write-Host "  現在値: $masked" -ForegroundColor DarkGray
    } elseif ($e.default) {
        Write-Host "  既定値: $($e.default)" -ForegroundColor DarkGray
    }

    if ($e.secret) {
        $secure = Read-Host "  値" -AsSecureString
        $input = [System.Net.NetworkCredential]::new("", $secure).Password
    } else {
        $input = Read-Host "  値"
    }

    if ([string]::IsNullOrWhiteSpace($input)) {
        if ($hasCurrent) {
            $result[$e.key] = $current
            Write-Host "  [維持]" -ForegroundColor DarkYellow
        } elseif ($e.default) {
            $result[$e.key] = $e.default
            Write-Host "  [既定値を採用]" -ForegroundColor DarkYellow
        } elseif ($e.autogen) {
            $bytes = New-Object byte[] 32
            [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
            $generated = ([Convert]::ToBase64String($bytes)) -replace '[^a-zA-Z0-9]', ''
            $result[$e.key] = $generated.Substring(0, [Math]::Min(40, $generated.Length))
            Write-Host "  [ランダム生成]" -ForegroundColor DarkYellow
        } elseif ($e.required) {
            Write-Host "  [警告] 必須項目が未入力。スキップします（実行時に失敗する可能性）" -ForegroundColor Red
        } else {
            Write-Host "  [スキップ]" -ForegroundColor DarkYellow
        }
    } else {
        $result[$e.key] = $input
        Write-Host "  [更新]" -ForegroundColor Green
    }
}

# JSON化して DPAPI で暗号化保管
$json = ($result | ConvertTo-Json -Compress)
$secureJson = ConvertTo-SecureString $json -AsPlainText -Force
$encrypted = ConvertFrom-SecureString $secureJson

Set-Content -Path $VaultFile -Value $encrypted -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "=== 保管完了 ===" -ForegroundColor Cyan
Write-Host "保管先: $VaultFile" -ForegroundColor Green
Write-Host "登録キー数: $($result.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\auto-restore-env.ps1" -ForegroundColor White
Write-Host ""
