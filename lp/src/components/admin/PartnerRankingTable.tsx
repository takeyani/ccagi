type RankItem = {
  partner_id: string;
  company_name: string;
  total_sales: number;
};

export function PartnerRankingTable({ rankings }: { rankings: RankItem[] }) {
  if (rankings.length === 0) {
    return <p className="text-gray-400 text-sm">データがありません</p>;
  }

  const maxSales = Math.max(...rankings.map((r) => r.total_sales), 1);

  return (
    <div className="space-y-3">
      {rankings.map((r, i) => (
        <div key={r.partner_id} className="flex items-center gap-3 text-sm">
          <span className="w-6 text-center font-bold text-gray-500">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="font-medium truncate">{r.company_name}</span>
              <span className="font-bold whitespace-nowrap">
                &yen;{r.total_sales.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(r.total_sales / maxSales) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
