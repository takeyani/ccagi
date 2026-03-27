"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PromptInput from "@/components/generate/PromptInput";
import GenerationProgress from "@/components/generate/GenerationProgress";

interface ProgressStep {
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
  detail?: string;
}

export default function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("プロジェクト");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load project title from sessionStorage
    const stored = sessionStorage.getItem(`manga-project-${id}`);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        if (p.title) setProjectTitle(p.title);
      } catch { /* ignore */ }
    }
  }, [id]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: "ストーリー解析中...", status: "pending" },
    { label: "コマ割り計算中...", status: "pending" },
    { label: "画像生成中...", status: "pending" },
    { label: "仕上げ中...", status: "pending" },
  ]);
  const [elapsed, setElapsed] = useState(0);

  const handleGenerate = async (text: string) => {
    setLoading(true);
    setError("");
    setElapsed(0);

    // Timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const res = await fetch("/api/generate/manga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: id, input_text: text }),
      });

      // Check if SSE stream
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let result = null;

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventName = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (eventName === "progress") {
                setCurrentStep(data.step);
                setSteps((prev) =>
                  prev.map((s, i) => {
                    if (i === data.step) {
                      return { ...s, label: data.message, status: data.status, detail: data.detail };
                    }
                    if (i < data.step && s.status !== "completed") {
                      return { ...s, status: "completed" };
                    }
                    return s;
                  })
                );
              } else if (eventName === "done") {
                result = data;
              } else if (eventName === "error") {
                throw new Error(data.message);
              }
            }
          }
        }

        if (result?.panels) {
          sessionStorage.setItem(`manga-panels-${id}`, JSON.stringify(result.panels));
          clearInterval(timer);
          router.push(`/projects/${id}/edit`);
          return;
        }
      } else {
        // JSON response (non-streaming fallback)
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "生成に失敗しました");
        }
        const result = await res.json();
        setSteps((prev) => prev.map((s) => ({ ...s, status: "completed" as const })));
        if (result.panels) {
          sessionStorage.setItem(`manga-panels-${id}`, JSON.stringify(result.panels));
        }
        clearInterval(timer);
        router.push(`/projects/${id}/edit`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました");
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "processing" ? { ...s, status: "failed" as const } : s
        )
      );
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}分${sec}秒` : `${sec}秒`;
  };

  return (
    <AppShell>
      <div className="p-8 max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/projects" className="hover:text-indigo-500">プロジェクト</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-indigo-500">{projectTitle}</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">生成</span>
        </nav>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">{projectTitle} - 漫画を生成</h1>
          <p className="text-slate-500 mt-1">テキストを入力すると、AIが漫画のコマを自動生成します</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <PromptInput onSubmit={handleGenerate} loading={loading} />

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">生成進捗</h3>
              <span className="text-sm text-slate-400 tabular-nums">
                経過時間: {formatTime(elapsed)}
              </span>
            </div>
            <GenerationProgress steps={steps} currentStep={currentStep} />
            <p className="text-xs text-slate-400">
              画像生成には1枚あたり30〜40秒ほどかかります。4コマの場合、合計2〜3分程度お待ちください。
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
