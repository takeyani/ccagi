import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-amber-300 to-orange-300 text-white">
      <div className="absolute inset-0 bg-black/5" />
      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center sm:py-40">
        <Image src="/logo.png" alt="Cross Infinity" width={96} height={96} className="mx-auto mb-6 bg-white rounded-2xl p-2 shadow-xl" />
        <p className="text-sm font-semibold tracking-widest text-white/90 uppercase mb-4">
          初期費用0円 &middot; 月額0円 &middot; 成果報酬型
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Cross Infinity
        </h1>
        <p className="mt-3 text-base text-white/90 sm:text-lg">
          一人も企業も、無限の可能性を持っている。
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/95 sm:text-lg">
          ∞をクロスすると、四葉のクローバーになる。
          メーカー・代理店・クリエイター・バイヤー、すべての参加者が交わり、
          幸せの循環を生み出すマーケットプレイス。
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
          オレンジは、挑戦するすべての人へ贈る応援と温かさのシンボル。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-orange-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
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
