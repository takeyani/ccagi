import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export default async function DeliverySlipPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: slip } = await supabase
    .from("delivery_slips")
    .select("*, delivery_slip_items(*)")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!slip) notFound();

  const { data: partner } = await supabase
    .from("partners")
    .select("company_name, postal_code, address, phone")
    .eq("id", partnerId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = slip as any;
  const items = (ds.delivery_slip_items ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <html>
      <head>
        <title>納品書 {ds.document_number}</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
              body { font-family: "Hiragino Sans", "Meiryo", sans-serif; font-size: 12px; color: #333; }
              .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 20mm; box-sizing: border-box; }
              h1 { text-align: center; font-size: 22px; letter-spacing: 8px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 24px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
              .buyer { flex: 1; }
              .buyer-name { font-size: 16px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 4px; }
              .meta { text-align: right; font-size: 11px; }
              .meta p { margin: 2px 0; }
              .seller { margin-top: 12px; text-align: right; font-size: 11px; }
              .seller-name { font-weight: bold; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #999; padding: 4px 8px; }
              th { background: #f5f5f5; font-size: 11px; }
              .text-right { text-align: right; }
              .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
              .totals dl { width: 240px; }
              .totals dt, .totals dd { display: inline-block; width: 49%; margin: 2px 0; }
              .totals dt { text-align: left; color: #666; }
              .totals dd { text-align: right; }
              .totals .grand { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 4px; margin-top: 4px; }
              .notes { margin-top: 24px; border: 1px solid #ccc; padding: 12px; font-size: 11px; white-space: pre-wrap; }
            `,
          }}
        />
      </head>
      <body>
        <div className="no-print" style={{ textAlign: "center", padding: "8px" }}>
          <button id="print-btn" style={{ padding: "8px 24px", fontSize: "14px", cursor: "pointer" }}>
            印刷する
          </button>
          <script dangerouslySetInnerHTML={{ __html: `document.getElementById("print-btn").onclick=function(){window.print()}` }} />
        </div>
        <div className="page">
          <h1>納 品 書</h1>

          <div className="header">
            <div className="buyer">
              <div className="buyer-name">
                {ds.buyer_company_name} 御中
              </div>
              {ds.buyer_contact_name && <p>{ds.buyer_contact_name} 様</p>}
              {ds.buyer_postal_code && <p>〒{ds.buyer_postal_code}</p>}
              {ds.buyer_address && <p>{ds.buyer_address}</p>}
              <p style={{ marginTop: "12px" }}>件名: {ds.subject}</p>
            </div>
            <div className="meta">
              <p>納品番号: {ds.document_number}</p>
              <p>発行日: {ds.issue_date}</p>
              {ds.delivery_date && <p>納品日: {ds.delivery_date}</p>}
              <div className="seller">
                <p className="seller-name">{partner?.company_name}</p>
                {partner?.postal_code && <p>〒{partner.postal_code}</p>}
                {partner?.address && <p>{partner.address}</p>}
                {partner?.phone && <p>TEL: {partner.phone}</p>}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>品名</th>
                <th style={{ width: "60px" }}>数量</th>
                <th style={{ width: "40px" }}>単位</th>
                <th style={{ width: "80px" }}>単価</th>
                <th style={{ width: "90px" }}>金額</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: { item_name: string; quantity: number; unit: string; unit_price: number; amount: number }, i: number) => (
                <tr key={i}>
                  <td className="text-right">{i + 1}</td>
                  <td>{it.item_name}</td>
                  <td className="text-right">{it.quantity}</td>
                  <td>{it.unit}</td>
                  <td className="text-right">&yen;{it.unit_price.toLocaleString()}</td>
                  <td className="text-right">&yen;{it.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <dl>
              <dt>小計</dt>
              <dd>&yen;{ds.subtotal.toLocaleString()}</dd>
              <dt>消費税</dt>
              <dd>&yen;{ds.tax_total.toLocaleString()}</dd>
              <dt className="grand">合計</dt>
              <dd className="grand">&yen;{ds.total.toLocaleString()}</dd>
            </dl>
          </div>

          {ds.notes && (
            <div className="notes">
              <strong>備考</strong>
              <br />
              {ds.notes}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
