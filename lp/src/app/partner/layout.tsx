import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PartnerSidebar } from "@/components/partner/Sidebar";
import { NotificationBell } from "@/components/shared/NotificationBell";

const navItems = [
  { href: "/partner", label: "ダッシュボード", icon: "📊" },
  { href: "/partner/products", label: "商品管理", icon: "📦" },
  { href: "/partner/lots", label: "ロット管理", icon: "🏷️" },
  { href: "/partner/auctions", label: "オークション", icon: "🔨" },
  { href: "/partner/inquiries", label: "引合い管理", icon: "📨" },
  { href: "/partner/approvals", label: "承認", icon: "✔️" },
  { href: "/partner/quotes", label: "見積書", icon: "📝" },
  { href: "/partner/invoices", label: "請求書", icon: "🧾" },
  { href: "/partner/delivery-slips", label: "納品書", icon: "📄" },
  { href: "/partner/proofs", label: "証明チェーン", icon: "🔗" },
  { href: "/partner/proofs/entity", label: "主体証明", icon: "🪪" },
  { href: "/partner/proofs/product", label: "商品証明", icon: "🧪" },
  { href: "/partner/proofs/inventory", label: "在庫証明", icon: "📍" },
  { href: "/partner/proofs/delivery", label: "配送証明", icon: "🚚" },
  { href: "/partner/profile", label: "プロフィール", icon: "🏢" },
  { href: "/partner/members", label: "メンバー", icon: "👥" },
  { href: "/partner/groupware/announcements", label: "お知らせ", icon: "📢" },
  { href: "/partner/groupware/messages", label: "メッセージ", icon: "💬" },
  { href: "/partner/groupware/tasks", label: "タスク", icon: "✅" },
  { href: "/partner/groupware/files", label: "ファイル", icon: "📁" },
  { href: "/partner/groupware/calendar", label: "カレンダー", icon: "📅" },
  { href: "/partner/groupware/activity", label: "活動ログ", icon: "📋" },
  { href: "/partner/groupware/notifications", label: "通知", icon: "🔔" },
];

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name, partner_id")
    .eq("id", user!.id)
    .single();

  let companyName = "";
  if (profile?.partner_id) {
    const { data: partner } = await supabase
      .from("partners")
      .select("company_name")
      .eq("id", profile.partner_id)
      .single();
    companyName = partner?.company_name ?? "";
  }

  // 通知取得
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, link, is_read, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">取引先ポータル</h2>
          <p className="text-sm text-gray-500 mt-1">
            {companyName || profile?.display_name || user!.email}
          </p>
        </div>
        <PartnerSidebar items={navItems} />
        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-8 py-3 flex items-center justify-end">
          <NotificationBell
            notifications={notifications ?? []}
            unreadCount={unreadCount ?? 0}
            userId={user!.id}
            notificationsPath="/partner/groupware/notifications"
          />
        </header>
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
