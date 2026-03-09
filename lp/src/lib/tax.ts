export function calculateItemAmounts(
  quantity: number,
  unitPrice: number,
  taxRate: number
): { amount: number; taxAmount: number } {
  const amount = quantity * unitPrice;
  const taxAmount = Math.floor(amount * taxRate / 100);
  return { amount, taxAmount };
}

export type LineItem = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  taxAmount: number;
};

export function calculateDocumentTotals(items: LineItem[]): {
  subtotal: number;
  taxTotal: number;
  tax10Total: number;
  tax8Total: number;
  total: number;
} {
  let subtotal = 0;
  let tax10Total = 0;
  let tax8Total = 0;

  for (const item of items) {
    subtotal += item.amount;
    if (item.taxRate === 10) {
      tax10Total += item.taxAmount;
    } else if (item.taxRate === 8) {
      tax8Total += item.taxAmount;
    }
  }

  const taxTotal = tax10Total + tax8Total;
  return { subtotal, taxTotal, tax10Total, tax8Total, total: subtotal + taxTotal };
}
