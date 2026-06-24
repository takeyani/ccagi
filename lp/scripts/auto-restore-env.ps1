# 本番環境変数 全自動同期スクリプト
#
# 役割:
#   secrets-bootstrap.ps1 で保管した3トークンを使い、
#     1) Supabase Management API から URL/anon/service_role を取得
#     2) Stripe API から price_id を取得
#     3) Vercel REST API で本番環境変数を upsert（既存削除→新規）
#     4) Vercel REST API で本番再デプロイを起動
#     5) デプロイ完了まで polling
#     6) /signup の HTTP 200 確認
#   までを完全自動で実施する。
#
# 前提:
#   先に scripts\secrets-bootstrap.ps1 を1回実行して保管庫を作成済みであること。
#
# 実行:
#   powershell -ExecutionPolicy Bypass -File .\scripts\auto-restore-env.ps1
#
# オプション:
#   -DryRun       実際の更新はせず、差分のみ表示
#   -SkipDeploy   env upsert のみで再デプロイしない
#   -SkipVerify   /signup の生存確認をスキップ

param(
    [switch]$DryRun,
    [switch]$SkipDeploy,
    [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

# ----- セットアップ -----

$VaultFile = Join-Path $env:USERPROFILE ".auto-restore-env\secrets.json.enc"
$LogDir    = Join-Path $PSScriptRoot "..\.logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir ("auto-restore-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $stamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN"  { "Yellow" }
        "OK"    { "Green" }
        "STEP"  { "Cyan" }
        default { "White" }
    }
    $line = "[$stamp][$Level] $Message"
    Write-Host $line -ForegroundColor $color
    Add-Content -Path $LogFile -Value $line
}

function Mask {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return "(empty)" }
    if ($Value.Length -le 12) { return "***" }
    return $Value.Substring(0, 4) + "..." + $Value.Substring($Value.Length - 4)
}

# ----- Vault 復号 -----

if (-not (Test-Path $VaultFile)) {
    Write-Log "保管庫が見つかりません: $VaultFile" "ERROR"
    Write-Log "先に scripts\secrets-bootstrap.ps1 を実行してください" "ERROR"
    exit 1
}

try {
    $encContent = Get-Content $VaultFile -Raw
    $secure = ConvertTo-SecureString $encContent
    $plain = [System.Net.NetworkCredential]::new("", $secure).Password
    $obj = $plain | ConvertFrom-Json
    $vault = @{}
    $obj.PSObject.Properties | ForEach-Object { $vault[$_.Name] = $_.Value }
} catch {
    Write-Log "保管庫の復号に失敗: $_" "ERROR"
    exit 1
}

Write-Log "保管庫を読み込みました ($($vault.Count) エントリ)" "OK"

# 必須キーチェック
$required = @("VERCEL_TOKEN", "VERCEL_PROJECT_ID", "SUPABASE_ACCESS_TOKEN", "SUPABASE_PROJECT_REF", "STRIPE_API_KEY", "NEXT_PUBLIC_BASE_URL")
foreach ($k in $required) {
    if ([string]::IsNullOrWhiteSpace($vault[$k])) {
        Write-Log "必須キー欠落: $k" "ERROR"
        exit 1
    }
}

# ----- 1) Supabase から値取得 -----

Write-Log "Supabase Management API から認証情報取得中..." "STEP"

try {
    $supaHeaders = @{ Authorization = "Bearer $($vault.SUPABASE_ACCESS_TOKEN)" }
    $supaRef = $vault.SUPABASE_PROJECT_REF
    $supaUrl = "https://$supaRef.supabase.co"

    $keysResp = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$supaRef/api-keys" -Headers $supaHeaders -Method GET
    $anon = ($keysResp | Where-Object { $_.name -eq "anon" }).api_key
    $svcRole = ($keysResp | Where-Object { $_.name -eq "service_role" }).api_key

    if (-not $anon -or -not $svcRole) { throw "anon または service_role が API レスポンスに見つかりません" }

    Write-Log "  URL  = $supaUrl" "OK"
    Write-Log "  anon = $(Mask $anon)" "OK"
    Write-Log "  service_role = $(Mask $svcRole)" "OK"
} catch {
    Write-Log "Supabase API 失敗: $_" "ERROR"
    exit 1
}

# ----- 2) Stripe から値取得（任意） -----

