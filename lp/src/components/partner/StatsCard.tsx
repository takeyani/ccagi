type Props = {
  label: string;
  value: string | number;
  sub?: string;
};

export function PartnerStatsCard({ label, value, sub }: Props) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
