"use client";

import { useState, useEffect } from "react";
import { ARTICLE_TEMPLATES } from "@/lib/creator-lp/article-templates";
import type { ArticleLPDesign, ArticleTemplate, ArticleCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  business: "ビジネス",
  technology: "テクノロジー",
  lifestyle: "ライフスタイル",
  health: "ヘルス",
  finance: "ファイナンス",
  marketing: "マーケティング",
  case_study: "事例紹介",
  news: "ニュース",
};

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<ArticleLPDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<ArticleCategory>("business");
  const [newTemplate, setNewTemplate] = useState<ArticleTemplate>("threads_viral");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const res = await fetch("/api/articles");
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliate_id: "admin",
        title: newTitle,
        description: newDescription,
        category: newCategory,
        template_type: newTemplate,
        tags: [],
      }),
    });

    if (res.ok) {
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      fetchArticles();
    }
    setCreating(false);
  };

  const selectedTemplate = ARTICLE_TEMPLATES.find((t) => t.id === newTemplate);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">記事LP管理</h1>
            <p className="text-gray-500 mt-1">
              SNSバイラル投稿風の記事LPを作成・管理
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            + 新規記事LP作成
          </button>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "総記事数", value: articles.length, icon: "📝" },
            { label: "公開中", value: articles.filter((a) => a.is_published).length, icon: "🌐" },
            { label: "総閲覧数", value: articles.reduce((s, a) => s + (a.views_count || 0), 0).toLocaleString(), icon: "👁️" },
            { label: "総CV数", value: articles.reduce((s, a) => s + (a.conversion_count || 0), 0).toLocaleString(), icon: "🎯" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>{stat.icon}</span>
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 記事一覧 */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">読み込み中...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">まだ記事LPがありません</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              最初の記事LPを作成する →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const template = ARTICLE_TEMPLATES.find((t) => t.id === article.template_type);
              return (
                <div
                  key={article.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {article.cover_image_url && (
                    <img
                      src={article.cover_image_url}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {template?.icon} {template?.name || article.template_type}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        {CATEGORY_LABELS[article.category as ArticleCategory] || article.category}
                      </span>
                      {article.is_published ? (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">公開中</span>
                      ) : (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded">下書き</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{article.title}</h3>
                    {article.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{article.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>👁️ {article.views_count || 0}</span>
                      <span>🔄 {article.share_count || 0}</span>
                      <span>🎯 {article.conversion_count || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">新規記事LP作成</h2>

              {/* テンプレート選択 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ARTICLE_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setNewTemplate(t.id)}
                      className={`text-left p-4 rounded-xl border-2 transition ${
                        newTemplate === t.id
                          ? "border-orange-500 bg-orange-50/40"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{t.icon}</span>
                        <span className="font-medium text-gray-900 text-sm">{t.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </button>
                  ))}
                </div>
                {selectedTemplate && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                    選択中: <strong>{selectedTemplate.icon} {selectedTemplate.name}</strong> — {selectedTemplate.description}
                  </div>
                )}
              </div>

              {/* タイトル */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例: 知らないと損する○○の話"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* 説明 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="記事の概要..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* カテゴリ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ArticleCategory)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* アクション */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-800 transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-medium"
                >
                  {creating ? "作成中..." : "記事LPを作成"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
