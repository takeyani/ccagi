import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ViewerLoader } from "@/components/viewer/ViewerLoader";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;

  // Special case: local test mode
  if (fileId === "local-test") {
    return <ViewerLoader fileId="local-test" fileName="ローカルテスト" fileUrl={null} />;
  }

  const supabase = await createSupabaseServerClient();

  const { data: file } = await supabase
    .from("cad_files")
    .select("id, file_name, storage_path, project_id")
    .eq("id", fileId)
    .single();

  if (!file) notFound();

  const { data: urlData } = await supabase.storage
    .from("cad-files")
    .createSignedUrl(file.storage_path, 3600);

  return (
    <ViewerLoader
      fileId={file.id}
      fileName={file.file_name}
      fileUrl={urlData?.signedUrl ?? null}
    />
  );
}
