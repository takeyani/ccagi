"use client";

import { useState, useEffect, use } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface PanelData {
  id: string;
  image_url: string | null;
  panel_order: number;
}

interface PageData {
  id: string;
  page_number: number;
  panels?: PanelData[];
}

interface GenerationData {
  id: string;
  input_text: string;
  status: string;
  created_at: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Try sessionStorage first (set during project creation)
      const stored = sessionStorage.getItem(`manga-project-${id}`);
      if (stored) {
        try {
          const p = JSON.parse(stored);
          setProject(p);
        } catch { /* ignore */ }
      }

      // Also fetch from Supabase (may have more up-to-date data)
      const supabase = createSupabaseBrowserClient();
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectData) {
        // If the stored title is real (not default), prefer it
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p.title && p.title !== "デモプロジェクト") {
              projectData.title = p.title;
            }
          } catch { /* ignore */ }
        }
        setProject(projectData as Record<string, unknown>);
      }

      const { data: pageData } = await supabase
        .from("manga_pages")
        .select("*, panels(*)")
        .eq("project_id", id)
        .order("page_number");

      if (pageData) setPages(pageData as PageData[]);

      const { data: genData } = await supabase
        .from("generations")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (genData) setGenerations(genData as GenerationData[]);

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 flex items-center justify-center">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="p-6 text-center text-gray-500">
          プロジェクトが見つかりません。
        </div>
      </AppShell>
    );
  }

  const title = (project.title as string) || "無題のプロジェクト";
  const tonmana = project.tonmana_config as Record<string, string> | null;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/projects" className="hover:text-indigo-500">プロジェクト</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{title}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              プロバイダー: {(project.default_provider as string) || "openai"} | スタイル:{" "}
              {tonmana?.art_style || "未設定"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/projects/${id}/generate`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              生成
            </Link>
            {pages.length > 0 && (
              <Link
                href={`/projects/${id}/edit`}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
              >
                エディタ
              </Link>
            )}
          </div>
        </div>

        {/* Pages preview */}
        {pages.length > 0 ? (
          <div className="space-y-6">
            {pages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-3">
                  ページ {page.page_number}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(page.panels || [])
                    .sort((a, b) => a.panel_order - b.panel_order)
                    .map((panel) => (
                      <div
                        key={panel.id}
                        className="aspect-square bg-gray-100 rounded overflow-hidden"
                      >
                        {panel.image_url ? (
                          <img
                            src={panel.image_url}
                            alt={`Panel ${panel.panel_order + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            {panel.panel_order + 1}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            <p>まだページがありません。</p>
            <Link
              href={`/projects/${id}/generate`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              テキストから漫画を生成する
            </Link>
          </div>
        )}

        {/* Generation history */}
        {generations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">生成履歴</h2>
            <div className="space-y-2">
              {generations.map((g) => (
                <div
                  key={g.id}
                  className="bg-white p-3 rounded-lg border text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 truncate max-w-md">
                      {g.input_text}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ml-2 whitespace-nowrap ${
                        g.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : g.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {g.status === "completed"
                        ? "完了"
                        : g.status === "failed"
                        ? "失敗"
                        : "処理中"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
