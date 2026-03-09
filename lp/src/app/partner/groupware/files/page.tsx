import { requirePartnerId } from "@/lib/auth";
import { FileUploader } from "@/components/groupware/FileUploader";

export default async function PartnerFilesPage() {
  const { partnerId, supabase } = await requirePartnerId();

  // Show files uploaded by this partner or shared with them
  const { data: files } = await supabase
    .from("shared_files")
    .select("*, user_profiles!shared_files_uploaded_by_fkey(display_name)")
    .or(`partner_id.eq.${partnerId},partner_id.is.null`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ファイル</h1>
        <FileUploader partnerId={partnerId} />
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                ファイル名
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                アップロード者
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                サイズ
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                日時
              </th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {files?.map((f) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const uploader =
                (f.user_profiles as any)?.display_name ?? "不明";
              const sizeKB = f.file_size
                ? `${Math.round(f.file_size / 1024)} KB`
                : "-";
              return (
                <tr
                  key={f.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{f.file_name}</td>
                  <td className="px-4 py-3">{uploader}</td>
                  <td className="px-4 py-3">{sizeKB}</td>
                  <td className="px-4 py-3">
                    {new Date(f.created_at).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={f.file_path}
                      download
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      DL
                    </a>
                  </td>
                </tr>
              );
            })}
            {!files?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  ファイルはありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
