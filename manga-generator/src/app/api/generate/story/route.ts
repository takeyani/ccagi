import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStoryResponse } from "@/lib/generation/story-parser";
import { buildStorySystemPrompt } from "@/lib/generation/prompt-builder";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, character_names } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const claude = new Anthropic();
    const response = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildStorySystemPrompt(character_names || []),
      messages: [{ role: "user", content: text }],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";
    const panels = parseStoryResponse(responseText);

    return NextResponse.json({ panels });
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: "Story generation failed" },
      { status: 500 }
    );
  }
}
