import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { BoardThread, BoardPost } from "@/lib/types";
import { NewPostForm } from "@/components/boards/NewPostForm";

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function ThreadPage({ params }: Props) {
  const { threadId } = await params;
  const supabase = getSupabase();

  const { data: thread } = await supabase
    .from("board_threads")
    .select("*")
    .eq("id", threadId)
    .single<BoardThread>();

  if (!thread) notFound();

  const { data: posts } = await supabase
    .from("board_posts")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  // 戻りリンク用：ロットの場合は商品slug取得
  let backHref = "/";
  if (thread.target_type === "lot") {
    const { data: lot } = await supabase
      .from("lots")
      .select("id, product_id")
      .eq("id", thread.target_id)
      .single();
    if (lot) {
      const { data: product } = await supabase
        .from("products")
        .select("slug")
        .eq("id", lot.product_id)
        .single();
      if (product) {
        backHref = `/products/${product.slug}/${lot.id}`;
      }
    }
  } else if (thread.target_type === "product") {
    const { data: product } = await supabase
      .from("products")
      .select("slug")
      .eq("id", thread.target_id)
      .single();
    if (product) {
      backHref = `/products/${product.slug}`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8">
          <Link
            href={backHref}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; 戻る
          </Link>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {thread.author_name} &middot;{" "}
          {new Date(thread.created_at).toLocaleDateString("ja-JP")}
        </p>

        <div className="mt-8 space-y-4">
          {(posts as BoardPost[])?.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {post.author_name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {post.body}
              </p>
            </div>
          ))}

          {(!posts || posts.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-8">
              まだ投稿がありません
            </p>
          )}
        </div>

        <div className="mt-8">
          <NewPostForm threadId={threadId} />
        </div>
      </div>
    </div>
  );
}
