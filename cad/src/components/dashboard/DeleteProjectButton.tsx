"use client";

import { deleteProject } from "@/app/dashboard/projects/actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  async function handleDelete() {
    if (!confirm("このプロジェクトを削除しますか？関連するファイルもすべて削除されます。")) {
      return;
    }
    await deleteProject(projectId);
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium text-sm"
    >
      削除
    </button>
  );
}
