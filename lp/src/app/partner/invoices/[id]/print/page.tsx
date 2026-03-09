import { notFound } from "next/navigation";
import { requirePartnerId } from "@/lib/auth";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partnerId, supabase } = await requirePartnerId();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .eq("partner_id", partnerId)
    .single();

  if (!invoice) notFound();

  const { data: partner } = await supabase
    .from("partners")
    .select("company_name, postal_code, address, phone")
    .eq("id", partnerId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any;
  const items = (inv.invoice_items ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <html>
      <head>
        <title>請求書 {inv.document_number}</title>
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
              .reg-number { background: #f8f8f8; border: 1px solid #ccc; padding: 4px 8px; margin-top: 8px; display: inline-block; font-size: 11px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #999; padding: 4px 8px; }
              th { background: #f5f5f5; font-size: 11px; }
              .text-right { text-align: right; }
              .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
              .totals dl { width: 280px; }
              .totals dt, .totals dd { display: inline-block; width: 49%; margin: 2px 0; }
              .totals dt { text-align: left; color: #666; }
              .totals dd { text-align: right; }
              .totals .grand { font-weight: bold; font-size: 14px; border-top: 2px solid #333; padding-top: 4px; margin-top: 4px; }
              .tax-breakdown { margin-top: 16px; border: 1px solid #ccc; padding: 12px; font-size: 11px; }
              .tax-breakdown table { margin-top: 4px; }
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
          <h1>請 求 書</h1>

          <div className="header">
            <div className="buyer">
              <div className="buyer-name">
                {inv.buyer_company_name} 御中
              </div>
              {inv.buyer_contact_name && <p>{inv.buyer_contact_name} 様</p>}
              {inv.buyer_postal_code && <p>〒{inv.buyer_postal_code}</p>}
              {inv.buyer_address && <p>{inv.buyer_address}</p>}
              <p style={{ marginTop: "12px" }}>件名: {inv.subject}</p>
            </div>
            <div className="meta">
              <p>請求番号: {inv.document_number}</p>
              <p>発行日: {inv.issue_date}</p>
              {inv.due_date && <p>支払期限: {inv.due_date}</p>}
              <div className="seller">
                <p className="seller-name">{partner?.company_name}</p>
                {partner?.postal_code && <p>〒{partner.postal_code}</p>}
                {partner?.address && <p>{partner.address}</p>}
                {partner?.phone && <p>TEL: {partner.phone}</p>}
                {inv.invoice_registration_number && (
                  <div className="reg-number">
                    登録番号: {inv.invoice_registration_number}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "14px", marginBottom: "8px" }}>
            合計金額: <strong style={{ fontSize: "18px" }}>&yen;{inv.total.toLocaleString()}</strong>（税込）
          </p>

          <table>
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>品名</th>
                <th style={{ width: "60px" }}>数量</th>
                <th style={{ width: "40px" }}>単位</th>
                <th style={{ width: "80px" }}>単価</th>
                <th style={{ width: "50px" }}>税率</th>
                <th style={{ width: "90px" }}>金額</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: { item_name: string; quantity: number; unit: string; unit_price: number; tax_rate: number; amount: number }, i: number) => (
                <tr key={i}>
                  <td className="text-right">{i + 1}</td>
                  <td>
                    {it.item_name}
                    {Number(it.tax_rate) === 8 && <span style={{ fontSize: "10px", color: "#666" }}> ※</span>}
                  </td>
                  <td className="text-right">{it.quantity}</td>
                  <td>{it.unit}</td>
                  <td className="text-right">&yen;{it.unit_price.toLocaleString()}</td>
                  <td className="text-right">{Number(it.tax_rate)}%</td>
                  <td className="text-right">&yen;{it.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 税率別内訳（インボイス制度対応） */}
          <div className="tax-breakdown">
            <strong>税率別内訳</strong>
            <table>
              <thead>
                <tr>
                  <th>税率</th>
                  <th>対象金額</th>
                  <th>消費税額</th>
                </tr>
              </thead>
              <tbody>
                {inv.tax_10_total > 0 && (
                  <tr>
                    <td>10%</td>
                    <td className="text-right">
                      &yen;{(inv.subtotal - (inv.tax_8_total > 0 ? Math.round(inv.subtotal * inv.tax_8_total / inv.tax_total) : 0)).toLocaleString()}
                    </td>
                    <td className="text-right">&yen;{inv.tax_10_total.toLocaleString()}</td>
                  </tr>
                )}
                {inv.tax_8_total > 0 && (
                  <tr>
                    <td>8% ※軽減税率</td>
                    <td className="text-right">
                      &yen;{(inv.tax_8_total > 0 ? Math.round(inv.subtotal * inv.tax_8_total / inv.tax_total) : 0).toLocaleString()}
                    </td>
                    <td className="text-right">&yen;{inv.tax_8_total.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {inv.tax_8_total > 0 && (
              <p style={{ marginTop: "4px", fontSize: "10px", color: "#666" }}>※ 軽減税率対象品目</p>
            )}
          </div>

          <div className="totals">
            <dl>
              <dt>小計</dt>
              <dd>&yen;{inv.subtotal.toLocaleString()}</dd>
              <dt>消費税合計</dt>
              <dd>&yen;{inv.tax_total.toLocaleString()}</dd>
              <dt className="grand">合計</dt>
              <dd className="grand">&yen;{inv.total.toLocaleString()}</dd>
            </dl>
          </div>

          {inv.payment_terms && (
            <p style={{ marginTop: "16px", fontSize: "11px" }}>お支払条件: {inv.payment_terms}</p>
          )}

          {inv.notes && (
            <div className="notes">
              <strong>備考</strong>
              <br />
              {inv.notes}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
