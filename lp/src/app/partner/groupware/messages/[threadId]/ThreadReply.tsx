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

    await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      recipient_id: recipientId,
      body,
    });

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
        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
      >
        送信
      </button>
    </form>
  );
}
