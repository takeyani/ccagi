"use client";

type Settings = {
  company_name: string;
  company_address: string;
  phone: string;
  email: string;
  default_unit_price: number;
  default_discount_rate: number;
} | null;

type Props = {
  settings: Settings;
  action: (formData: FormData) => void;
};

export function SettingsForm({ settings, action }: Props) {
  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
          会社名
        </label>
        <input
          id="company_name"
          name="company_name"
          defaultValue={settings?.company_name ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
          住所
        </label>
        <input
          id="company_address"
          name="company_address"
          defaultValue={settings?.company_address ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={settings?.phone ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={settings?.email ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="default_unit_price" className="block text-sm font-medium text-gray-700 mb-1">
            デフォルト単価（円/人月）
          </label>
          <input
            id="default_unit_price"
            name="default_unit_price"
            type="number"
            defaultValue={settings?.default_unit_price ?? 700000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="default_discount_rate" className="block text-sm font-medium text-gray-700 mb-1">
            デフォルト割引率（%）
          </label>
          <input
            id="default_discount_rate"
            name="default_discount_rate"
            type="number"
            step="0.01"
            defaultValue={settings?.default_discount_rate ?? 30.0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
      >
        保存
      </button>
    </form>
  );
}
