import { createAnnouncement } from "../actions";

export default function NewAnnouncementPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">お知らせ 新規作成</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              本文 *
            </label>
            <textarea
              name="body"
              required
              rows={6}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input name="is_published" type="checkbox" />
            <span className="text-sm">公開する</span>
          </label>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            作成
          </button>
        </form>
      </div>
    </div>
  );
}
