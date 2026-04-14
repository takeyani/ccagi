import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PartnerSidebar } from "@/components/partner/Sidebar";
import { MobileMenu } from "@/components/shared/MobileMenu";
import { BetaBanner } from "@/components/BetaBanner";

const navItems = [
  { href: "/partner", label: "ダッシュボード", icon: "📊" },
  { href: "/partner/products", label: "商品管理", icon: "📦" },
  { href: "/partner/lots", label: "ロット管理", icon: "🏷️" },
  { href: "/partner/recurring", label: "定期購入", icon: "🔄" },
  { href: "/partner/auctions", label: "オークション", icon: "🔨" },
  { href: "/partner/wholesale", label: "卸価格", icon: "💴" },
  { href: "/partner/inquiries", label: "引合い管理", icon: "📨" },
  { href: "/partner/questions", label: "商品Q&A", icon: "❓" },
  { href: "/partner/authorizations", label: "商品承認", icon: "🔐" },
  { href: "/partner/approvals", label: "書類承認", icon: "✔️" },
  { href: "/partner/quotes", label: "見積書", icon: "📝" },
  { href: "/partner/invoices", label: "請求書", icon: "🧾" },
  { href: "/partner/delivery-slips", label: "納品書", icon: "📄" },
  { href: "/partner/proofs", label: "証明チェーン", icon: "🔗" },
  { href: "/partner/sales-agent", label: "販売エージェント", icon: "🤖" },
  { href: "/partner/lp-analytics", label: "LPアクセス分析", icon: "📊" },
  { href: "/partner/step-mail", label: "ステップメール", icon: "📧" },
  { href: "/partner/non-financial", label: "非財務インサイト", icon: "🙏" },
  { href: "/partner/profile", label: "プロフィール", icon: "🏢" },
  { href: "/partner/members", label: "メンバー", icon: "👥" },
];

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 認証チェック（redirect は try-catch の外で行う）
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("display_name, partner_id")
    .eq("id", user.id)
    .maybeSingle();

  let partnerId = profile?.partner_id;
  if (!partnerId && profile) {
    const { data: newPartner } = await admin
      .from("partners")
      .insert({
        company_name: profile.display_name || "パートナー",
        partner_type: "メーカー",
        certification_status: "未認証",
      })
      .select("id")
      .single();

    if (newPartner) {
      partnerId = newPartner.id;
      await admin
        .from("user_profiles")
        .update({ partner_id: newPartner.id })
        .eq("id", user.id);
    }
  }

  let displayName = "";
  if (partnerId) {
    const { data: partner } = await admin
      .from("partners")
      .select("company_name")
      .eq("id", partnerId)
      .maybeSingle();
    displayName = partner?.company_name ?? "";
  }
  displayName = displayName || profile?.display_name || user.email || "";

  return (
    <div className="flex min-h-screen">
      <MobileMenu items={navItems} title="取引先ポータル" displayName={displayName} />
      <aside className="hidden md:flex w-64 bg-white border-r flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">取引先ポータル</h2>
          <p className="text-sm text-gray-500 mt-1">{displayName}</p>
        </div>
        <PartnerSidebar items={navItems} />
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
