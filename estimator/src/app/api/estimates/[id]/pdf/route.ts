import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  EstimatePdfDocument,
  type PdfEstimateData,
} from "@/lib/pdf/EstimatePdfDocument";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch estimate
  const { data: estimate } = await supabase
    .from("estimator_estimates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!estimate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch items
  const { data: items } = await supabase
    .from("estimator_estimate_items")
    .select("*")
    .eq("estimate_id", id)
    .order("phase_sort_order")
    .order("task_sort_order");

  // Fetch company settings
  const { data: settings } = await supabase
    .from("estimator_company_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const pdfData: PdfEstimateData = {
    estimateNumber: estimate.estimate_number,
    title: estimate.title,
    createdAt: new Date(estimate.created_at).toLocaleDateString("ja-JP"),
    validUntil: estimate.valid_until
      ? new Date(estimate.valid_until).toLocaleDateString("ja-JP")
      : null,
    customerCompanyName: estimate.customer_company_name ?? "",
    customerContactName: estimate.customer_contact_name ?? "",
    companyName: settings?.company_name ?? "",
    companyAddress: settings?.company_address ?? "",
    companyPhone: settings?.phone ?? "",
    companyEmail: settings?.email ?? "",
    items: (items ?? []).map((item) => ({
      phaseKey: item.phase_key,
      phaseName: item.phase_name,
      taskName: item.task_name,
      adjustedManMonths: Number(item.adjusted_man_months),
      unitPrice: item.unit_price,
      amount: item.amount,
      isIncluded: item.is_included,
    })),
    totalManMonths: Number(estimate.total_man_months),
    subtotal: estimate.subtotal,
    discountRate: Number(estimate.discount_rate),
    discountAmount: estimate.discount_amount,
    total: estimate.total,
    notes: estimate.notes ?? "",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(EstimatePdfDocument, { data: pdfData }) as any
  );

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${estimate.estimate_number}.pdf"`,
    },
  });
}
