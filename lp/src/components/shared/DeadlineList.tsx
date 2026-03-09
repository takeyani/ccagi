type DeadlineItem = {
  id: string;
  label: string;
  date: string;
  link: string;
  type: string;
};

function getDeadlineColor(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff <= 0) return "text-red-600 bg-red-50";
  if (diff <= 3) return "text-orange-600 bg-orange-50";
  if (diff <= 7) return "text-yellow-600 bg-yellow-50";
  return "text-gray-600 bg-gray-50";
}

export function DeadlineList({
  items,
  emptyMessage = "期限間近の項目はありません",
}: {
  items: DeadlineItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-gray-400 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.link}
          className={`block rounded-lg px-3 py-2 text-sm ${getDeadlineColor(item.date)} hover:opacity-80`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{item.label}</span>
              <span className="ml-2 text-xs opacity-70">{item.type}</span>
            </div>
            <span className="text-xs font-medium">{item.date}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