Write-Log "Stripe API から price_id 取得中..." "STEP"
$stripePriceId = $null
try {
    $stripeHeaders = @{ Authorization = "Bearer $($vault.STRIPE_API_KEY)" }
    $prices = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices?active=true&limit=1" -Headers $stripeHeaders -Method GET
    if ($prices.data.Count -gt 0) {
        $stripePriceId = $prices.data[0].id
        Write-Log "  price_id = $stripePriceId" "OK"
    } else {
        Write-Log "  active price が無いためスキップ" "WARN"
    }
} catch {
    Write-Log "Stripe API 失敗（スキップ）: $_" "WARN"
}

# ----- 3) 期待する環境変数のリスト構築 -----

# type: 'encrypted' (通常) または 'sensitive' (取得不可・暗号化保存)
$desired = @(
    @{ key = "NEXT_PUBLIC_SUPABASE_URL";       value = $supaUrl;                       type = "encrypted" }
    @{ key = "NEXT_PUBLIC_SUPABASE_ANON_KEY";  value = $anon;                          type = "encrypted" }
    @{ key = "SUPABASE_SERVICE_ROLE_KEY";      value = $svcRole;                       type = "sensitive" }
    @{ key = "STRIPE_SECRET_KEY";              value = $vault.STRIPE_API_KEY;          type = "sensitive" }
    @{ key = "NEXT_PUBLIC_BASE_URL";           value = $vault.NEXT_PUBLIC_BASE_URL;    type = "encrypted" }
)
if ($stripePriceId) {
    $desired += @{ key = "STRIPE_PRICE_ID"; value = $stripePriceId; type = "encrypted" }
}
if ($vault.STRIPE_WEBHOOK_SECRET) {
    $desired += @{ key = "STRIPE_WEBHOOK_SECRET"; value = $vault.STRIPE_WEBHOOK_SECRET; type = "sensitive" }
}
if ($vault.RESEND_API_KEY) {
    $desired += @{ key = "RESEND_API_KEY"; value = $vault.RESEND_API_KEY; type = "sensitive" }
}
if ($vault.RESEND_FROM_EMAIL) {
    $desired += @{ key = "RESEND_FROM_EMAIL"; value = $vault.RESEND_FROM_EMAIL; type = "encrypted" }
}
if ($vault.CRON_SECRET) {
    $desired += @{ key = "CRON_SECRET"; value = $vault.CRON_SECRET; type = "sensitive" }
}

Write-Log "更新対象: $($desired.Count) 変数" "STEP"

# ----- 4) Vercel API ヘルパ -----

function Invoke-VercelAPI {
    param([string]$Method, [string]$Path, $Body = $null)
    $headers = @{ Authorization = "Bearer $($vault.VERCEL_TOKEN)" }
    $sep = if ($Path -match '\?') { '&' } else { '?' }
    $uri = "https://api.vercel.com$Path"
    if ($vault.VERCEL_TEAM_ID) { $uri += "${sep}teamId=$($vault.VERCEL_TEAM_ID)" }

    if ($Body) {
        $json = $Body | ConvertTo-Json -Depth 10 -Compress
        return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $json -ContentType 'application/json'
    } else {
        return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
    }
}

# ----- 5) Vercel 現状取得 -----

Write-Log "Vercel 現在の本番環境変数を取得中..." "STEP"
$projectId = $vault.VERCEL_PROJECT_ID

try {
    $envList = Invoke-VercelAPI -Method GET -Path "/v9/projects/$projectId/env"
    $prodEnvs = $envList.envs | Where-Object { $_.target -contains "production" }
    Write-Log "  既存 production 変数: $($prodEnvs.Count) 個" "OK"
} catch {
    Write-Log "Vercel 環境変数の取得失敗: $_" "ERROR"
    exit 1
}

# ----- 6) 差分計算 -----

$toUpdate = @()
foreach ($d in $desired) {
    $existing = $prodEnvs | Where-Object { $_.key -eq $d.key }
    # sensitive な変数は現値が API で取れないので、常に更新対象
    # 非 sensitive な変数は値が一致していたらスキップ
    $needs = $true
    if ($existing -and $d.type -ne "sensitive") {
        # 既存値の末尾改行混入も含めて差分検出
        if ($existing.value -eq $d.value) { $needs = $false }
    }
    if ($needs) {
        $toUpdate += @{ desired = $d; existing = $existing }
    }
}

Write-Log "更新必要: $($toUpdate.Count) 変数 / 変更なし: $($desired.Count - $toUpdate.Count) 変数" "STEP"

foreach ($u in $toUpdate) {
    $action = if ($u.existing) { "REPLACE" } else { "CREATE " }
    Write-Log "  $action $($u.desired.key) = $(Mask $u.desired.value) [$($u.desired.type)]" "INFO"
}

if ($DryRun) {
    Write-Log "--DryRun 指定のため終了します" "WARN"
    exit 0
}

# ----- 7) 更新実行 -----

