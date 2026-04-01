import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateRecurringStatus } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminRecurringDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = await supabase
    .from("recurring_orders")
    .select("*, products(name), partners(company_name), lots(lot_number, price)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const updateWithId = updateRecurringStatus.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">定期購入 詳細</h1>
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">商品:</span>{" "}
            <span className="font-medium">{(order.products as { name: string })?.name}</span>
          </div>
          <div>
            <span className="text-gray-500">ロット:</span>{" "}
            <span className="font-medium">{(order.lots as { lot_number: string })?.lot_number}</span>
          </div>
          <div>
            <span className="text-gray-500">顧客名:</span>{" "}
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div>
            <span className="text-gray-500">メール:</span>{" "}
            <span className="font-medium">{order.customer_email}</span>
          </div>
          <div>
            <span className="text-gray-500">頻度:</span>{" "}
            <span className="font-medium">{order.frequency}</span>
          </div>
          <div>
            <span className="text-gray-500">数量:</span>{" "}
            <span className="font-medium">{order.quantity}</span>
          </div>
          <div>
            <span className="text-gray-500">次回配送日:</span>{" "}
            <span className="font-medium">{order.next_delivery_date}</span>
          </div>
          <div>
            <span className="text-gray-500">累計配送回数:</span>{" "}
            <span className="font-medium">{order.total_deliveries}回</span>
          </div>
          <div>
            <span className="text-gray-500">ステータス:</span>{" "}
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                order.status === "有効"
                  ? "bg-green-100 text-green-800"
                  : order.status === "一時停止"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <span className="text-gray-500">取引先:</span>{" "}
            <span className="font-medium">
              {(order.partners as { company_name: string })?.company_name ?? "-"}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">ステータス変更</p>
          <div className="flex gap-2">
            {order.status !== "有効" && (
              <form action={updateWithId}>
                <input type="hidden" name="status" value="有効" />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  有効にする
                </button>
              </form>
            )}
            {order.status === "有効" && (
              <form action={updateWithId}>
                <input type="hidden" name="status" value="一時停止" />
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium"
                >
                  一時停止
                </button>
              </form>
            )}
            {order.status !== "解約" && (
              <form action={updateWithId}>
                <input type="hidden" name="status" value="解約" />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  解約
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
