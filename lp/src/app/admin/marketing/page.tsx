"use client";

import { useState, useEffect } from "react";

type ReportData = {
  report_type: string;
  period: { start: string; end: string };
  summary: {
    total_views: number;
    total_shares: number;
    total_conversions: number;
    conversion_rate: number;
    total_revenue: number;
    total_commission: number;
    active_lps: number;
    active_articles: number;
    total_articles: number;
  };
  template_performance: Record<string, { views: number; shares: number; conversions: number }>;
  category_performance: Record<string, { count: number; views: number; conversions: number }>;
  top_articles: {
    id: string;
    title: string;
    views: number;
    shares: number;
    conversions: number;
    template_type: string;
    category: string;
  }[];
};

const TEMPLATE_LABELS: Record<string, string> = {
  threads_viral: "🧵 Threads風",
  twitter_thread: "𝕏 Xスレッド",
  instagram_story: "📸 Instagram",
  note_article: "📝 note風",
  listicle: "📋 リスト型",
  comparison: "⚖️ 比較記事",
  how_to: "🛠️ ハウツー",
  case_study: "📊 事例紹介",
  custom: "✏️ カスタム",
};

const PERIOD_OPTIONS = [
  { value: "daily", label: "今日" },
  { value: "weekly", label: "過去7日" },
  { value: "monthly", label: "過去30日" },
  { value: "campaign", label: "過去90日" },
];

export default function MarketingDashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("weekly");

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch(`/api/marketing/reports?type=${period}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  const formatNumber = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString();

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">レポートを読み込み中...</div>
      </div>
    );
  }

  const s = report?.summary;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">マーケティングダッシュボード</h1>
            <p className="text-gray-500 mt-1">
              {report?.period.start} 〜 {report?.period.end}
            </p>
          </div>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  period === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "総閲覧数", value: formatNumber(s?.total_views || 0), icon: "👁️", color: "blue" },
            { label: "総シェア", value: formatNumber(s?.total_shares || 0), icon: "🔄", color: "purple" },
            { label: "コンバージョン", value: formatNumber(s?.total_conversions || 0), icon: "🎯", color: "green" },
            { label: "CVR", value: `${s?.conversion_rate || 0}%`, icon: "📈", color: "orange" },
            { label: "総売上", value: `¥${formatNumber(s?.total_revenue || 0)}`, icon: "💰", color: "green" },
            { label: "報酬合計", value: `¥${formatNumber(s?.total_commission || 0)}`, icon: "🏦", color: "blue" },
            { label: "公開LP数", value: s?.active_lps || 0, icon: "🌐", color: "indigo" },
            { label: "公開記事数", value: s?.active_articles || 0, icon: "📝", color: "pink" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>{kpi.icon}</span>
                {kpi.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* テンプレート別パフォーマンス */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">テンプレート別パフォーマンス</h2>
            {Object.keys(report?.template_performance || {}).length === 0 ? (
              <p className="text-gray-400 text-sm">データなし</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(report?.template_performance || {})
                  .sort(([, a], [, b]) => b.views - a.views)
                  .map(([key, perf]) => {
                    const cvr = perf.views > 0 ? ((perf.conversions / perf.views) * 100).toFixed(1) : "0";
                    return (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {TEMPLATE_LABELS[key] || key}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">👁️ {formatNumber(perf.views)}</span>
                          <span className="text-gray-500">🔄 {formatNumber(perf.shares)}</span>
                          <span className="text-gray-500">🎯 {perf.conversions}</span>
                          <span className="text-indigo-600 font-medium">CVR {cvr}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* カテゴリ別パフォーマンス */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">カテゴリ別パフォーマンス</h2>
            {Object.keys(report?.category_performance || {}).length === 0 ? (
              <p className="text-gray-400 text-sm">データなし</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(report?.category_performance || {})
                  .sort(([, a], [, b]) => b.views - a.views)
                  .map(([key, perf]) => {
                    const cvr = perf.views > 0 ? ((perf.conversions / perf.views) * 100).toFixed(1) : "0";
                    return (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm font-medium text-gray-700">{key}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{perf.count}件</span>
                          <span className="text-gray-500">👁️ {formatNumber(perf.views)}</span>
                          <span className="text-gray-500">🎯 {perf.conversions}</span>
                          <span className="text-indigo-600 font-medium">CVR {cvr}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* トップ記事 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">トップ記事 TOP10</h2>
          {!report?.top_articles?.length ? (
            <p className="text-gray-400 text-sm">データなし</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">タイトル</th>
                    <th className="pb-3 font-medium">テンプレート</th>
                    <th className="pb-3 font-medium text-right">閲覧</th>
                    <th className="pb-3 font-medium text-right">シェア</th>
                    <th className="pb-3 font-medium text-right">CV</th>
                    <th className="pb-3 font-medium text-right">CVR</th>
                  </tr>
                </thead>
                <tbody>
                  {report.top_articles.map((article, i) => {
                    const cvr = article.views > 0 ? ((article.conversions / article.views) * 100).toFixed(1) : "0";
                    return (
                      <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{article.title}</td>
                        <td className="py-3 text-gray-500">{TEMPLATE_LABELS[article.template_type] || article.template_type}</td>
                        <td className="py-3 text-right">{formatNumber(article.views)}</td>
                        <td className="py-3 text-right">{formatNumber(article.shares)}</td>
                        <td className="py-3 text-right">{article.conversions}</td>
                        <td className="py-3 text-right text-indigo-600 font-medium">{cvr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
