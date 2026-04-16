import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { BuyerSidebar } from "@/components/buyer/Sidebar";
import { MobileMenu } from "@/components/shared/MobileMenu";
import { BetaBanner } from "@/components/BetaBanner";

const navItems = [
  { href: "/buyer", label: "ダッシュボード", icon: "📊" },
  { href: "/buyer/agents", label: "購買エージェント", icon: "🤖" },
  { href: "/buyer/auto-bids", label: "自動入札履歴", icon: "⚡" },
  { href: "/buyer/inquiries", label: "注文リスト", icon: "📋" },
  { href: "/buyer/orders", label: "購入履歴", icon: "🧾" },
];

async function getBuyerData() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    return { displayName: profile?.display_name || user.email || "" };
  } catch {
    return null;
  }
}

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getBuyerData();
  if (!data) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <MobileMenu items={navItems} title="購買ポータル" displayName={data.displayName} />
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">購買ポータル</h2>
          <p className="text-sm text-gray-500 mt-1">{data.displayName}</p>
        </div>
        <BuyerSidebar items={navItems} />
        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <BetaBanner />
        <main className="flex-1 bg-gray-50 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
