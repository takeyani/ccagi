import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnnouncementCard } from "@/components/groupware/AnnouncementCard";

export default async function PartnerAnnouncementsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">お知らせ</h1>
      <div className="space-y-4">
        {announcements?.map((a) => (
          <AnnouncementCard
            key={a.id}
            title={a.title}
            body={a.body}
            publishedAt={a.published_at}
            isPublished={a.is_published}
          />
        ))}
        {!announcements?.length && (
          <p className="text-gray-400">お知らせはありません</p>
        )}
      </div>
    </div>
  );
}
