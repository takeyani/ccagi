import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/dashboard/DataTable";
import { DeleteProjectButton } from "@/components/dashboard/DeleteProjectButton";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase
    .from("cad_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: files } = await supabase
    .from("cad_files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const columns = [
    { key: "file_name", label: "ファイル名" },
    {
      key: "file_size",
      label: "サイズ",
      render: (item: { file_size: number }) => formatBytes(item.file_size),
    },
    {
      key: "version",
      label: "バージョン",
      render: (item: { version: number }) => `v${item.version}`,
    },
    {
      key: "created_at",
      label: "アップロード日",
      render: (item: { created_at: string }) =>
        new Date(item.created_at).toLocaleDateString("ja-JP"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/projects"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              プロジェクト
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/projects/${id}/upload`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            ファイルアップロード
          </Link>
          <DeleteProjectButton projectId={id} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={files ?? []}
        editHref={(item) => `/dashboard/viewer/${item.id}`}
        editLabel="3D表示"
      />
    </div>
  );
}
