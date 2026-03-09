import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FileUploadForm } from "@/components/dashboard/FileUploadForm";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase
    .from("cad_projects")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/dashboard/projects"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          プロジェクト
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {project.name}
        </Link>
        <span className="text-gray-400">/</span>
      </div>
      <h1 className="text-2xl font-bold mb-6">ファイルアップロード</h1>

      <FileUploadForm projectId={id} />
    </div>
  );
}
