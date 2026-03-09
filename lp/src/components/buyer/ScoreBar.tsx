type Props = {
  label: string;
  value: number;
};

export function ScoreBar({ label, value }: Props) {
  const numValue = Number(value);
  const color =
    numValue >= 70
      ? "bg-teal-500"
      : numValue >= 40
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, numValue))}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-8 text-right">
        {numValue.toFixed(0)}
      </span>
    </div>
  );
}
