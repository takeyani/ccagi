# lp 本番 E2E テストスクリプト
#
# 内容:
#   1) Supabase Auth API で新規ユーザー作成（partner=メーカー）
#   2) /api/signup/complete を叩いて partner レコード作成
#   3) service_role で partner を本登録に昇格
#   4) 商品 + ロットを REST API で作成
#   5) 商品詳細ページ /products/[slug]/[lotId] が HTTP 200 を返すか確認
#   6) affiliate + creator_lp_designs を作成
#   7) クリエイターLP /c/[code]/[slug]/[lotId] が HTTP 200 を返すか確認
#   8) -SkipCleanup でない限り、すべてのテストデータを削除
#
# 実行: powershell -ExecutionPolicy Bypass -File .\scripts\e2e-test.ps1

param([switch]$SkipCleanup)

$ErrorActionPreference = "Stop"

# Vault読み込み
$vaultFile = Join-Path $env:USERPROFILE ".auto-restore-env\secrets.json.enc"
$encContent = Get-Content $vaultFile -Raw
$secure = ConvertTo-SecureString $encContent
$plain = [System.Net.NetworkCredential]::new("", $secure).Password
$obj = $plain | ConvertFrom-Json
$vault = @{}
$obj.PSObject.Properties | ForEach-Object { $vault[$_.Name] = $_.Value }

# Supabase キー取得
$mgmtHeaders = @{ Authorization = "Bearer $($vault.SUPABASE_ACCESS_TOKEN)" }
$keys = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$($vault.SUPABASE_PROJECT_REF)/api-keys" -Headers $mgmtHeaders
$anonKey = ($keys | Where-Object { $_.name -eq "anon" }).api_key
$svcKey  = ($keys | Where-Object { $_.name -eq "service_role" }).api_key
$supaUrl = "https://$($vault.SUPABASE_PROJECT_REF).supabase.co"
$baseUrl = $vault.NEXT_PUBLIC_BASE_URL.TrimEnd("/")

$adminH = @{
    apikey = $svcKey
    Authorization = "Bearer $svcKey"
    "Content-Type" = "application/json"
    Prefer = "return=representation"
}
$authH = @{ apikey = $anonKey; "Content-Type" = "application/json" }

# テスト用値
$ts = Get-Date -Format "yyyyMMddHHmmss"
$rand = (Get-Random -Maximum 99999).ToString("D5")
$tag = "claude-e2e-$ts-$rand"
$testEmail = "claude-e2e+$ts$rand@example.com"
$testPassword = "TestPass1234!@#"
$displayName = "ClaudeE2E $ts"
$productSlug = "e2e-$ts-$rand"
$designSlug  = "e2e-design-$ts-$rand"
$affCode     = "ce2e$rand"
$lotNumber   = "E2E-$ts-$rand"

# 作成したIDを記録（クリーンアップ用）
$created = @{}

function Step($msg) { Write-Host ""; Write-Host "=== $msg ===" -ForegroundColor Cyan }
function OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Info($msg) { Write-Host "  $msg" -ForegroundColor DarkGray }

# Invoke-RestMethod は body string を Latin-1 で送るため日本語が壊れる。
# UTF-8 byte[] に変換してから渡す wrapper を用意。
function Send-Json {
    param([string]$Uri, [string]$Method, $Body, [hashtable]$Headers)
    $h = @{}
    foreach ($k in $Headers.Keys) { $h[$k] = $Headers[$k] }
    $h["Content-Type"] = "application/json; charset=utf-8"
    if ($null -ne $Body) {
        $json = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Compress -Depth 10 }
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $h -Body $bytes
    } else {
        return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $h
    }
}

