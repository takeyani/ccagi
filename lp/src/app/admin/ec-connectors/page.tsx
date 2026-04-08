"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type Connector = {
  id: string;
  connector_type: string;
  name: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_interval_minutes: number;
  created_at: string;
};

const CONNECTOR_INFO: Record<string, { label: string; description: string; icon: string }> = {
  next_engine: {
    label: "ネクストエンジン",
    description: "EC一元管理ツール。楽天・Amazon・Yahoo等の受注データを自動連携",
    icon: "🔄",
  },
  shopify: {
    label: "Shopify",
    description: "Shopifyストアの受注データを自動連携",
    icon: "🛍️",
  },
  base: {
    label: "BASE",
    description: "BASEの受注データを自動連携",
    icon: "🏪",
  },
  stores: {
    label: "STORES.jp",
    description: "STORESの受注データを自動連携",
    icon: "🏬",
  },
  makeshop: {
    label: "MakeShop",
    description: "MakeShopの受注データを自動連携",
    icon: "🛒",
  },
  colorme: {
    label: "カラーミーショップ",
    description: "カラーミーショップの受注データを自動連携",
    icon: "🎨",
  },
  rakuten: {
    label: "楽天市場（直連携）",
    description: "楽天RMS APIとの直接連携",
    icon: "🏯",
  },
  yahoo: {
    label: "Yahoo!ショッピング",
    description: "Yahoo!ストアクリエイターProとの直接連携",
    icon: "📦",
  },
};

export default function EcConnectorsPage() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");

  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ec-connectors")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { setConnectors(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSync = async (connectorType: string) => {
    setSyncing(connectorType);
    try {
      const res = await fetch(`/api/ec-connectors/${connectorType}/sync`, { method: "POST" });
      const result = await res.json();
      alert(
        `同期完了\n取得件数: ${result.orders_fetched}\n登録件数: ${result.events_created}${result.errors?.length ? `\nエラー: ${result.errors.length}件` : ""}`
      );
    } catch {
      alert("同期に失敗しました");
    }
    setSyncing(null);
  };

  const handleConnect = (connectorType: string) => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/ec-connectors/${connectorType}/callback`;

    // OAuth認証フローのあるコネクタ
    const oauthConnectors: Record<string, { envKey: string; authUrl: (clientId: string, redirect: string) => string }> = {
      next_engine: {
        envKey: "NEXT_PUBLIC_NEXT_ENGINE_CLIENT_ID",
        authUrl: (clientId, redirect) =>
          `https://base.next-engine.org/users/sign_in/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}`,
      },
      shopify: {
        envKey: "NEXT_PUBLIC_SHOPIFY_CLIENT_ID",
        authUrl: (clientId, redirect) => {
          const shop = prompt("Shopifyストアのドメインを入力してください（例: my-store.myshopify.com）");
          if (!shop) return "";
          return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=read_orders&redirect_uri=${encodeURIComponent(redirect)}`;
        },
      },
      base: {
        envKey: "NEXT_PUBLIC_BASE_CLIENT_ID",
        authUrl: (clientId, redirect) =>
          `https://api.thebase.in/1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=read_orders`,
      },
      stores: {
        envKey: "NEXT_PUBLIC_STORES_CLIENT_ID",
        authUrl: (clientId, redirect) =>
          `https://api.stores.jp/v1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=read_orders`,
      },
      colorme: {
        envKey: "NEXT_PUBLIC_COLORME_CLIENT_ID",
        authUrl: (clientId, redirect) =>
          `https://api.shop-pro.jp/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=read_sales`,
      },
      yahoo: {
        envKey: "NEXT_PUBLIC_YAHOO_CLIENT_ID",
        authUrl: (clientId, redirect) =>
          `https://auth.login.yahoo.co.jp/yconnect/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=openid`,
      },
    };

    // APIキー認証のコネクタ（OAuthなし）
    const apiKeyConnectors = ["makeshop", "rakuten"];

    if (apiKeyConnectors.includes(connectorType)) {
      // APIキー認証はサーバー側の環境変数で直接設定
      fetch(redirectUri)
        .then((res) => {
          if (res.redirected) {
            window.location.href = res.url;
          } else {
            return res.json().then((data) => {
              alert(data.error || "接続に失敗しました。環境変数を確認してください。");
            });
          }
        })
        .catch(() => alert("接続に失敗しました"));
      return;
    }

    const oauth = oauthConnectors[connectorType];
    if (!oauth) {
      alert(`${CONNECTOR_INFO[connectorType]?.label || connectorType} のコネクタは準備中です`);
      return;
    }

    const envValue = process.env[oauth.envKey];
    if (!envValue) {
      alert(`${oauth.envKey} が設定されていません`);
      return;
    }

    const authUrl = oauth.authUrl(envValue, redirectUri);
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  const activeConnectors = connectors.filter((c) => c.is_active);
  const availableTypes = Object.keys(CONNECTOR_INFO).filter(
    (type) => !connectors.find((c) => c.connector_type === type)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">EC連携コネクタ</h1>

      {connected && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <p className="text-green-800 font-medium">
            {CONNECTOR_INFO[connected]?.label || connected} の連携が完了しました
          </p>
        </div>
      )}

      {/* 接続済みコネクタ */}
      <h2 className="text-lg font-bold mb-3">接続済み</h2>
      {activeConnectors.length > 0 ? (
        <div className="grid gap-4 mb-8">
          {activeConnectors.map((connector) => {
            const info = CONNECTOR_INFO[connector.connector_type];
            return (
              <div key={connector.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info?.icon || "🔌"}</span>
                    <h3 className="font-bold text-lg">{connector.name}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">接続中</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    最終同期: {connector.last_synced_at ? new Date(connector.last_synced_at).toLocaleString("ja-JP") : "未同期"}
                    {" | "}同期間隔: {connector.sync_interval_minutes}分
                  </p>
                </div>
                <button
                  onClick={() => handleSync(connector.connector_type)}
                  disabled={syncing === connector.connector_type}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {syncing === connector.connector_type ? "同期中..." : "今すぐ同期"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">接続済みのコネクタはありません</p>
      )}

      {/* 利用可能なコネクタ */}
      <h2 className="text-lg font-bold mb-3">利用可能なコネクタ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTypes.map((type) => {
          const info = CONNECTOR_INFO[type];
          return (
            <div key={type} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{info.icon}</span>
                <h3 className="font-bold">{info.label}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{info.description}</p>
              <button
                onClick={() => handleConnect(type)}
                className="px-4 py-2 rounded text-sm bg-orange-600 text-white hover:bg-orange-700"
              >
                接続する
              </button>
            </div>
          );
        })}
      </div>

      {/* API連携の説明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="font-bold mb-3">汎用API連携</h2>
        <p className="text-sm text-gray-600 mb-3">
          上記以外のECプラットフォームからは、ステップメールAPIを直接呼び出すことで連携できます。
        </p>
        <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">{`POST /api/step-mail/events
Authorization: Bearer sm_live_xxxxx
Content-Type: application/json

{
  "event_type": "purchase",
  "event_id": "order_12345",
  "customer_email": "user@example.com",
  "customer_name": "田中太郎",
  "payload": {
    "order_id": "12345",
    "product_name": "商品A",
    "amount": 5000
  }
}`}</pre>
        <p className="text-sm text-gray-500 mt-2">
          APIキーは <a href="/admin/step-mail/api-keys" className="text-blue-600 hover:underline">EC連携APIキー管理</a> から発行できます。
        </p>
      </div>
    </div>
  );
}
