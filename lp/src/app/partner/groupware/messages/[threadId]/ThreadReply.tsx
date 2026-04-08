"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ThreadReply({
  threadId,
  recipientId,
}: {
  threadId: string;
  recipientId: string;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body) return;
    setSending(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      recipient_id: recipientId,
      body,
    });

    if (error) {
      alert("返信に失敗しました: " + error.message);
      setSending(false);
      return;
    }

    setBody("");
    setSending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="返信を入力..."
        required
        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
      >
        送信
      </button>
    </form>
  );
}
