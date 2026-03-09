"use client";

export default function Hero() {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center sm:py-40">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          あなたのビジネスを
          <br />
          次のレベルへ
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
          プロが作成したデジタルテンプレートで、時間とコストを大幅に削減。
          今すぐダウンロードして、すぐに使い始められます。
        </p>
        <div className="mt-10">
          <button
            onClick={scrollToPricing}
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
          >
            今すぐ手に入れる
          </button>
        </div>
      </div>
    </section>
  );
}
