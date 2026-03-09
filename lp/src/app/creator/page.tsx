"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Stats = {
  totalViews: number;
  totalDesigns: number;
  publishedDesigns: number;
  totalCommission: number;
  totalReferrals: number;
  totalCollections: number;
  publishedCollections: number;
  collectionViews: number;
};

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const code = localStorage.getItem("creator_code");
      if (!code) return;

      const supabase = getSupabase();

      // Get affiliate
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id, code")
        .eq("code", code)
        .single();

      if (!affiliate) return;

      // Get designs
      const { data: designs } = await supabase
        .from("creator_lp_designs")
        .select("views_count, is_published")
        .eq("affiliate_id", affiliate.id);

      // Get referrals
      const { data: referrals } = await supabase
        .from("referrals")
        .select("commission")
        .eq("affiliate_code", affiliate.code);

      // Get collections
      const { data: collections } = await supabase
        .from("creator_lp_collections")
        .select("views_count, is_published")
        .eq("affiliate_id", affiliate.id);

      const totalViews = (designs ?? []).reduce(
        (sum, d) => sum + (d.views_count || 0),
        0
      );
      const totalDesigns = (designs ?? []).length;
      const publishedDesigns = (designs ?? []).filter(
        (d) => d.is_published
      ).length;
      const totalCommission = (referrals ?? []).reduce(
        (sum, r) => sum + (r.commission || 0),
        0
      );
      const totalReferrals = (referrals ?? []).length;
      const totalCollections = (collections ?? []).length;
      const publishedCollections = (collections ?? []).filter(
        (c) => c.is_published
      ).length;
      const collectionViews = (collections ?? []).reduce(
        (sum, c) => sum + (c.views_count || 0),
        0
      );

      setStats({
        totalViews,
        totalDesigns,
        publishedDesigns,
        totalCommission,
        totalReferrals,
        totalCollections,
        publishedCollections,
        collectionViews,
      });
    };

    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="総PV数" value={stats.totalViews.toLocaleString()} />
            <StatCard
              label="公開中デザイン"
              value={`${stats.publishedDesigns} / ${stats.totalDesigns}`}
            />
            <StatCard label="コンバージョン数" value={stats.totalReferrals.toString()} />
            <StatCard
              label="報酬合計"
              value={`¥${stats.totalCommission.toLocaleString()}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="公開中コレクション"
              value={`${stats.publishedCollections} / ${stats.totalCollections}`}
            />
            <StatCard
              label="コレクションPV"
              value={stats.collectionViews.toLocaleString()}
            />
          </div>

          <div className="flex gap-4">
            <Link
              href="/creator/designs/new"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition"
            >
              新しいデザインを作成
            </Link>
            <Link
              href="/creator/collections/new"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition"
            >
              新しいコレクションを作成
            </Link>
            <Link
              href="/creator/designs"
              className="rounded-lg border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              デザイン一覧を見る
            </Link>
          </div>
        </>
      ) : (
        <p className="text-gray-500">読み込み中...</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
