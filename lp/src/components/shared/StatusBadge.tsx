const STATUS_STYLES: Record<string, string> = {
  // 汎用
  "有効": "bg-green-100 text-green-800",
  "無効": "bg-gray-100 text-gray-600",
  "販売中": "bg-green-100 text-green-700",
  "売切れ": "bg-gray-100 text-gray-600",
  "期限切れ": "bg-red-100 text-red-700",
  // 承認系
  "承認済み": "bg-green-100 text-green-800",
  "申請中": "bg-yellow-100 text-yellow-800",
  "却下": "bg-red-100 text-red-700",
  "認証済み": "bg-green-100 text-green-800",
  "未認証": "bg-gray-100 text-gray-600",
  // 帳票系
  "下書き": "bg-gray-100 text-gray-600",
  "送付済み": "bg-blue-100 text-blue-800",
  "入金済み": "bg-green-100 text-green-800",
  "承諾": "bg-green-100 text-green-800",
  "辞退": "bg-red-100 text-red-700",
  "期限超過": "bg-red-100 text-red-700",
  "取消": "bg-gray-100 text-gray-600",
  "発行済み": "bg-green-100 text-green-800",
  // 定期購入
  "一時停止": "bg-yellow-100 text-yellow-800",
  "解約": "bg-gray-100 text-gray-600",
  // オークション
  "出品中": "bg-blue-100 text-blue-800",
  "落札済み": "bg-green-100 text-green-800",
  "キャンセル": "bg-gray-100 text-gray-600",
  // 引合い
  "新規": "bg-blue-100 text-blue-800",
  "対応中": "bg-yellow-100 text-yellow-800",
  // エージェント
  "未確認": "bg-yellow-100 text-yellow-800",
  "確認済み": "bg-blue-100 text-blue-800",
  "購入済み": "bg-green-100 text-green-800",
  // 証明
  "未検証": "bg-gray-100 text-gray-600",
  "検証済み": "bg-green-100 text-green-800",
  "失効": "bg-red-100 text-red-700",
  // Q&A
  "未回答": "bg-yellow-100 text-yellow-800",
  "回答済み": "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
