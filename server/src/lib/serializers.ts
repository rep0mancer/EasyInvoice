import { Invoice, InvoiceItem, Client, User } from '@prisma/client';
import { toIsoDate, formatInvoiceNumber } from './invoices.js';

type InvoiceRecord = Invoice & {
  client: Client;
  items: InvoiceItem[];
};

export function toBusinessProfile(user: User) {
  return {
    companyName: user.companyName ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country,
    vatId: user.vatId ?? '',
    phone: user.phone ?? '',
    email: user.contactEmail ?? user.email,
    logo: user.logo ?? '',
  };
}

export function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
  };
}

export function nextInvoiceNumber(user: User) {
  return formatInvoiceNumber(user.nextInvoiceSequence, new Date());
}

export function toClient(client: Client) {
  return {
    id: client.id,
    name: client.name,
    address: client.address,
    vatId: client.vatId ?? '',
  };
}

export function toInvoice(invoice: InvoiceRecord) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: toIsoDate(invoice.invoiceDate)!,
    dueDate: toIsoDate(invoice.dueDate)!,
    customer: toClient(invoice.client),
    items: invoice.items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      vatRate: item.vatRate,
    })),
    subtotal: Number(invoice.subtotal),
    vatTotal: Number(invoice.vatTotal),
    total: Number(invoice.total),
    notes: invoice.notes,
    paid: invoice.paid,
    paidDate: toIsoDate(invoice.paidDate),
    paidMethod: invoice.paidMethod ?? undefined,
    paidNotes: invoice.paidNotes ?? undefined,
    createdAt: invoice.createdAt.toISOString(),
  };
}
