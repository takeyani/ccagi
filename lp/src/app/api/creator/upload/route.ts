import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// 対応形式
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const VIDEO_EXTS = ["mp4", "webm", "mov", "ogg", "ogv"];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: Request) {
  try {
    // 認証チェック
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const ssc = await createSupabaseServerClient();
    const { data: { user } } = await ssc.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
    }

    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "許可されていないファイル形式です。画像（JPEG/PNG/GIF/WebP）または動画（MP4/WebM/MOV/OGG）のみ対応しています" },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const limit = isVideo ? "100MB" : "10MB";
      return NextResponse.json(
        { error: `ファイルサイズが大きすぎます。${limit}以下にしてください` },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowedExts = isVideo ? VIDEO_EXTS : IMAGE_EXTS;
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "許可されていないファイル拡張子です" },
        { status: 400 }
      );
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const subDir = isVideo ? "videos" : "uploads";
    const filePath = `${subDir}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await getSupabase().storage
      .from("creator-assets")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "アップロードに失敗しました" },
        { status: 500 }
      );
    }

    const { data: urlData } = getSupabase().storage
      .from("creator-assets")
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      type: isVideo ? "video" : "image",
      contentType: file.type,
    });
  } catch {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
