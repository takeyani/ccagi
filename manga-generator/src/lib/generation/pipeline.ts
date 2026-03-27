import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { createImageProvider } from "@/lib/providers/factory";
import { parseStoryResponse } from "./story-parser";
import { buildImagePrompt, buildStorySystemPrompt } from "./prompt-builder";
import type {
  Character,
  TonmanaConfig,
  PanelBreakdown,
  ImageProviderName,
} from "@/lib/types";

interface PipelineInput {
  userId: string;
  projectId: string;
  inputText: string;
  provider: ImageProviderName;
  tonmana: TonmanaConfig;
  characters: Character[];
  apiKeys?: Record<string, string>;
}

interface PipelineResult {
  generationId: string;
  pageId: string;
  panels: { id: string; image_url: string }[];
}

export async function runGenerationPipeline(
  input: PipelineInput
): Promise<PipelineResult> {
  const supabase = createAdminClient();
  const claude = new Anthropic();

  // 1. Create generation record
  const { data: generation, error: genErr } = await supabase
    .from("generations")
    .insert({
      user_id: input.userId,
      project_id: input.projectId,
      input_text: input.inputText,
      provider: input.provider,
      status: "processing",
    })
    .select()
    .single();

  if (genErr || !generation) {
    throw new Error(`Failed to create generation: ${genErr?.message}`);
  }

  try {
    // 2. Story decomposition via Claude
    const charNames = input.characters.map((c) => c.name);
    const storyResponse = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildStorySystemPrompt(charNames),
      messages: [{ role: "user", content: input.inputText }],
    });

    const responseText =
      storyResponse.content[0].type === "text"
        ? storyResponse.content[0].text
        : "";
    const panelBreakdowns = parseStoryResponse(responseText);

    // Update generation with breakdown
    await supabase
      .from("generations")
      .update({ panel_breakdown: panelBreakdowns })
      .eq("id", generation.id);

    // 3. Create manga page
    const { data: page, error: pageErr } = await supabase
      .from("manga_pages")
      .insert({
        project_id: input.projectId,
        page_number: 1,
        layout_template: "auto",
      })
      .select()
      .single();

    if (pageErr || !page) {
      throw new Error(`Failed to create page: ${pageErr?.message}`);
    }

    // 4. Generate images in parallel
    const providerKey = input.apiKeys?.[input.provider];
    const imageProvider = createImageProvider(input.provider, providerKey);

    const panelResults = await Promise.all(
      panelBreakdowns.map(async (panel: PanelBreakdown, index: number) => {
        const prompt = buildImagePrompt(
          panel,
          input.characters,
          input.tonmana
        );

        const imageResult = await imageProvider.generate(prompt, {
          width: 1024,
          height: 1024,
        });

        // Upload to Supabase Storage if it's base64
        let imageUrl = imageResult.url;
        if (imageUrl.startsWith("data:")) {
          const base64Data = imageUrl.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const path = `${input.userId}/${input.projectId}/${generation.id}/panel_${index}.png`;
          const { error: uploadErr } = await supabase.storage
            .from("manga-images")
            .upload(path, buffer, { contentType: "image/png" });

          if (!uploadErr) {
            const { data: publicUrl } = supabase.storage
              .from("manga-images")
              .getPublicUrl(path);
            imageUrl = publicUrl.publicUrl;
          }
        }

        // Create panel record
        const { data: panelRecord, error: panelErr } = await supabase
          .from("panels")
          .insert({
            page_id: page.id,
            panel_order: index,
            image_url: imageUrl,
            scene_description: panel.scene_description,
            dialogue: panel.dialogue,
            sound_effects: panel.sound_effects,
            layout_rect: computeLayoutRect(index, panelBreakdowns.length),
          })
          .select()
          .single();

        if (panelErr || !panelRecord) {
          throw new Error(`Failed to create panel: ${panelErr?.message}`);
        }

        return { id: panelRecord.id, image_url: imageUrl };
      })
    );

    // 5. Mark generation as completed
    await supabase
      .from("generations")
      .update({
        status: "completed",
        result: { page_id: page.id, panel_count: panelResults.length },
      })
      .eq("id", generation.id);

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", input.projectId);

    return {
      generationId: generation.id,
      pageId: page.id,
      panels: panelResults,
    };
  } catch (error) {
    // Mark generation as failed
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
      })
      .eq("id", generation.id);
    throw error;
  }
}

function computeLayoutRect(
  index: number,
  total: number
): { x: number; y: number; w: number; h: number } {
  const cols = total <= 4 ? 2 : 3;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const w = 1 / cols;
  const totalRows = Math.ceil(total / cols);
  const h = 1 / totalRows;
  return { x: col * w, y: row * h, w, h };
}
