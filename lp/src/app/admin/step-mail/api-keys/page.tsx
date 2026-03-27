"use client";

import { useState, useEffect } from "react";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadKeys = async () => {
    const res = await fetch("/api/step-mail/api-keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data);
    }
    setLoading(false);
  };

  useEffect(() => { loadKeys(); }, []);

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    const res = await fetch("/api/step-mail/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    if (res.ok) {
      const data = await res.json();
      setGeneratedKey(data.key);
      setNewKeyName("");
      loadKeys();
    }
  };

  const toggleKey = async (id: string, isActive: boolean) => {
    await fetch("/api/step-mail/api-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    loadKeys();
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">EC連携APIキー管理</h1>

      {generatedKey && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="font-bold text-yellow-800 mb-2">新しいAPIキーが生成されました（この画面を閉じると二度と表示されません）</p>
          <code className="bg-yellow-100 px-3 py-2 rounded block break-all text-sm">{generatedKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(generatedKey); }} className="mt-2 text-sm text-blue-600 hover:underline">
            コピー
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-bold mb-3">新規APIキー発行</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="キー名（例: Shopify本店）"
            className="flex-1 border rounded px-3 py-2"
          />
          <button onClick={generateKey} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            発行
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          外部ECプラットフォーム（Shopify, BASE, STORES.jp等）からイベントを送信するためのAPIキーです。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">キー（先頭8文字）</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">権限</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終使用</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{key.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{key.key_prefix}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{key.permissions.join(", ")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString("ja-JP") : "未使用"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${key.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {key.is_active ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleKey(key.id, key.is_active)} className="text-sm text-blue-600 hover:underline">
                    {key.is_active ? "無効化" : "有効化"}
                  </button>
                </td>
              </tr>
            ))}
            {!keys.length && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">APIキーがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h2 className="font-bold mb-3">外部EC連携方法</h2>
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
      </div>
    </div>
  );
}
