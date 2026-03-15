import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          料金体系
        </h2>
        <p className="mt-4 text-gray-600">
          固定費ゼロ。売れた時だけ手数料が発生するシンプルな成果報酬型
        </p>

        <div className="mx-auto mt-12 grid md:grid-cols-3 gap-6 max-w-3xl">
          {/* 初期費用 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-sm font-semibold text-gray-500 mb-2">初期費用</p>
            <div className="text-4xl font-extrabold text-indigo-600 mb-2">
              &yen;0
            </div>
            <p className="text-sm text-gray-500">
              サイト構築費・導入費は一切不要。登録だけで即日開始
            </p>
          </div>

          {/* 月額費用 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm font-semibold text-gray-500 mb-2">月額費用</p>
            <div className="text-4xl font-extrabold text-indigo-600 mb-2">
              &yen;0
            </div>
            <p className="text-sm text-gray-500">
              サーバー費・保守費・基本利用料はすべて無料
            </p>
          </div>

          {/* 成果報酬 */}
          <div className="rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-semibold text-indigo-600 mb-2">手数料</p>
            <div className="text-4xl font-extrabold text-indigo-600 mb-2">
              成果報酬型
            </div>
            <p className="text-sm text-gray-500">
              商品が売れた時だけ手数料が発生。売上ゼロならコストもゼロ
            </p>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl mx-auto shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">含まれる機能（すべて無料）</h3>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              "商品・在庫管理",
              "5層プルーフチェーン",
              "AIエージェント検索",
              "Stripe決済連携",
              "LP作成ツール",
              "アフィリエイト機能",
              "帳票管理（見積・請求・納品）",
              "オークション・自動入札",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-indigo-600">&#10003;</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700"
          >
            無料で登録する
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            アカウント登録は無料・即日利用可能
          </p>
        </div>
      </div>
    </section>
  );
}
