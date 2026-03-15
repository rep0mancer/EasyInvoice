export interface InvoiceInputItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateTotals(items: InvoiceInputItem[]) {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const vatTotal = roundCurrency(
    items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
      0,
    ),
  );

  return {
    subtotal,
    vatTotal,
    total: roundCurrency(subtotal + vatTotal),
  };
}

export function formatInvoiceNumber(sequence: number, invoiceDate: Date): string {
  return `INV-${invoiceDate.getFullYear()}-${sequence.toString().padStart(3, '0')}`;
}

export function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toIsoDate(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString().split('T')[0] : undefined;
}
