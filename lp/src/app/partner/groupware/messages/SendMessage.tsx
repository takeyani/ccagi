"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PartnerSendMessage() {
  const [recipients, setRecipients] = useState<
    { id: string; display_name: string }[]
  >([]);
  const [recipientId, setRecipientId] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    // Show admin users for partner to contact
    supabase
      .from("user_profiles")
      .select("id, display_name")
      .eq("role", "admin")
      .then(({ data }) => {
        if (data) setRecipients(data);
      });
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !body) return;
    setSending(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const threadId = crypto.randomUUID();
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
    <form
      onSubmit={handleSend}
      className="bg-white rounded-2xl border shadow-sm p-4 max-w-xl space-y-3"
    >
      <select
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        required
      >
        <option value="">-- 送信先を選択 --</option>
        {recipients.map((r) => (
          <option key={r.id} value={r.id}>
            {r.display_name ?? r.id}
          </option>
        ))}
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="メッセージを入力..."
        rows={3}
        required
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
      >
        {sending ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
