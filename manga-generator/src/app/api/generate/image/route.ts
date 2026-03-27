import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createImageProvider } from "@/lib/providers/factory";
import type { ImageProviderName } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, provider, api_key, options } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const providerName: ImageProviderName = provider || "openai";
    const imageProvider = createImageProvider(providerName, api_key);
    const result = await imageProvider.generate(prompt, options);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
