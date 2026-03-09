import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Column = {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
};

type Props = {
  columns: Column[];
  data: Record<string, any>[];
  keyField?: string;
  editHref?: (item: any) => string;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function DataTable({
  columns,
  data,
  keyField = "id",
  editHref,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {col.label}
                </th>
              ))}
              {editHref && <th className="px-4 py-3 w-20" />}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (editHref ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={String(item[keyField])}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? "")}
                    </td>
                  ))}
                  {editHref && (
                    <td className="px-4 py-3">
                      <Link
                        href={editHref(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        編集
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
