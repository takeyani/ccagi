type StatusCount = {
  label: string;
  count: number;
  color: string;
};

export function DocumentStatusSummary({
  title,
  statuses,
}: {
  title: string;
  statuses: StatusCount[];
}) {
  const total = statuses.reduce((s, st) => s + st.count, 0);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      <p className="text-2xl font-bold mb-3">{total} 件</p>
      {total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-3">
          {statuses
            .filter((s) => s.count > 0)
            .map((s) => (
              <div
                key={s.label}
                className={`${s.color}`}
                style={{ flex: s.count }}
              />
            ))}
        </div>
      )}
      <div className="space-y-1">
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${s.color}`} />
              <span className="text-gray-600">{s.label}</span>
            </div>
            <span className="font-medium">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
