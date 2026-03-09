import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Sidebar } from "@/components/admin/Sidebar";
import { NotificationBell } from "@/components/shared/NotificationBell";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/partners", label: "取引先", icon: "🏢" },
  { href: "/admin/products", label: "商品", icon: "📦" },
  { href: "/admin/lots", label: "ロット", icon: "🏷️" },
  { href: "/admin/tags", label: "タグ", icon: "#️⃣" },
  { href: "/admin/auctions", label: "オークション", icon: "🔨" },
  { href: "/admin/orders", label: "注文", icon: "🧾" },
  { href: "/admin/quotes", label: "見積書", icon: "📝" },
  { href: "/admin/invoices", label: "請求書", icon: "🧾" },
  { href: "/admin/delivery-slips", label: "納品書", icon: "📄" },
  { href: "/admin/affiliates", label: "アフィリエイト", icon: "🤝" },
  { href: "/admin/creator-designs", label: "Creator LP", icon: "🎨" },
  { href: "/admin/proofs", label: "証明チェーン", icon: "🔗" },
  { href: "/admin/proofs/entity", label: "主体証明", icon: "🪪" },
  { href: "/admin/proofs/product", label: "商品証明", icon: "🧪" },
  { href: "/admin/proofs/inventory", label: "在庫証明", icon: "📍" },
  { href: "/admin/proofs/ownership", label: "所有証明", icon: "📜" },
  { href: "/admin/proofs/delivery", label: "配送証明", icon: "🚚" },
  { href: "/admin/buying-agents", label: "購買エージェント", icon: "🤖" },
  { href: "/admin/surveys", label: "アンケート", icon: "🗳️" },
  { href: "/admin/boards", label: "掲示板", icon: "📌" },
  { href: "/admin/rankings", label: "ランキング", icon: "🏆" },
  { href: "/admin/groupware/announcements", label: "お知らせ", icon: "📢" },
  { href: "/admin/groupware/messages", label: "メッセージ", icon: "💬" },
  { href: "/admin/groupware/tasks", label: "タスク", icon: "✅" },
  { href: "/admin/groupware/files", label: "ファイル", icon: "📁" },
  { href: "/admin/groupware/calendar", label: "カレンダー", icon: "📅" },
  { href: "/admin/groupware/activity", label: "活動ログ", icon: "📋" },
  { href: "/admin/groupware/notifications", label: "通知", icon: "🔔" },
];

export default async function AdminLayout({
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
    .select("display_name")
    .eq("id", user!.id)
    .single();

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
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">管理ダッシュボード</h2>
          <p className="text-sm text-gray-400 mt-1">
            {profile?.display_name ?? user!.email}
          </p>
        </div>
        <Sidebar items={navItems} />
        <div className="p-4 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-8 py-3 flex items-center justify-end">
          <NotificationBell
            notifications={notifications ?? []}
            unreadCount={unreadCount ?? 0}
            userId={user!.id}
            notificationsPath="/admin/groupware/notifications"
          />
        </header>
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