Write-Log "Vercel 本番環境変数を更新中..." "STEP"
$successCount = 0
$failCount = 0

foreach ($u in $toUpdate) {
    $key = $u.desired.key
    try {
        if ($u.existing) {
            Invoke-VercelAPI -Method DELETE -Path "/v9/projects/$projectId/env/$($u.existing.id)" | Out-Null
        }
        $body = @{
            key = $key
            value = $u.desired.value
            type = $u.desired.type
            target = @("production")
        }
        Invoke-VercelAPI -Method POST -Path "/v10/projects/$projectId/env" -Body $body | Out-Null
        Write-Log "  [OK] $key" "OK"
        $successCount++
    } catch {
        Write-Log "  [FAIL] $key — $_" "ERROR"
        $failCount++
    }
}

Write-Log "更新結果: 成功 $successCount / 失敗 $failCount" "STEP"
if ($failCount -gt 0) {
    Write-Log "失敗があったため再デプロイをスキップします" "ERROR"
    exit 1
}

# ----- 8) 再デプロイ -----

if ($SkipDeploy) {
    Write-Log "--SkipDeploy 指定のため再デプロイをスキップ" "WARN"
} else {
    Write-Log "本番再デプロイを起動中..." "STEP"
    try {
        # Vercel project の Git link から gitSource を組み立てる
        # （/v6/deployments の gitSource は CLI 由来だと null になるため使えない）
        $proj = Invoke-VercelAPI -Method GET -Path "/v9/projects/$projectId"
        if (-not $proj.link -or -not $proj.link.repoId) {
            throw "Vercel project に Git 連携が無いため API redeploy 不可。Vercel ダッシュボード Settings > Git で GitHub を Connect してください"
        }

        $deployBody = @{
            name = $proj.name
            project = $projectId
            target = "production"
            gitSource = @{
                type = $proj.link.type
                repoId = $proj.link.repoId
                ref = $proj.link.productionBranch
            }
        }

        $newDep = Invoke-VercelAPI -Method POST -Path "/v13/deployments?forceNew=1" -Body $deployBody
        Write-Log "  デプロイ起動: id=$($newDep.id) url=https://$($newDep.url)" "OK"

        # ポーリング
        Write-Log "デプロイ完了を待機中..." "STEP"
        $deadline = (Get-Date).AddMinutes(10)
        $finalState = $null
        while ((Get-Date) -lt $deadline) {
            Start-Sleep -Seconds 5
            $status = Invoke-VercelAPI -Method GET -Path "/v13/deployments/$($newDep.id)"
            Write-Host "." -NoNewline
            if ($status.readyState -eq "READY") { $finalState = "READY"; break }
            if ($status.readyState -in @("ERROR", "CANCELED")) { $finalState = $status.readyState; break }
        }
        Write-Host ""

        if ($finalState -eq "READY") {
            Write-Log "デプロイ完了 ✓" "OK"
        } elseif ($finalState) {
            Write-Log "デプロイ異常終了: $finalState" "ERROR"
            exit 1
        } else {
            Write-Log "デプロイがタイムアウトしました (10分)" "ERROR"
            exit 1
        }
    } catch {
        Write-Log "再デプロイ失敗: $_" "ERROR"
        exit 1
    }
}

# ----- 9) 動作確認 -----

if ($SkipVerify) {
    Write-Log "--SkipVerify 指定のため動作確認をスキップ" "WARN"
} else {
    Write-Log "/signup の生存確認中..." "STEP"
    $verifyUrl = ($vault.NEXT_PUBLIC_BASE_URL.TrimEnd('/')) + "/signup"
    try {
        $r = Invoke-WebRequest -Uri $verifyUrl -UseBasicParsing -TimeoutSec 30
        if ($r.StatusCode -eq 200) {
            Write-Log "  $verifyUrl => HTTP 200 ✓" "OK"
            if ($r.Content -match "新規登録") {
                Write-Log "  ページ本文に「新規登録」を確認 ✓" "OK"
            } else {
                Write-Log "  ページ本文に想定文言が見当たりません（要目視確認）" "WARN"
            }
        } else {
            Write-Log "  $verifyUrl => HTTP $($r.StatusCode)" "WARN"
        }
    } catch {
        Write-Log "  生存確認失敗: $_" "WARN"
    }
}

# ----- 完了 -----

Write-Log "" "INFO"
Write-Log "=== 全自動同期 完了 ===" "OK"
Write-Log "ログ: $LogFile" "INFO"
Write-Log "次の手動確認: $($vault.NEXT_PUBLIC_BASE_URL)/signup でテストアカウント作成" "INFO"
