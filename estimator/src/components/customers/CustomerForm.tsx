"use client";

type Customer = {
  id?: string;
  company_name: string;
  department: string;
  contact_name: string;
  email: string;
  phone: string;
  postal_code: string;
  address: string;
  memo: string;
};

type Props = {
  customer?: Customer;
  action: (formData: FormData) => void;
  submitLabel: string;
};

export function CustomerForm({ customer, action, submitLabel }: Props) {
  const fields: { name: string; label: string; required?: boolean; type?: string }[] = [
    { name: "company_name", label: "会社名", required: true },
    { name: "department", label: "部署" },
    { name: "contact_name", label: "担当者名" },
    { name: "email", label: "メールアドレス", type: "email" },
    { name: "phone", label: "電話番号", type: "tel" },
    { name: "postal_code", label: "郵便番号" },
    { name: "address", label: "住所" },
  ];

  return (
    <form action={action} className="space-y-4 max-w-2xl">
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={"type" in field ? field.type : "text"}
            required={field.required}
            defaultValue={customer?.[field.name as keyof Customer] as string ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      ))}
      <div>
        <label
          htmlFor="memo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={3}
          defaultValue={customer?.memo ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
      >
        {submitLabel}
      </button>
    </form>
  );
}
