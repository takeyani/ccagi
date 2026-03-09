import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("cad_user_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <SettingsForm
        profile={profile ?? { display_name: "", email: user!.email ?? "" }}
      />
    </div>
  );
}
