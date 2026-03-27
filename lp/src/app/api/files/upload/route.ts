import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const partnerId = formData.get("partner_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // File type validation
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'csv', 'xlsx'];
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "許可されていないファイル形式です" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズが大きすぎます。50MB以下にしてください" },
      { status: 400 }
    );
  }

  const fileExt = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return NextResponse.json(
      { error: "許可されていないファイル拡張子です" },
      { status: 400 }
    );
  }

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "";
  const fileName = `${randomUUID()}.${ext}`;
  const filePath = `/uploads/${fileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, fileName), buffer);

  const { error } = await supabase.from("shared_files").insert({
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
    partner_id: partnerId || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: filePath });
}
