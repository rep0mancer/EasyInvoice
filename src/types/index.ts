export interface BusinessProfile {
  companyName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  vatId: string;
  phone: string;
  email: string;
  logo?: string; // base64 encoded image
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  vatId: string;
}

export interface CustomerDraft {
  name: string;
  address: string;
  vatId: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  vatTotal: number;
  total: number;
  notes: string;
  paid: boolean;
  paidDate?: string;
  paidMethod?: string;
  paidNotes?: string;
  createdAt: string;
}

export interface InvoiceDraft {
  customerId: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  createdInvoiceId: string | null;
}
