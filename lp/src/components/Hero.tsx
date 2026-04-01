import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center sm:py-40">
        <p className="text-sm font-semibold tracking-widest text-white/80 uppercase mb-4">
          初期費用0円 &middot; 月額0円 &middot; 成果報酬型
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          単品決済ロットLP
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
          メーカーの在庫をロット・賞味期限単位で掲載し、
          バイヤーが箱単位で購入できる卸売プラットフォーム。
          5層プルーフチェーンで品質を証明し、選ばれる理由を作ります。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
          >
            無料で始める
          </Link>
          <Link
            href="/guide/start"
            className="inline-block rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10"
          >
            はじめてガイド
          </Link>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/flow" className="text-sm text-white/70 hover:text-white transition underline underline-offset-4">
            業務フローを見る
          </Link>
          <Link href="/guide/referral" className="text-sm text-white/70 hover:text-white transition underline underline-offset-4">
            紹介して報酬を得る
          </Link>
        </div>
      </div>
    </section>
  );
}
