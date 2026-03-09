import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/dashboard/Sidebar";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/dashboard/estimates", label: "見積もり一覧", icon: "📝" },
  { href: "/dashboard/customers", label: "顧客管理", icon: "🏢" },
  { href: "/dashboard/settings", label: "設定", icon: "⚙️" },
  { href: "/dashboard/guide", label: "見積もりガイド", icon: "📖" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("estimator_user_profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">見積もりツール</h2>
          <p className="text-sm text-gray-400 mt-1">
            {profile?.display_name ?? user!.email}
          </p>
        </div>
        <Sidebar items={navItems} />
        <div className="p-4 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
