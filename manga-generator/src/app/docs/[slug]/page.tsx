import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "./MarkdownRenderer";

const DOCS: Record<string, { title: string; file: string }> = {
  guide: { title: "漫画作成ガイド", file: "guide.md" },
};

export async function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug];
  return { title: doc?.title || "ドキュメント" };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  const filePath = path.join(process.cwd(), "docs", doc.file);
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-lg font-bold">
            漫画ジェネレーター
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-700">
            ドキュメント
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium">{doc.title}</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-white rounded-lg border p-8 shadow-sm">
          <MarkdownRenderer content={content} />
        </article>
        <div className="mt-6 text-sm">
          <Link href="/docs" className="text-blue-600 hover:underline">
            &larr; ドキュメント一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
