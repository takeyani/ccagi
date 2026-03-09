import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessageBubble } from "@/components/groupware/MessageBubble";
import { ThreadReply } from "./ThreadReply";

export default async function PartnerThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: messages } = await supabase
    .from("messages")
    .select("*, user_profiles!messages_sender_id_fkey(display_name)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  // Mark as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("thread_id", threadId)
    .eq("recipient_id", user!.id)
    .eq("is_read", false);

  const otherUserId =
    messages?.find((m) => m.sender_id !== user!.id)?.sender_id ??
    messages?.find((m) => m.recipient_id !== user!.id)?.recipient_id;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">スレッド</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl">
        <div className="space-y-1 mb-6 max-h-96 overflow-y-auto">
          {messages?.map((m) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const profile = m.user_profiles as any;
            return (
              <MessageBubble
                key={m.id}
                body={m.body}
                senderName={profile?.display_name ?? "不明"}
                createdAt={m.created_at}
                isOwn={m.sender_id === user!.id}
              />
            );
          })}
        </div>
        {otherUserId && (
          <ThreadReply threadId={threadId} recipientId={otherUserId} />
        )}
      </div>
    </div>
  );
}
