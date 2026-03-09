type Props = {
  body: string;
  senderName: string;
  createdAt: string;
  isOwn: boolean;
};

export function MessageBubble({ body, senderName, createdAt, isOwn }: Props) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        <p
          className={`text-xs mt-1 ${isOwn ? "text-indigo-200" : "text-gray-400"}`}
        >
          {new Date(createdAt).toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
}
