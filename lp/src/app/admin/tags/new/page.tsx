import { createTag } from "../actions";

const TAG_TYPES = ["生産者", "メーカー", "カテゴリ", "キーワード"] as const;

export default function NewTagPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">タグ 新規作成</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createTag} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ名 *
              </label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スラッグ *
              </label>
              <input
                name="slug"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイプ *
              </label>
              <select
                name="tag_type"
                required
                defaultValue="キーワード"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {TAG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                並び順
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <input
              name="image_url"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input name="is_active" type="checkbox" defaultChecked />
            <span className="text-sm">有効</span>
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
