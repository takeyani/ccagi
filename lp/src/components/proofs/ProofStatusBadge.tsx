const colorMap: Record<string, string> = {
  未検証: "bg-yellow-100 text-yellow-700",
  検証済み: "bg-green-100 text-green-700",
  失効: "bg-red-100 text-red-700",
  確定: "bg-green-100 text-green-700",
  仮確定: "bg-yellow-100 text-yellow-700",
  取消: "bg-gray-100 text-gray-500",
  準備中: "bg-gray-100 text-gray-600",
  発送済み: "bg-blue-100 text-blue-700",
  配達中: "bg-indigo-100 text-indigo-700",
  配達完了: "bg-green-100 text-green-700",
  受領確認済み: "bg-emerald-100 text-emerald-700",
};

export function ProofStatusBadge({ status }: { status: string }) {
  const color = colorMap[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
}
