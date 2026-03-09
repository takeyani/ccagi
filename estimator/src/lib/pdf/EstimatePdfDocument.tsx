import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a Japanese font
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: 40,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metaLeft: {
    width: "48%",
  },
  metaRight: {
    width: "48%",
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    borderBottom: "2px solid #333",
    paddingBottom: 4,
  },
  sama: {
    fontSize: 10,
    fontWeight: 400,
  },
  totalBox: {
    backgroundColor: "#f0f4ff",
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a8a",
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#374151",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  colPhase: { width: "15%" },
  colTask: { width: "30%" },
  colManMonths: { width: "13%", textAlign: "right" },
  colUnitPrice: { width: "17%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  headerText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#fff",
  },
  cellText: {
    fontSize: 8,
  },
  cellBold: {
    fontSize: 8,
    fontWeight: 700,
  },
  summaryBox: {
    alignSelf: "flex-end",
    width: 250,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginVertical: 4,
  },
  discountText: {
    color: "#dc2626",
  },
  summaryTotal: {
    fontSize: 12,
    fontWeight: 700,
  },
  notesSection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: "#555",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#999",
  },
  excludedRow: {
    opacity: 0.4,
    textDecoration: "line-through",
  },
});

function formatNum(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export type PdfEstimateData = {
  estimateNumber: string;
  title: string;
  createdAt: string;
  validUntil: string | null;
  customerCompanyName: string;
  customerContactName: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  items: {
    phaseKey: string;
    phaseName: string;
    taskName: string;
    adjustedManMonths: number;
    unitPrice: number;
    amount: number;
    isIncluded: boolean;
  }[];
  totalManMonths: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  notes: string;
};

export function EstimatePdfDocument({ data }: { data: PdfEstimateData }) {
  let lastPhase = "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>御 見 積 書</Text>

        <View style={styles.metaRow}>
          {/* Left: Customer */}
          <View style={styles.metaLeft}>
            <Text style={styles.customerName}>
              {data.customerCompanyName || "（顧客名）"}
              <Text style={styles.sama}> 御中</Text>
            </Text>
            {data.customerContactName && (
              <Text style={styles.value}>
                {data.customerContactName} 様
              </Text>
            )}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>御見積金額（税抜）</Text>
              <Text style={styles.totalValue}>
                ¥{formatNum(data.total)}
              </Text>
            </View>
          </View>

          {/* Right: Company */}
          <View style={styles.metaRight}>
            <Text style={styles.label}>見積番号</Text>
            <Text style={styles.value}>{data.estimateNumber}</Text>
            <Text style={styles.label}>見積日</Text>
            <Text style={styles.value}>{data.createdAt}</Text>
            {data.validUntil && (
              <>
                <Text style={styles.label}>有効期限</Text>
                <Text style={styles.value}>{data.validUntil}</Text>
              </>
            )}
            <Text style={styles.label}>件名</Text>
            <Text style={styles.value}>{data.title}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.companyName}>{data.companyName}</Text>
              {data.companyAddress && (
                <Text style={styles.value}>{data.companyAddress}</Text>
              )}
              {data.companyPhone && (
                <Text style={styles.value}>TEL: {data.companyPhone}</Text>
              )}
              {data.companyEmail && (
                <Text style={styles.value}>{data.companyEmail}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colPhase}>
              <Text style={styles.headerText}>工程</Text>
            </View>
            <View style={styles.colTask}>
              <Text style={styles.headerText}>タスク</Text>
            </View>
            <View style={styles.colManMonths}>
              <Text style={styles.headerText}>工数(人月)</Text>
            </View>
            <View style={styles.colUnitPrice}>
              <Text style={styles.headerText}>単価(円)</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.headerText}>金額(円)</Text>
            </View>
          </View>

          {data.items
            .filter((item) => item.isIncluded)
            .map((item, idx) => {
              const showPhase = item.phaseKey !== lastPhase;
              if (showPhase) lastPhase = item.phaseKey;
              return (
                <View
                  key={`${item.phaseKey}-${item.taskName}`}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <View style={styles.colPhase}>
                    <Text style={showPhase ? styles.cellBold : styles.cellText}>
                      {showPhase ? item.phaseName : ""}
                    </Text>
                  </View>
                  <View style={styles.colTask}>
                    <Text style={styles.cellText}>{item.taskName}</Text>
                  </View>
                  <View style={styles.colManMonths}>
                    <Text style={styles.cellText}>
                      {item.adjustedManMonths.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.colUnitPrice}>
                    <Text style={styles.cellText}>
                      ¥{formatNum(item.unitPrice)}
                    </Text>
                  </View>
                  <View style={styles.colAmount}>
                    <Text style={styles.cellText}>
                      ¥{formatNum(item.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.cellText}>合計工数</Text>
            <Text style={styles.cellBold}>
              {data.totalManMonths.toFixed(2)} 人月
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.cellText}>小計</Text>
            <Text style={styles.cellText}>¥{formatNum(data.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.cellText, styles.discountText]}>
              割引（{data.discountRate}%OFF）
            </Text>
            <Text style={[styles.cellText, styles.discountText]}>
              -¥{formatNum(data.discountAmount)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>合計金額（税抜）</Text>
            <Text style={styles.summaryTotal}>¥{formatNum(data.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          本見積書の有効期限は発行日から30日間です。金額は税抜表示となっております。
        </Text>
      </Page>
    </Document>
  );
}
