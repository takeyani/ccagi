import { createAdvertiser } from "../actions";

export default function NewAdvertiserPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">広告主 新規登録</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <form action={createAdvertiser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                広告主名 *
              </label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="株式会社サンプル"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ドメイン *
              </label>
              <input
                name="domain"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                連絡先メール *
              </label>
              <input
                name="contact_email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コミッション率（%）
              </label>
              <input
                name="commission_rate"
                type="number"
                step="0.01"
                defaultValue={5}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cookie有効期間（日）
              </label>
              <input
                name="cookie_days"
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL（任意）
              </label>
              <input
                name="webhook_url"
                type="url"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            登録
          </button>
        </form>
      </div>
    </div>
  );
}
