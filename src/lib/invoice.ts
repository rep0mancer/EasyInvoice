import {
  BusinessProfile,
  Customer,
  CustomerDraft,
  Invoice,
  InvoiceDraft,
  LineItem,
} from '../types';
import { generateId } from './storage';

export function formatInvoiceNumber(sequence: number, date = new Date()): string {
  return `INV-${date.getFullYear()}-${sequence.toString().padStart(3, '0')}`;
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function dueDateIso(days = 14): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export function formatDisplayDate(value: string): string {
  return new Date(value).toLocaleDateString('de-AT');
}

export function formatCurrency(value: number): string {
  return `${value.toFixed(2)} €`;
}

export function createEmptyBusinessProfile(): BusinessProfile {
  return {
    companyName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'AT',
    vatId: '',
    phone: '',
    email: '',
    logo: '',
  };
}

export function createEmptyCustomerDraft(): CustomerDraft {
  return {
    name: '',
    address: '',
    vatId: '',
  };
}

export function createLineItem(): LineItem {
  return {
    id: generateId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 20,
  };
}

export function createInvoiceDraft(
  sequence: number,
  customerId: string | null = null,
): InvoiceDraft {
  return {
    customerId,
    invoiceNumber: formatInvoiceNumber(sequence),
    invoiceDate: todayIso(),
    dueDate: dueDateIso(),
    items: [createLineItem()],
    notes: '',
    createdInvoiceId: null,
  };
}

export function calculateInvoiceTotals(items: LineItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
    0,
  );

  return {
    subtotal,
    vatTotal,
    total: subtotal + vatTotal,
  };
}

export function buildInvoiceFromDraft(
  draft: InvoiceDraft,
  customer: Customer,
): Invoice {
  const totals = calculateInvoiceTotals(draft.items);

  return {
    id: generateId(),
    invoiceNumber: draft.invoiceNumber,
    invoiceDate: draft.invoiceDate,
    dueDate: draft.dueDate,
    customer,
    items: draft.items,
    notes: draft.notes,
    paid: false,
    createdAt: new Date().toISOString(),
    ...totals,
  };
}

export function hasRequiredProfile(profile: BusinessProfile | null): profile is BusinessProfile {
  return Boolean(
    profile &&
    profile.companyName &&
    profile.address &&
    profile.city &&
    profile.postalCode,
  );
}
