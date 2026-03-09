import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { saveSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("estimator_company_settings")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">会社情報設定</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-4">
          PDF出力時に表示される会社情報を設定します。
        </p>
        <SettingsForm settings={settings} action={saveSettings} />
      </div>
    </div>
  );
}
