const features = [
  {
    icon: "🛡️",
    title: "5層プルーフチェーン",
    description:
      "L1〜L5の多層認証で商品の品質・安全性を証明。バイヤーが安心して購入でき、選ばれる理由になります。",
  },
  {
    icon: "📦",
    title: "ロット・在庫単位の掲載",
    description:
      "賞味期限・製造日が一致した在庫単位で商品を掲載。バイヤーは箱単位（1箱〜）で柔軟に購入可能。",
  },
  {
    icon: "🤖",
    title: "AIエージェント購入",
    description:
      "バイヤーが条件（認証・成分・スペック）を設定すると、AIが最適な商品を自動で検索・提案します。",
  },
  {
    icon: "🎨",
    title: "LP作成ツール",
    description:
      "メーカーから販売許可を取得し、卸値に利益を乗せたLPをノーコードで作成。差分がクリエイターの利益に。",
  },
  {
    icon: "💳",
    title: "Stripe決済連携",
    description:
      "セキュアなStripe決済でスムーズに取引完了。クレジットカード情報は安全に保護されます。",
  },
  {
    icon: "💰",
    title: "完全無料で始められる",
    description:
      "初期費用0円・月額0円。商品が売れた時だけ手数料が発生する成果報酬型。リスクゼロで導入できます。",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          選ばれる6つの理由
        </h2>
        <p className="mt-4 text-center text-gray-600">
          5層プルーフチェーンによる品質証明が、購買の意思決定を支えます
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
