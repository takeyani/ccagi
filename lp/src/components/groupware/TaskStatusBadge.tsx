type Props = {
  status: string;
  priority?: string;
};

export function TaskStatusBadge({ status, priority }: Props) {
  const statusColor =
    status === "完了"
      ? "bg-green-100 text-green-700"
      : status === "進行中"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-600";

  const priorityColor =
    priority === "高"
      ? "bg-red-100 text-red-700"
      : priority === "低"
        ? "bg-gray-100 text-gray-500"
        : "";

  return (
    <div className="flex gap-1">
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}
      >
        {status}
      </span>
      {priority && priorityColor && (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColor}`}
        >
          {priority}
        </span>
      )}
    </div>
  );
}