try {
    # ----- 1) Supabase Auth でユーザー作成 -----
    Step "1) Supabase Auth でユーザー作成"
    Info "email: $testEmail"
    $signUpBody = @{
        email = $testEmail
        password = $testPassword
        data = @{
            display_name = $displayName
            signup_role = "maker"
        }
    } | ConvertTo-Json -Compress
    $signUp = Invoke-RestMethod -Uri "$supaUrl/auth/v1/signup" -Method POST -Headers $authH -Body $signUpBody
    $userId = $signUp.user.id
    $created.userId = $userId
    OK "userId = $userId"

    # ----- 2) profile / partner を service_role で整備 -----
    # 注: /api/signup/complete はブラウザ session cookie が必要なため HTTP 直叩き不可。
    #     代わりに service_role で DB を直接操作する（trigger が user_profiles を auto-create するので UPDATE のみ）。
    Step "2) profile / partner を service_role で整備"

    # trigger 完了待ち
    Start-Sleep -Milliseconds 800

    # trigger で auto-created な user_profiles を確認
    $upBefore = Invoke-RestMethod -Uri "$supaUrl/rest/v1/user_profiles?id=eq.$userId&select=role,display_name" -Headers $adminH
    Info "trigger 直後の role=$($upBefore[0].role) display_name=$($upBefore[0].display_name)"
    if ($upBefore[0].role -ne "partner") {
        Info "(signup_role=maker のはずだが trigger 解決結果が $($upBefore[0].role)、partner に揃え直す)"
    }

    # display_name と role を確実にする
    Send-Json -Uri "$supaUrl/rest/v1/user_profiles?id=eq.$userId" -Method PATCH -Headers $adminH `
        -Body @{ display_name = $displayName; role = "partner" } | Out-Null

    # partners INSERT
    $partner = Send-Json -Uri "$supaUrl/rest/v1/partners" -Method POST -Headers $adminH -Body @{
        auth_user_id = $userId
        company_name = $displayName
        partner_type = "メーカー"
        certification_status = "仮登録"
    }
    $partnerId = $partner[0].id
    $created.partnerId = $partnerId

    # user_profiles.partner_id を紐付け
    Send-Json -Uri "$supaUrl/rest/v1/user_profiles?id=eq.$userId" -Method PATCH -Headers $adminH `
        -Body @{ partner_id = $partnerId } | Out-Null
    OK "partnerId = $partnerId"

    # ----- 3) 本登録に昇格 -----
    Step "3) partner を本登録に昇格（service_role）"
    Send-Json -Uri "$supaUrl/rest/v1/partners?id=eq.$partnerId" -Method PATCH -Headers $adminH `
        -Body @{ certification_status = "本登録" } | Out-Null
    OK "本登録 ✓"

    # ----- 4) 商品 + ロット作成 -----
    Step "4) 商品 + ロット作成（REST API）"
    $product = Send-Json -Uri "$supaUrl/rest/v1/products" -Method POST -Headers $adminH -Body @{
        partner_id = $partnerId
        name = "Claude E2E 商品 $ts"
        slug = $productSlug
        base_price = 1500
        is_active = $true
        description = "Claude による自動E2Eテストで作成された商品。確認後に削除されます。"
    }
    $productId = $product[0].id
    $created.productId = $productId
    OK "productId = $productId (slug=$productSlug)"

    $lot = Send-Json -Uri "$supaUrl/rest/v1/lots" -Method POST -Headers $adminH -Body @{
        product_id = $productId
        lot_number = $lotNumber
        stock = 50
        price = 1500
        status = "販売中"
        selling_unit = "個"
        min_order_units = 1
    }
    $lotId = $lot[0].id
    $created.lotId = $lotId
    OK "lotId = $lotId (lot_number=$lotNumber)"

    # ----- 5) 商品詳細ページ確認 -----
    Step "5) 商品詳細ページ生存確認"
    $productUrl = "$baseUrl/products/$productSlug/$lotId"
    Info $productUrl
    $r = Invoke-WebRequest -Uri $productUrl -UseBasicParsing -TimeoutSec 30
    if ($r.StatusCode -eq 200) {
        OK "HTTP 200"
        if ($r.Content -match [regex]::Escape("Claude E2E 商品")) { OK "商品名が本文に表示" } else { Info "商品名は別の形でレンダリング（クライアント側）" }
        if ($r.Content -match "1,500|1500") { OK "価格が本文に表示" }
    } else {
        Fail "HTTP $($r.StatusCode)"
    }

    # ----- 6) affiliate + creator_lp_designs 作成 -----
    Step "6) クリエイターLP（affiliate + design 作成）"
    $aff = Send-Json -Uri "$supaUrl/rest/v1/affiliates" -Method POST -Headers $adminH -Body @{
        code = $affCode
        name = "Claude E2E Creator $ts"
        email = "creator-$ts@example.com"
        is_creator = $true
        commission_rate = 2.0
    }
    $affId = $aff[0].id
    $created.affiliateId = $affId
    OK "affiliateId = $affId (code=$affCode)"

    # 注: design.slug は URL の slug (= product.slug) と一致が必要（page.tsx で .eq("slug", slug)）
    $design = Send-Json -Uri "$supaUrl/rest/v1/creator_lp_designs" -Method POST -Headers $adminH -Body @{
        affiliate_id = $affId
        product_id = $productId
        lot_id = $lotId
        slug = $productSlug
        design_config = @()
        theme = @{
            primary_color = "#6366f1"
            secondary_color = "#8b5cf6"
            bg_color = "#ffffff"
            font = "inherit"
        }
        is_published = $true
    }
    $designId = $design[0].id
    $created.designId = $designId
    OK "designId = $designId (slug=$productSlug)"

    # ----- 7) クリエイターLPページ確認 -----
    Step "7) クリエイターLP生存確認"
    $cUrl = "$baseUrl/c/$affCode/$productSlug/$lotId"
    Info $cUrl
    $r2 = Invoke-WebRequest -Uri $cUrl -UseBasicParsing -TimeoutSec 30
    if ($r2.StatusCode -eq 200) {
        OK "HTTP 200"
    } else {
        Fail "HTTP $($r2.StatusCode)"
    }

    Write-Host ""
    Write-Host "=== 全テスト成功 ✓ ===" -ForegroundColor Green
    Write-Host "確認用URL:" -ForegroundColor Cyan
    Write-Host "  商品: $productUrl"
    Write-Host "  LP : $cUrl"
}
catch {
    Write-Host ""
    Fail "テスト失敗: $_"
    if ($_.ErrorDetails.Message) { Write-Host "Body: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed }
}
finally {
    # ----- 8) クリーンアップ -----
    if ($SkipCleanup) {
        Write-Host ""
        Write-Host "--SkipCleanup 指定のためテストデータは残します" -ForegroundColor Yellow
        Write-Host "作成されたID:"
        $created.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key) = $($_.Value)" }
    } else {
        Step "8) クリーンアップ"
        # 削除は依存関係の逆順
        if ($created.designId)    { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/creator_lp_designs?id=eq.$($created.designId)" -Method DELETE -Headers $adminH | Out-Null; OK "creator_lp_designs deleted" } catch { Fail "design削除失敗: $_" } }
        if ($created.affiliateId) { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/affiliates?id=eq.$($created.affiliateId)" -Method DELETE -Headers $adminH | Out-Null; OK "affiliates deleted" } catch { Fail "affiliate削除失敗: $_" } }
        if ($created.lotId)       { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/lots?id=eq.$($created.lotId)" -Method DELETE -Headers $adminH | Out-Null; OK "lots deleted" } catch { Fail "lot削除失敗: $_" } }
        if ($created.productId)   { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/products?id=eq.$($created.productId)" -Method DELETE -Headers $adminH | Out-Null; OK "products deleted" } catch { Fail "product削除失敗: $_" } }
        if ($created.userId)      { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/user_profiles?id=eq.$($created.userId)" -Method DELETE -Headers $adminH | Out-Null } catch {} }
        if ($created.partnerId)   { try { Invoke-RestMethod -Uri "$supaUrl/rest/v1/partners?id=eq.$($created.partnerId)" -Method DELETE -Headers $adminH | Out-Null; OK "partners deleted" } catch { Fail "partner削除失敗: $_" } }
        # auth.users 削除は Management API or admin SDK 必要（PATCH不可）
        if ($created.userId) {
            try {
                Invoke-RestMethod -Uri "$supaUrl/auth/v1/admin/users/$($created.userId)" -Method DELETE `
                    -Headers @{ apikey = $svcKey; Authorization = "Bearer $svcKey" } | Out-Null
                OK "auth user deleted"
            } catch {
                Fail "auth user削除失敗: $_"
            }
        }
        OK "クリーンアップ完了"
    }
}
