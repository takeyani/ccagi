"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

const ROLES = [
  {
    value: "maker",
    label: "メーカー",
    icon: "🏭",
    desc: "自社商品を出品・販売する",
    role: "partner",
    partnerType: "メーカー",
  },
  {
    value: "agent",
    label: "販売代理店",
    icon: "🏢",
    desc: "メーカー商品を仕入れて販売する",
    role: "partner",
    partnerType: "代理店",
  },
  {
    value: "buyer",
    label: "バイヤー",
    icon: "🛒",
    desc: "商品を購入・再販する",
    role: "buyer",
    partnerType: null,
  },
] as const;

export function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") ?? "";
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // アフィリエイト紹介コードをlocalStorage/URLから取得
  const getRefCode = () => {
    const urlRef = searchParams.get("ref");
    if (urlRef) return urlRef;
    if (typeof window !== "undefined") return localStorage.getItem("affiliate_ref");
    return null;
  };
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("登録するアカウントの種類を選択してください。");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError("パスワードは8文字以上で、英字と数字を含めてください。");
      return;
    }

    setLoading(true);
    const roleDef = ROLES.find((r) => r.value === selectedRole);
    if (!roleDef) {
      setError("不正なロールです。");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            signup_role: roleDef.value,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: data.user.id,
            display_name: displayName,
            role: roleDef.role,
          });

        if (profileError) {
          setError("プロフィールの作成に失敗しました。再度お試しください。");
          setLoading(false);
          return;
        }

        if (roleDef.role === "partner" && roleDef.partnerType) {
          const refCode = getRefCode();
          let referredByAffiliateId: string | null = null;

          if (refCode) {
            const { data: affiliate } = await supabase
              .from("affiliates")
              .select("id")
              .eq("code", refCode)
              .single();
            referredByAffiliateId = affiliate?.id ?? null;
          }

          await supabase.from("partners").upsert(
            {
              user_id: data.user.id,
              company_name: displayName,
              partner_type: roleDef.partnerType,
              certification_status: "未認証",
              ...(referredByAffiliateId ? { referred_by_affiliate_id: referredByAffiliateId } : {}),
            },
            { onConflict: "user_id" }
          );
        }

        setSuccess(true);
        setTimeout(() => {
          if (roleDef.role === "buyer") {
            router.push("/buyer");
          } else {
            router.push("/partner");
          }
        }, 1500);
      } else {
        setError("登録に失敗しました。再度お試しください。");
        setLoading(false);
      }
    } catch {
      setError("予期しないエラーが発生しました。");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">アカウントが作成されました</p>
        <p className="text-xs text-gray-500">ダッシュボードに移動します...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ロール選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アカウントの種類
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelectedRole(r.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-center ${
                selectedRole === r.value
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="text-xs font-bold text-gray-900">{r.label}</span>
              <span className="text-[10px] text-gray-500 leading-tight">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {selectedRole === "maker" || selectedRole === "agent"
            ? "会社名 / 屋号"
            : "表示名"}
        </label>
        <input
          id="displayName"
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={
            selectedRole === "maker" || selectedRole === "agent"
              ? "株式会社○○"
              : "山田太郎"
          }
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          パスワード
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="8文字以上（英字+数字）"
        />
        {password && !PASSWORD_REGEX.test(password) && (
          <p className="text-xs text-amber-600 mt-1">8文字以上、英字と数字を含めてください</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !selectedRole}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
      >
        {loading ? "登録中..." : "新規登録"}
      </button>
    </form>
  );
}
