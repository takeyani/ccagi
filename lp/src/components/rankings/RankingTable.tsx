type RankItem = {
  rank: number;
  name: string;
  subLabel?: string;
  value: number;
  formattedValue: string;
};

type Props = {
  items: RankItem[];
  valueLabel: string;
};

export function RankingTable({ items, valueLabel }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        データがありません
      </p>
    );
  }

  const maxValue = Math.max(...items.map((r) => r.value), 1);

  return (
    <div className="space-y-3">
      <div className="flex text-xs text-gray-500 font-medium px-2">
        <span className="w-8">#</span>
        <span className="flex-1">名前</span>
        <span className="w-32 text-right">{valueLabel}</span>
      </div>
      {items.map((item) => (
        <div
          key={`${item.rank}-${item.name}`}
          className="flex items-center gap-3 text-sm bg-white rounded-xl border p-3 shadow-sm"
        >
          <span
            className={`w-8 text-center font-bold ${
              item.rank <= 3 ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            {item.rank}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <div className="truncate">
                <span className="font-medium">{item.name}</span>
                {item.subLabel && (
                  <span className="text-gray-400 text-xs ml-2">
                    {item.subLabel}
                  </span>
                )}
              </div>
              <span className="font-bold whitespace-nowrap ml-4">
                {item.formattedValue}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
