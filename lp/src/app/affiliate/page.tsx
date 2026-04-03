"use client";

import { useState } from "react";
import Link from "next/link";

export default function AffiliatePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    existing: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          is_creator: isCreator,
          ref: typeof window !== "undefined" ? localStorage.getItem("affiliate_ref") : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      setResult(data);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = result ? `${baseUrl}/?ref=${result.code}` : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            アフィリエイトプログラム
          </h1>
          <p className="mt-3 text-gray-600">
            紹介リンクを共有して、売上の
            <span className="font-bold text-indigo-600">2%</span>
            をポイントとして獲得しましょう。獲得ポイントは全商品の購入に使えます。
          </p>
        </div>

        {/* フロー説明 */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm mb-4">ご利用の流れ</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "ユーザー登録を行い、紹介リンク・QRコードを発行" },
              { step: "2", text: "メーカーや代理店にリンク/QRコードを共有" },
              { step: "3", text: "紹介先がリンクから登録すると、あなたに紐付き" },
              { step: "4", text: "紹介先の売上発生時、12%の成果報酬のうち2%をポイント獲得" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">{item.step}</span>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">報酬内訳</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="text-center">
                <p className="text-lg font-extrabold text-indigo-600">12%</p>
                <p className="text-xs text-gray-500">成果報酬</p>
              </div>
              <span className="text-gray-400">=</span>
              <div className="text-center">
                <p className="text-lg font-extrabold text-amber-600">2%</p>
                <p className="text-xs text-gray-500">紹介者ポイント</p>
              </div>
              <span className="text-gray-400">+</span>
              <div className="text-center">
                <p className="text-lg font-extrabold text-gray-600">10%</p>
                <p className="text-xs text-gray-500">プラットフォーム</p>
              </div>
            </div>
          </div>
        </div>

        {/* グループ紹介（1段階のみ） */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm mb-2">グループ紹介フィー</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800">
              <span className="font-bold">1段階のみの紹介制度です。</span>
              連鎖販売（マルチレベル）ではありません。紹介者が直接紹介した相手の売上に対してのみフィーが発生します。
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            あなたがインフルエンサーやメーカーをプラットフォームに紹介した場合、
            「グループ紹介フィー」として、紹介先の売上に対してポイントが還元されます。
            これは通常の紹介ポイント（2%）とは<span className="font-bold">別枠</span>のフィーです。
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-center text-sm">
              <div>
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-xl mb-1">👤</div>
                <p className="text-xs font-bold text-purple-700">あなた</p>
                <p className="text-[10px] text-purple-500">紹介者</p>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs">紹介→</div>
                <div className="text-[10px] text-purple-600 font-bold mt-0.5">グループ紹介フィー</div>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-xl mb-1">🎤</div>
                <p className="text-xs font-bold text-pink-700">インフルエンサー</p>
                <p className="text-[10px] text-pink-500">クリエイター</p>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-xs">販売→</div>
                <div className="text-[10px] text-pink-600 font-bold mt-0.5">卸値との差額</div>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-xl mb-1">🛒</div>
                <p className="text-xs font-bold text-emerald-700">バイヤー</p>
                <p className="text-[10px] text-emerald-500">購入者</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-bold text-gray-700 mb-2">フィーの構造（食品12%の場合）</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs border-b pb-1">
                <span className="text-gray-500 font-bold">項目</span>
                <span className="text-gray-500 font-bold">割合</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">クリエイターの利益</span>
                <span className="font-bold text-pink-600">販売価格 - 卸値</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">紹介ポイント（通常）</span>
                <span className="font-bold text-amber-600">売上の 2%</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-purple-50 rounded p-1 -mx-1">
                <span className="text-purple-700 font-bold">グループ紹介フィー（別枠）</span>
                <span className="font-bold text-purple-600">売上の 0.5%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">プラットフォーム</span>
                <span className="font-bold text-gray-600">売上の 9.5%</span>
              </div>
              <div className="border-t pt-1 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">合計手数料</span>
                <span className="font-bold text-indigo-600">12%</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              ※ グループ紹介フィーは1段階のみ。紹介者→紹介先の直接関係に対してのみ発生します。紹介先がさらに別の人を紹介しても、元の紹介者にフィーは発生しません。
            </p>
          </div>
        </div>

        {/* アフィリエイト機能の詳細 */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm mb-4">アフィリエイト機能の詳細</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-indigo-600 mb-2">掲載される媒体（アフィリエイターの活動場所）</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Instagram", desc: "ストーリー・フィード・リール" },
                  { name: "YouTube", desc: "概要欄・カード・エンドスクリーン" },
                  { name: "TikTok", desc: "プロフィール・動画説明" },
                  { name: "X (Twitter)", desc: "ポスト・スレッド" },
                  { name: "ブログ / note", desc: "記事内リンク・バナー" },
                  { name: "LINE", desc: "公式アカウント・リッチメッセージ" },
                  { name: "自社サイト", desc: "iframeウィジェット埋め込み" },
                  { name: "メルマガ", desc: "ニュースレター内リンク" },
                ].map((m) => (
                  <div key={m.name} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs font-bold text-gray-900">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-indigo-600 mb-2">アフィリエイターの種類</p>
              <div className="space-y-2">
                {[
                  { type: "インフルエンサー", desc: "SNSフォロワーを持つ個人。LP作成→SNSで拡散→フォロワーが購入" },
                  { type: "映像クリエイター", desc: "YouTube等で商品レビュー動画を制作。概要欄にLPリンクを設置" },
                  { type: "ブロガー・ライター", desc: "SEO記事や比較記事で商品を紹介。検索流入からの購入を獲得" },
                  { type: "法人代理店", desc: "自社の取引先ネットワークを活用して商品を紹介・販売" },
                  { type: "個人の紹介者", desc: "知人のメーカーやインフルエンサーをプラットフォームに紹介（グループ紹介フィー）" },
                ].map((a) => (
                  <div key={a.type} className="flex items-start gap-2 text-xs">
                    <span className="text-indigo-500 mt-0.5">-</span>
                    <div>
                      <span className="font-bold text-gray-900">{a.type}：</span>
                      <span className="text-gray-600">{a.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-indigo-600 mb-2">メーカーによるアフィリエイター管理</p>
              <div className="space-y-1.5">
                {[
                  "販売許可の承認/拒否：クリエイターからのリクエストをメーカーが審査",
                  "販売価格の上限・下限設定：ブランド価値を守る価格レンジを指定",
                  "掲載内容の確認：作成されたLPの内容を事前に確認可能",
                  "許可の取り消し：規約違反やブランドイメージに反する場合は許可を無効化",
                  "成果レポート：どのクリエイターがどれだけ売ったかをリアルタイムで確認",
                ].map((item) => (
                  <p key={item} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {!result ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-white p-8 shadow-lg"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  お名前
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="山田太郎"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCreator}
                    onChange={(e) => setIsCreator(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    クリエイターとして登録する（LP作成機能を利用）
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登録中..." : "アフィリエイト登録する"}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {result.existing
                  ? "既に登録済みです"
                  : "登録が完了しました！"}
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  アフィリエイトコード
                </p>
                <p className="mt-1 rounded-lg bg-gray-100 px-4 py-3 font-mono text-lg font-bold text-indigo-600">
                  {result.code}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  紹介リンク
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(referralLink)
                    }
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    コピー
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                このリンクを経由して購入が発生すると、売上の2%がポイントとして付与されます。ポイントはプラットフォーム内の全商品の購入にご利用いただけます。
              </p>

              {isCreator && (
                <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-sm font-medium text-indigo-900">
                    クリエイターとして登録されました
                  </p>
                  <p className="mt-1 text-sm text-indigo-700">
                    上記のコードを使って、クリエイターポータルからLP（ランディングページ）を作成できます。
                  </p>
                  <Link
                    href="/creator"
                    className="mt-3 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    クリエイターポータルへ →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 transition hover:text-indigo-800"
          >
            &larr; トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
