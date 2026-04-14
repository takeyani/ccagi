import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DebugPage() {
  const checks: { name: string; status: string; detail: string }[] = [];

  // 1. Supabase Server Client
  try {
    const supabase = await createSupabaseServerClient();
    checks.push({ name: "createSupabaseServerClient", status: "OK", detail: "created" });

    // 2. getUser
    const { data: { user }, error } = await supabase.auth.getUser();
    checks.push({
      name: "auth.getUser",
      status: user ? "OK" : "NO_USER",
      detail: user ? `id: ${user.id}, email: ${user.email}` : `error: ${error?.message ?? "no session"}`,
    });
  } catch (e) {
    checks.push({ name: "supabase/getUser", status: "ERROR", detail: String(e) });
  }

  // 3. Admin Client
  try {
    const admin = createAdminClient();
    checks.push({ name: "createAdminClient", status: "OK", detail: "created" });

    // 4. user_profiles
    const { data, error } = await admin.from("user_profiles").select("id, role").limit(1);
    checks.push({
      name: "user_profiles query",
      status: data ? "OK" : "ERROR",
      detail: data ? `${data.length} rows` : `error: ${error?.message}`,
    });

    // 5. products
    const { data: prods, error: prodErr } = await admin.from("products").select("id, name").limit(1);
    checks.push({
      name: "products query",
      status: prods ? "OK" : "ERROR",
      detail: prods ? `${prods.length} rows` : `error: ${prodErr?.message}`,
    });

    // 6. partners
    const { data: partners, error: partErr } = await admin.from("partners").select("id").limit(1);
    checks.push({
      name: "partners query",
      status: partners ? "OK" : "ERROR",
      detail: partners ? `${partners.length} rows` : `error: ${partErr?.message}`,
    });
  } catch (e) {
    checks.push({ name: "admin queries", status: "ERROR", detail: String(e) });
  }

  // 7. ENV check
  checks.push({
    name: "SUPABASE_URL",
    status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING",
    detail: (process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) ?? "undefined") + "...",
  });
  checks.push({
    name: "SERVICE_ROLE_KEY",
    status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING",
    detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set (hidden)" : "undefined",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">System Debug</h1>
      <table className="bg-white rounded-lg border shadow-sm w-full max-w-2xl text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left">Check</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Detail</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.name} className="border-b">
              <td className="px-4 py-2 font-medium">{c.name}</td>
              <td className={`px-4 py-2 font-bold ${c.status === "OK" ? "text-green-600" : "text-red-600"}`}>{c.status}</td>
              <td className="px-4 py-2 text-gray-600 font-mono text-xs">{c.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
