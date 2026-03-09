import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnnouncementCard } from "@/components/groupware/AnnouncementCard";

export default async function AdminAnnouncementsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">お知らせ管理</h1>
        <Link
          href="/admin/groupware/announcements/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>
      <div className="space-y-4">
        {announcements?.map((a) => (
          <Link
            key={a.id}
            href={`/admin/groupware/announcements/${a.id}`}
            className="block"
          >
            <AnnouncementCard
              title={a.title}
              body={a.body}
              publishedAt={a.published_at}
              isPublished={a.is_published}
            />
          </Link>
        ))}
        {!announcements?.length && (
          <p className="text-gray-400">お知らせはありません</p>
        )}
      </div>
    </div>
  );
}
