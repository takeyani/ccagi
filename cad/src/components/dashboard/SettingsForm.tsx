"use client";

import { updateProfile } from "@/app/dashboard/settings/actions";

type Props = {
  profile: {
    display_name: string;
    email: string;
  };
};

export function SettingsForm({ profile }: Props) {
  return (
    <form action={updateProfile} className="space-y-4 max-w-xl">
      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          表示名
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
          {profile.email}
        </p>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
      >
        保存
      </button>
    </form>
  );
}
