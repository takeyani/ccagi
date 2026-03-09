type Props = {
  title: string;
  body: string;
  publishedAt: string | null;
  isPublished: boolean;
};

export function AnnouncementCard({
  title,
  body,
  publishedAt,
  isPublished,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {!isPublished && (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            下書き
          </span>
        )}
      </div>
      {publishedAt && (
        <p className="text-xs text-gray-400 mb-3">
          {new Date(publishedAt).toLocaleString("ja-JP")}
        </p>
      )}
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{body}</p>
    </div>
  );
}
