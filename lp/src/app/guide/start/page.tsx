import Link from "next/link";

export const metadata = { title: "はじめてガイド - ご利用の流れ" };

const ROLES = [
  {
    id: "buyer",
    icon: "🛒",
    label: "商品を購入したい",
    color: "emerald",
    description: "商品を購入するだけなら、アカウント登録なしでもOK。商品ページから直接購入できます。",
    steps: [
      "トップページや商品一覧から気になる商品を探す",
      "商品ページで「今すぐ購入する」をクリック",
      "Stripe決済画面でお支払い → 購入完了",
    ],
    advanced: {
      label: "バイヤーアカウントを作ると...",
      features: [
        "AIエージェントが条件に合う商品を自動で探してくれる",
        "購入履歴の管理・注文一覧の確認",
        "購入した商品を所有権付きで再出品",
      ],
      cta: { label: "バイヤー登録", href: "/signup?role=buyer" },
    },
  },
  {
    id: "referrer",
    icon: "📢",
    label: "商品を紹介して報酬を得たい",
    color: "amber",
    description: "紹介リンクを共有するだけで、購入金額の2%がポイントとして還元されます。",
    steps: [
      "アフィリエイト登録で紹介コードを取得",
      "紹介リンクをSNS・ブログ・LINEなどで共有",
      "リンクから誰かが商品を購入 → 売上の2%をポイント獲得",
      "ポイントはプラットフォーム内の商品購入に使える",
    ],
    advanced: null,
    cta: { label: "アフィリエイト登録", href: "/affiliate" },
  },
  {
    id: "creator",
    icon: "🎨",
    label: "自分のLPで商品を売りたい",
    color: "pink",
    description: "メーカー商品のLPを作成して、卸値との差額が利益に。仕入れ不要・在庫リスクなし。",
    steps: [
      "アフィリエイト登録で「クリエイターとして登録」にチェック",
      "クリエイターポータルでLP（ランディングページ）を作成",
      "メーカーに販売許可をリクエスト → 承認後にLP公開",
      "商品が売れると、販売価格と卸値の差額があなたの利益",
    ],
    advanced: null,
    cta: { label: "クリエイター登録", href: "/affiliate" },
  },
  {
    id: "maker",
    icon: "🏭",
    label: "自社商品を販売したい（メーカー）",
    color: "blue",
    description: "商品を登録するだけで、代理店やクリエイターが自動で販路を拡大してくれます。",
    steps: [
      "メーカーとして新規登録",
      "商品情報を登録（画像・価格・カテゴリ・仕様）",
      "ロット（在庫）を作成して販売開始",
      "代理店・クリエイターからの販売許可リクエストを承認",
      "購入が発生 → Stripe Connectで自動的に売上が入金",
    ],
    advanced: null,
    cta: { label: "メーカー登録", href: "/signup?role=maker" },
  },
  {
    id: "agent",
    icon: "🏢",
    label: "メーカー商品を仕入れて販売したい（代理店）",
    color: "purple",
    description: "メーカーの商品を卸価格で仕入れ、独自の価格で販売できます。在庫リスクなし。",
    steps: [
      "代理店として新規登録",
      "販売したい商品のメーカーに承認をリクエスト",
      "承認後、卸価格で商品を仕入れて販売",
      "販売価格と卸価格の差額が利益",
    ],
    advanced: null,
    cta: { label: "代理店登録", href: "/signup?role=agent" },
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-600" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", badge: "bg-pink-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-600" },
};

export default function StartGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">はじめてガイド</h1>
          <p className="mt-3 text-gray-600">
            あなたのやりたいことに合わせて、最適な始め方をご案内します
          </p>
        </div>

        <div className="space-y-6">
          {ROLES.map((role) => {
            const c = colorMap[role.color];
            return (
              <section
                key={role.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden`}
              >
                <div className={`${c.bg} ${c.border} border-b px-6 py-4 flex items-center gap-3`}>
                  <span className="text-2xl">{role.icon}</span>
                  <h2 className="text-lg font-bold text-gray-900">{role.label}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">{role.description}</p>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">ご利用の流れ</p>
                    <ol className="space-y-2">
                      {role.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className={`flex-shrink-0 w-5 h-5 ${c.badge} text-white rounded-full flex items-center justify-center text-[10px] font-bold`}>
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {role.advanced && (
                    <div className={`${c.bg} rounded-lg p-4 border ${c.border}`}>
                      <p className={`text-xs font-bold ${c.text} mb-2`}>{role.advanced.label}</p>
                      <ul className="space-y-1">
                        {role.advanced.features.map((f) => (
                          <li key={f} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className={c.text}>&#10003;</span> {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={role.advanced.cta.href}
                        className={`mt-3 inline-block ${c.badge} text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition`}
                      >
                        {role.advanced.cta.label} &rarr;
                      </Link>
                    </div>
                  )}

                  {"cta" in role && role.cta && !role.advanced && (
                    <Link
                      href={role.cta.href}
                      className={`inline-block ${c.badge} text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition`}
                    >
                      {role.cta.label} &rarr;
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* フッターリンク */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm text-gray-500">紹介して報酬を得たい方は</p>
          <Link
            href="/guide/referral"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 transition"
          >
            紹介ガイドを見る &rarr;
          </Link>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/flow" className="text-sm text-indigo-600 hover:underline">
              業務フローを見る
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
