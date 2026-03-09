"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { CreatorLPDesign, CreatorLPCollection } from "@/lib/types";

type ReferralRow = {
  amount: number;
  commission: number;
  created_at: string;
};

export default function CreatorAnalyticsPage() {
  const [designs, setDesigns] = useState<CreatorLPDesign[]>([]);
  const [collections, setCollections] = useState<CreatorLPCollection[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const code = localStorage.getItem("creator_code");
      if (!code) return;

      const supabase = getSupabase();

      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id, code")
        .eq("code", code)
        .single();

      if (!affiliate) return;

      const [{ data: designData }, { data: collectionData }, { data: referralData }] = await Promise.all([
        supabase
          .from("creator_lp_designs")
          .select("*")
          .eq("affiliate_id", affiliate.id)
          .order("views_count", { ascending: false }),
        supabase
          .from("creator_lp_collections")
          .select("*")
          .eq("affiliate_id", affiliate.id)
          .order("views_count", { ascending: false }),
        supabase
          .from("referrals")
          .select("amount, commission, created_at")
          .eq("affiliate_code", affiliate.code)
          .order("created_at", { ascending: false }),
      ]);

      setDesigns((designData as CreatorLPDesign[]) ?? []);
      setCollections((collectionData as CreatorLPCollection[]) ?? []);
      setReferrals((referralData as ReferralRow[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-gray-500">読み込み中...</p>;
  }

  const totalCommission = referrals.reduce((s, r) => s + r.commission, 0);
  const totalAmount = referrals.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">分析</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">紹介売上合計</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            ¥{totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">報酬合計</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            ¥{totalCommission.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border">
          <p className="text-sm text-gray-500">紹介件数</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {referrals.length}
          </p>
        </div>
      </div>

      {/* Design performance */}
      <h2 className="text-lg font-semibold mb-3">デザイン別PV</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">PV数</th>
            </tr>
          </thead>
          <tbody>
            {designs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              designs.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{d.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {d.is_published ? "公開中" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{d.views_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Collection performance */}
      <h2 className="text-lg font-semibold mb-3">コレクション別PV</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">PV数</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              collections.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.is_published ? "公開中" : "下書き"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.views_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Referral history */}
      <h2 className="text-lg font-semibold mb-3">報酬内訳</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">日時</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">金額</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">報酬</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              referrals.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">¥{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    ¥{r.commission.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
