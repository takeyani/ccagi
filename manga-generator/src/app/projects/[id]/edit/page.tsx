"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PanelCanvas from "@/components/editor/PanelCanvas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Panel } from "@/lib/types";

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("プロジェクト");

  useEffect(() => {
    // Load project title
    const storedProject = sessionStorage.getItem(`manga-project-${id}`);
    if (storedProject) {
      try {
        const p = JSON.parse(storedProject);
        if (p.title) setProjectTitle(p.title);
      } catch { /* ignore */ }
    }

    const fetchPanels = async () => {
      // Check sessionStorage first (from generation flow)
      const cached = sessionStorage.getItem(`manga-panels-${id}`);
      if (cached) {
        try {
          const cachedPanels = JSON.parse(cached) as Panel[];
          if (cachedPanels.length > 0) {
            setPanels(cachedPanels);
            setLoading(false);
            return;
          }
        } catch { /* ignore parse errors */ }
      }

      const supabase = createSupabaseBrowserClient();
      const { data: pages } = await supabase
        .from("manga_pages")
        .select("id")
        .eq("project_id", id)
        .order("page_number")
        .limit(1);

      if (pages && pages.length > 0) {
        const { data: panelData } = await supabase
          .from("panels")
          .select("*")
          .eq("page_id", pages[0].id)
          .order("panel_order");

        if (panelData) setPanels(panelData as Panel[]);
      }
      setLoading(false);
    };

    fetchPanels();
  }, [id]);

  const handlePanelsChange = useCallback(
    async (updatedPanels: Panel[]) => {
      setPanels(updatedPanels);

      // Persist order changes
      const supabase = createSupabaseBrowserClient();
      await Promise.all(
        updatedPanels.map((p) =>
          supabase
            .from("panels")
            .update({
              panel_order: p.panel_order,
              dialogue: p.dialogue,
              sound_effects: p.sound_effects,
              scene_description: p.scene_description,
            })
            .eq("id", p.id)
        )
      );
    },
    []
  );

  const handleRegenerate = useCallback(
    async (panelId: string) => {
      const panel = panels.find((p) => p.id === panelId);
      if (!panel) return;

      try {
        const res = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: panel.scene_description }),
        });

        if (res.ok) {
          const result = await res.json();
          const supabase = createSupabaseBrowserClient();
          await supabase
            .from("panels")
            .update({ image_url: result.url })
            .eq("id", panelId);

          setPanels((prev) =>
            prev.map((p) =>
              p.id === panelId ? { ...p, image_url: result.url } : p
            )
          );
        }
      } catch (err) {
        console.error("Regeneration failed:", err);
      }
    },
    [panels]
  );

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 flex items-center justify-center">
          <span className="text-gray-500">読み込み中...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/projects" className="hover:text-indigo-500">プロジェクト</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-indigo-500">{projectTitle}</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">エディタ</span>
        </nav>
        <h1 className="text-2xl font-bold">{projectTitle} - コマ割りエディタ</h1>
        {panels.length === 0 ? (
          <p className="text-gray-500">パネルがありません。</p>
        ) : (
          <PanelCanvas
            panels={panels}
            onPanelsChange={handlePanelsChange}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </AppShell>
  );
}
