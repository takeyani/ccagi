import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PartnerSendMessage } from "./SendMessage";

export default async function PartnerMessagesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, user_profiles!messages_sender_id_fkey(display_name)")
    .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const threadMap = new Map<
    string,
    { threadId: string; lastMessage: string; senderName: string; createdAt: string; unread: number }
  >();

  messages?.forEach((m) => {
    if (!threadMap.has(m.thread_id)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = m.user_profiles as any;
      threadMap.set(m.thread_id, {
        threadId: m.thread_id,
        lastMessage: m.body,
        senderName: profile?.display_name ?? "不明",
        createdAt: m.created_at,
        unread: !m.is_read && m.recipient_id === user!.id ? 1 : 0,
      });
    } else {
      const t = threadMap.get(m.thread_id)!;
      if (!m.is_read && m.recipient_id === user!.id) t.unread++;
    }
  });

  const threads = Array.from(threadMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">メッセージ</h1>
      <div className="space-y-2">
        {threads.map((t) => (
          <Link
            key={t.threadId}
            href={`/partner/groupware/messages/${t.threadId}`}
            className="block bg-white rounded-2xl border shadow-sm p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{t.senderName}</span>
                {t.unread > 0 && (
                  <span className="ml-2 inline-block bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {t.unread}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(t.createdAt).toLocaleString("ja-JP")}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {t.lastMessage}
            </p>
          </Link>
        ))}
        {threads.length === 0 && (
          <p className="text-gray-400">メッセージはありません</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">新しいメッセージ</h2>
        <PartnerSendMessage />
      </div>
    </div>
  );
}
