import Link from "next/link";

export const metadata = { title: "紹介ガイド - 紹介の仕方" };

export default function ReferralGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">紹介ガイド</h1>
          <p className="mt-3 text-gray-600">
            メーカー・代理店・クリエイターをプラットフォームに紹介して報酬を得る方法
          </p>
        </div>

        {/* 紹介の全体像 */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">紹介の仕組み</h2>
          <p className="text-sm text-gray-600 mb-6">
            アフィリエイト登録をして紹介リンクを発行するだけで、誰でも紹介者になれます。
            紹介先がプラットフォームに登録・販売を開始すると、売上に対して報酬が発生します。
          </p>
          <div className="bg-orange-50/40 rounded-xl p-6">
            <div className="flex items-center justify-between text-center text-sm">
              <div>
                <div className="w-14 h-14 mx-auto bg-orange-100/60 rounded-full flex items-center justify-center text-2xl mb-2">👤</div>
                <p className="text-xs font-bold text-orange-700">あなた</p>
                <p className="text-[10px] text-orange-500">紹介者</p>
              </div>
              <div className="text-orange-400 text-xl">&rarr;</div>
              <div>
                <div className="w-14 h-14 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">🏭</div>
                <p className="text-xs font-bold text-blue-700">メーカー</p>
              </div>
              <div className="text-orange-400 text-xl">&rarr;</div>
              <div>
                <div className="w-14 h-14 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-2xl mb-2">🏢</div>
                <p className="text-xs font-bold text-purple-700">代理店</p>
              </div>
              <div className="text-orange-400 text-xl">&rarr;</div>
              <div>
                <div className="w-14 h-14 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-2xl mb-2">🎨</div>
                <p className="text-xs font-bold text-pink-700">クリエイター</p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: 紹介者になる */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <h2 className="text-lg font-bold text-gray-900">紹介者になる（共通）</h2>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 ml-11">
            <li>
              <Link href="/affiliate" className="text-orange-600 hover:underline font-medium">アフィリエイト登録ページ</Link>
              で名前・メールアドレスを入力
            </li>
            <li>アフィリエイトコードと紹介リンクが発行されます</li>
            <li>紹介リンク例: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">https://lot-lp.vercel.app/?ref=あなたのコード</code></li>
          </ol>
        </section>

        {/* メーカーを紹介 */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">🏭</span>
            <h2 className="text-lg font-bold text-gray-900">メーカーを紹介する</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-bold text-blue-800 mb-1">報酬</p>
              <p className="text-blue-700">紹介したメーカーの売上に対して <span className="font-bold text-blue-900">1%</span> の紹介報酬が継続的に発生</p>
            </div>
            <h3 className="font-bold text-gray-900">手順</h3>
            <ol className="space-y-2 ml-4 list-decimal">
              <li>紹介リンクにロールパラメータを追加して共有:<br/>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">https://lot-lp.vercel.app/signup?role=maker&ref=あなたのコード</code>
              </li>
              <li>メーカーがリンクから新規登録すると、あなたのアフィリエイトIDが紐付けられます</li>
              <li>紹介したメーカーの商品が売れるたびに、売上の1%が報酬として蓄積されます</li>
            </ol>
            <h3 className="font-bold text-gray-900">こんな方をご紹介ください</h3>
            <ul className="space-y-1 ml-4 list-disc text-gray-600">
              <li>自社商品を持つメーカー・製造業者</li>
              <li>農家・生産者</li>
              <li>輸入業者・卸売業者</li>
              <li>ハンドメイド作家・D2Cブランド</li>
            </ul>
          </div>
        </section>

        {/* 代理店を紹介 */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg">🏢</span>
            <h2 className="text-lg font-bold text-gray-900">代理店を紹介する</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="font-bold text-purple-800 mb-1">報酬</p>
              <p className="text-purple-700">紹介した代理店の売上に対して <span className="font-bold text-purple-900">2%</span> の紹介報酬が継続的に発生</p>
            </div>
            <h3 className="font-bold text-gray-900">手順</h3>
            <ol className="space-y-2 ml-4 list-decimal">
              <li>紹介リンクを共有:<br/>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">https://lot-lp.vercel.app/signup?role=agent&ref=あなたのコード</code>
              </li>
              <li>代理店が登録後、メーカーに商品の販売承認をリクエスト</li>
              <li>承認後に代理店が商品を販売 → あなたに2%の報酬</li>
            </ol>
            <h3 className="font-bold text-gray-900">こんな方をご紹介ください</h3>
            <ul className="space-y-1 ml-4 list-disc text-gray-600">
              <li>既存の販売チャネルを持つ事業者</li>
              <li>小売店・セレクトショップ</li>
              <li>法人営業のネットワークを持つ企業</li>
            </ul>
          </div>
        </section>

        {/* クリエイターを紹介 */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-lg">🎨</span>
            <h2 className="text-lg font-bold text-gray-900">クリエイターを紹介する</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="font-bold text-pink-800 mb-1">報酬（グループ紹介フィー）</p>
              <p className="text-pink-700">紹介したクリエイターの売上に対して <span className="font-bold text-pink-900">2%</span> のグループ紹介フィー（通常の紹介ポイントとは別枠）</p>
            </div>
            <h3 className="font-bold text-gray-900">手順</h3>
            <ol className="space-y-2 ml-4 list-decimal">
              <li>アフィリエイト登録ページのリンクを共有:<br/>
                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">https://lot-lp.vercel.app/affiliate</code>
              </li>
              <li>クリエイター候補が登録時に「クリエイターとして登録する」にチェック</li>
              <li>クリエイターがメーカーに販売許可をリクエスト → LP作成 → 商品販売</li>
              <li>クリエイターの売上に対して2%のフィーが発生</li>
            </ol>
            <h3 className="font-bold text-gray-900">こんな方をご紹介ください</h3>
            <ul className="space-y-1 ml-4 list-disc text-gray-600">
              <li>SNSインフルエンサー（Instagram/YouTube/TikTok/X）</li>
              <li>ブロガー・ライター</li>
              <li>映像クリエイター</li>
              <li>デザイナー・イラストレーター</li>
            </ul>
          </div>
        </section>

        {/* 報酬まとめ */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">報酬まとめ</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">紹介先</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">報酬率</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">報酬対象</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">発生条件</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 font-medium">メーカー</td>
                  <td className="px-4 py-3 font-bold text-blue-600">1%</td>
                  <td className="px-4 py-3 text-gray-600">メーカーの全売上</td>
                  <td className="px-4 py-3 text-gray-600">紹介リンクから登録</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">代理店</td>
                  <td className="px-4 py-3 font-bold text-purple-600">2%</td>
                  <td className="px-4 py-3 text-gray-600">代理店の全売上</td>
                  <td className="px-4 py-3 text-gray-600">紹介リンクから登録</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">クリエイター</td>
                  <td className="px-4 py-3 font-bold text-pink-600">2%</td>
                  <td className="px-4 py-3 text-gray-600">クリエイターの売上</td>
                  <td className="px-4 py-3 text-gray-600">グループ紹介フィー</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">一般購入者</td>
                  <td className="px-4 py-3 font-bold text-amber-600">2%</td>
                  <td className="px-4 py-3 text-gray-600">購入金額</td>
                  <td className="px-4 py-3 text-gray-600">紹介リンクから購入</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ※ 1段階のみの紹介制度です。連鎖販売（マルチレベル）ではありません。
          </p>
        </section>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/affiliate"
            className="inline-block rounded-full bg-orange-600 px-8 py-3 text-sm font-bold text-white shadow hover:bg-orange-700 transition"
          >
            紹介者として登録する &rarr;
          </Link>
          <div className="flex justify-center gap-4">
            <Link href="/guide/start" className="text-sm text-orange-600 hover:underline">
              はじめての方はこちら
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
