import Image from "next/image";

// メンテナンスモード: この変数を false に戻すとサイトを再公開
const MAINTENANCE = false;

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ecosystem from "@/components/Ecosystem";
import Features from "@/components/Features";
import TrustProof from "@/components/TrustProof";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  if (MAINTENANCE) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <Image src="/logo.png" alt="Cross Infinity" width={80} height={80} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800">Cross Infinity</h1>
          <p className="mt-4 text-gray-500">現在準備中です。しばらくお待ちください。</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <Hero />
      <Ecosystem />
      <Features />
      <TrustProof />
      <Pricing />
      <Footer />
    </main>
  );
}
