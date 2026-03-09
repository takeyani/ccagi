import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteThread, deletePost } from "../actions";
import type { BoardThread, BoardPost } from "@/lib/types";

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function AdminThreadDetailPage({ params }: Props) {
  const { threadId } = await params;
  const supabase = await createSupabaseServerClient();

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

  const deleteThreadWithId = deleteThread.bind(null, threadId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {thread.author_name} &middot;{" "}
            {new Date(thread.created_at).toLocaleDateString("ja-JP")}
          </p>
        </div>
        <form action={deleteThreadWithId}>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            スレッド削除
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {(posts as BoardPost[] | null)?.map((post) => {
          const deletePostWithIds = deletePost.bind(null, post.id, threadId);
          return (
            <div
              key={post.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {post.author_name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleString("ja-JP")}
                  </span>
                  <form action={deletePostWithIds}>
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {post.body}
              </p>
            </div>
          );
        })}

        {(!posts || posts.length === 0) && (
          <p className="text-sm text-gray-400 text-center py-8">
            まだ投稿がありません
          </p>
        )}
      </div>
    </div>
  );
}
