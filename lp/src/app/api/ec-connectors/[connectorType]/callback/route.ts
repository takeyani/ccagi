import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nextEngineConnector } from "@/lib/ec-connectors/next-engine";
import { shopifyConnector } from "@/lib/ec-connectors/shopify";
import { baseConnector } from "@/lib/ec-connectors/base-ec";
import { storesConnector } from "@/lib/ec-connectors/stores";
import { colormeConnector } from "@/lib/ec-connectors/colorme";
import { yahooConnector } from "@/lib/ec-connectors/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// コネクタタイプ→環境変数プレフィックスのマッピング
const ENV_PREFIX: Record<string, string> = {
  next_engine: "NEXT_ENGINE",
  shopify: "SHOPIFY",
  base: "BASE",
  stores: "STORES",
  makeshop: "MAKESHOP",
  colorme: "COLORME",
  rakuten: "RAKUTEN",
  yahoo: "YAHOO",
};

// コネクタタイプ→表示名
const CONNECTOR_NAMES: Record<string, string> = {
  next_engine: "ネクストエンジン",
  shopify: "Shopify",
  base: "BASE",
  stores: "STORES.jp",
  makeshop: "MakeShop",
  colorme: "カラーミーショップ",
  rakuten: "楽天市場",
  yahoo: "Yahoo!ショッピング",
};

function getEnv(connectorType: string, key: string): string | undefined {
  const prefix = ENV_PREFIX[connectorType];
  if (!prefix) return undefined;
  return process.env[`${prefix}_${key}`];
}

/**
 * 汎用OAuth2コールバック
 * GET /api/ec-connectors/[connectorType]/callback
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ connectorType: string }> }
) {
  const { connectorType } = await params;
  const { searchParams } = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/ec-connectors/${connectorType}/callback`;

  const clientId = getEnv(connectorType, "CLIENT_ID");
  const clientSecret = getEnv(connectorType, "CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: `${connectorType} credentials not configured` },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  let credentials: Record<string, string> = { client_id: clientId, client_secret: clientSecret };
  let name = CONNECTOR_NAMES[connectorType] || connectorType;

  // コネクタ別のOAuth処理
  switch (connectorType) {
    case "next_engine": {
      const uid = searchParams.get("uid");
      const state = searchParams.get("state");
      if (!uid || !state) {
        return NextResponse.json({ error: "uid and state are required" }, { status: 400 });
      }
      const result = await nextEngineConnector.exchangeCode(clientId, clientSecret, uid, state);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token, refresh_token: result.refresh_token };
      if (result.company_name) name = `ネクストエンジン（${result.company_name}）`;
      break;
    }

    case "shopify": {
      const code = searchParams.get("code");
      const shop = searchParams.get("shop");
      if (!code || !shop) {
        return NextResponse.json({ error: "code and shop are required" }, { status: 400 });
      }
      const result = await shopifyConnector.exchangeCode(shop, clientId, clientSecret, code);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token, shop_domain: shop };
      name = `Shopify（${shop}）`;
      break;
    }

    case "base": {
      const code = searchParams.get("code");
      if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
      }
      const result = await baseConnector.exchangeCode(clientId, clientSecret, code, redirectUri);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token, refresh_token: result.refresh_token };
      break;
    }

    case "stores": {
      const code = searchParams.get("code");
      if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
      }
      const result = await storesConnector.exchangeCode(clientId, clientSecret, code, redirectUri);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token, refresh_token: result.refresh_token };
      break;
    }

    case "colorme": {
      const code = searchParams.get("code");
      if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
      }
      const result = await colormeConnector.exchangeCode(clientId, clientSecret, code, redirectUri);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token };
      break;
    }

    case "yahoo": {
      const code = searchParams.get("code");
      if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
      }
      const result = await yahooConnector.exchangeCode(clientId, clientSecret, code, redirectUri);
      if (!result) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 400 });
      }
      credentials = { ...credentials, access_token: result.access_token, refresh_token: result.refresh_token };
      break;
    }

    case "makeshop": {
      // MakeShopはAPIキー認証（OAuthなし）
      const shopId = getEnv(connectorType, "SHOP_ID");
      const apiKey = getEnv(connectorType, "API_KEY");
      if (!shopId || !apiKey) {
        return NextResponse.json({ error: "MakeShop shop_id and api_key are required in env" }, { status: 500 });
      }
      credentials = { shop_id: shopId, api_key: apiKey };
      break;
    }

    case "rakuten": {
      // 楽天RMSはサービスシークレット＋ライセンスキー認証
      const serviceSecret = getEnv(connectorType, "SERVICE_SECRET");
      const licenseKey = getEnv(connectorType, "LICENSE_KEY");
      if (!serviceSecret || !licenseKey) {
        return NextResponse.json({ error: "Rakuten credentials are required in env" }, { status: 500 });
      }
      credentials = { service_secret: serviceSecret, license_key: licenseKey };
      break;
    }

    default:
      return NextResponse.json({ error: `Unsupported connector: ${connectorType}` }, { status: 400 });
  }

  // コネクタ設定を保存/更新
  await supabase.from("ec_connectors").upsert(
    {
      connector_type: connectorType,
      name,
      credentials,
      is_active: true,
    },
    { onConflict: "connector_type" }
  );

  return NextResponse.redirect(
    `${baseUrl}/admin/ec-connectors?connected=${connectorType}`
  );
}
