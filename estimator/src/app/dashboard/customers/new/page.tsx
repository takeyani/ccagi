import Link from "next/link";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/customers"
          className="text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">顧客を追加</h1>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <CustomerForm action={createCustomer} submitLabel="追加" />
      </div>
    </div>
  );
}
