import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/lib/generation/pipeline";
import { DEFAULT_TONMANA } from "@/lib/tonmana/presets";
import { compileTonmana } from "@/lib/tonmana/compiler";
import type { Character, TonmanaConfig, PanelBreakdown } from "@/lib/types";
import OpenAI from "openai";

const DEV_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

function decomposeStory(inputText: string): PanelBreakdown[] {
  const sentences = inputText
    .replace(/([。！？\n])/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const panelCount = Math.min(Math.max(sentences.length, 4), 6);
  const panels: PanelBreakdown[] = [];
  const chunkSize = Math.max(1, Math.ceil(sentences.length / panelCount));
  const angles = ["wide shot", "medium shot", "close-up", "medium shot", "wide shot", "close-up"];
  const moods = ["dramatic", "tense", "emotional", "calm", "excited", "peaceful"];

  for (let i = 0; i < panelCount; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    const text = chunk.join("") || sentences[sentences.length - 1] || inputText;
    panels.push({
      panel_number: i + 1,
      scene_description: text,
      camera_angle: angles[i % angles.length],
      dialogue: [{
        character_name: "",
        text: text.length > 30 ? text.slice(0, 30) + "…" : text,
        position: { x: 0.7, y: 0.15 },
        style: i === 0 ? "narration" as const : "speech" as const,
      }],
      sound_effects: [],
      mood: moods[i % moods.length],
      characters: [],
    });
  }
  return panels;
}

async function generateImageWithOpenAI(openai: OpenAI, prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  const image = response.data?.[0];
  if (!image) throw new Error("No image returned from OpenAI");
  if (image.b64_json) return `data:image/png;base64,${image.b64_json}`;
  return image.url || "";
}

function makePlaceholder(i: number, text: string): string {
  const colors = ["4F46E5", "7C3AED", "DB2777", "EA580C"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#${colors[i % colors.length]}" rx="16"/><text x="256" y="256" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await request.json();
  const { project_id, input_text } = body;
  if (!project_id || !input_text) {
    return new Response(JSON.stringify({ error: "project_id and input_text are required" }), { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  // SSE streaming mode for DEV_MODE with OpenAI
  if (DEV_MODE && openaiKey) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const openai = new OpenAI({ apiKey: openaiKey });
          const tonmana = (body.tonmana_config as TonmanaConfig) || DEFAULT_TONMANA;
          const styleModifier = compileTonmana(tonmana);

          // Step 1: Story decomposition
          send("progress", { step: 0, status: "processing", message: "ストーリーを解析中..." });
          const panelBreakdowns = decomposeStory(input_text);
          send("progress", { step: 0, status: "completed", message: `${panelBreakdowns.length}コマに分割しました` });

          // Step 2: Panel layout
          send("progress", { step: 1, status: "processing", message: "コマ割りを計算中..." });
          await new Promise((r) => setTimeout(r, 300));
          send("progress", { step: 1, status: "completed", message: "コマ割り完了" });

          // Step 3: Image generation (per panel)
          send("progress", { step: 2, status: "processing", message: `画像生成中... (0/${panelBreakdowns.length})` });

          const panels = [];
          for (let i = 0; i < panelBreakdowns.length; i++) {
            const panel = panelBreakdowns[i];
            send("progress", {
              step: 2,
              status: "processing",
              message: `画像生成中... (${i + 1}/${panelBreakdowns.length}) - パネル${i + 1}`,
              detail: panel.scene_description.slice(0, 40),
            });

            const prompt = [
              styleModifier,
              panel.scene_description,
              panel.camera_angle ? `camera angle: ${panel.camera_angle}` : "",
              panel.mood ? `mood: ${panel.mood}` : "",
              "manga style panel, dramatic composition, black and white ink drawing, no text or speech bubbles",
            ].filter(Boolean).join(". ");

            let image_url: string;
            try {
              image_url = await generateImageWithOpenAI(openai, prompt);
            } catch (imgErr) {
              console.error(`Image generation failed for panel ${i}:`, imgErr);
              image_url = makePlaceholder(i, `Panel ${i + 1}`);
            }

            const cols = panelBreakdowns.length <= 4 ? 2 : 3;
            const totalRows = Math.ceil(panelBreakdowns.length / cols);

            panels.push({
              id: `panel-${Date.now()}-${i}`,
              image_url,
              scene_description: panel.scene_description,
              dialogue: panel.dialogue,
              sound_effects: panel.sound_effects,
              panel_order: i,
              layout_rect: {
                x: (i % cols) * (1 / cols),
                y: Math.floor(i / cols) * (1 / totalRows),
                w: 1 / cols,
                h: 1 / totalRows,
              },
            });

            send("panel_complete", { index: i, total: panelBreakdowns.length });
          }

          send("progress", { step: 2, status: "completed", message: `全${panelBreakdowns.length}枚の画像生成完了` });

          // Step 4: Finalize
          send("progress", { step: 3, status: "processing", message: "仕上げ中..." });
          const result = {
            generationId: `gen-${Date.now()}`,
            pageId: `page-${Date.now()}`,
            panels,
          };
          send("progress", { step: 3, status: "completed", message: "完了！" });
          send("done", result);
        } catch (err) {
          send("error", { message: err instanceof Error ? err.message : "生成に失敗しました" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Full mode with Supabase
  try {
    const { data: project } = await supabase.from("projects").select("*").eq("id", project_id).single();
    if (!project) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });

    let characters: Character[] = [];
    if (project.character_ids?.length > 0) {
      const { data } = await supabase.from("characters").select("*").in("id", project.character_ids);
      characters = (data as Character[]) || [];
    }

    const { data: profile } = await supabase.from("user_profiles").select("api_keys").eq("id", user.id).single();
    await supabase.from("projects").update({ status: "generating" }).eq("id", project_id);

    const result = await runGenerationPipeline({
      userId: user.id,
      projectId: project_id,
      inputText: input_text,
      provider: project.default_provider || "openai",
      tonmana: (project.tonmana_config as TonmanaConfig) || DEFAULT_TONMANA,
      characters,
      apiKeys: profile?.api_keys as Record<string, string>,
    });

    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Manga generation error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Manga generation failed" }),
      { status: 500 }
    );
  }
}
