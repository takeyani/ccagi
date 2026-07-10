import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// creator-assets バケットからアップロード済みメディアを列挙する。
// クライアント（Media Library モーダル）で既存の画像/動画を再利用する用途。

const BUCKET = "creator-assets";
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogg|ogv)$/i;

export async function GET(request: Request) {
  const ssc = await createSupabaseServerClient();
  const { data: { user } } = await ssc.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "both"; // "image" | "video" | "both"
  const limit = Math.min(Number(searchParams.get("limit")) || 60, 200);

  const supabase = getSupabase();
  const items: { url: string; name: string; type: "image" | "video"; created_at: string; size: number }[] = [];

  // uploads/ (画像) と videos/ (動画) を両方 list
  const dirs =
    kind === "image" ? ["uploads"] :
    kind === "video" ? ["videos"] :
    ["uploads", "videos"];

  for (const dir of dirs) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(dir, {
        limit,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error || !data) continue;

    for (const obj of data) {
      if (!obj.name || obj.name === ".emptyFolderPlaceholder") continue;
      const isVideo = VIDEO_EXT.test(obj.name);
      const isImage = IMAGE_EXT.test(obj.name);
      if (!isImage && !isVideo) continue;
      // kind フィルタ再適用
      if (kind === "image" && !isImage) continue;
      if (kind === "video" && !isVideo) continue;

      const path = `${dir}/${obj.name}`;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      items.push({
        url: urlData.publicUrl,
        name: obj.name,
        type: isVideo ? "video" : "image",
        created_at: obj.created_at || "",
        size: (obj.metadata?.size as number) || 0,
      });
    }
  }

  // 作成日順にソート（新しいもの順）
  items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  return NextResponse.json({ items: items.slice(0, limit) });
}
