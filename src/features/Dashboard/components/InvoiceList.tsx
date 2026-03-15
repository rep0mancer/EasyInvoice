import { CreditCard, Eye, FileDown, FileText } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../lib/invoice';
import { downloadXRechnung } from '../../../lib/xrechnung';
import { generatePDF } from '../../../lib/pdf';
import { BusinessProfile, Invoice } from '../../../types';

interface InvoiceListProps {
  invoices: Invoice[];
  profile: BusinessProfile | null;
  onPreview: (invoiceId: string) => void;
  onPayment: (invoiceId: string) => void;
}

export function InvoiceList({
  invoices,
  profile,
  onPreview,
  onPayment,
}: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No invoices match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map(invoice => (
        <article
          key={invoice.id}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-heading font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    invoice.paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {invoice.paid ? 'Paid' : 'Open'}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">{invoice.customer.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                Issued {formatDisplayDate(invoice.invoiceDate)} · Due {formatDisplayDate(invoice.dueDate)}
              </p>
              {invoice.paid && (invoice.paidMethod || invoice.paidNotes) && (
                <div className="mt-3 text-xs text-slate-500">
                  {invoice.paidMethod && <span className="mr-3">{invoice.paidMethod}</span>}
                  {invoice.paidDate && <span className="mr-3">{formatDisplayDate(invoice.paidDate)}</span>}
                  {invoice.paidNotes && <span>{invoice.paidNotes}</span>}
                </div>
              )}
            </div>
            <div className="lg:text-right">
              <p className="text-2xl font-heading font-bold text-primary">
                {formatCurrency(invoice.total)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onPreview(invoice.id)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/50 hover:text-primary"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => onPayment(invoice.id)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/50 hover:text-primary"
                >
                  <CreditCard size={16} />
                  {invoice.paid ? 'Update Payment' : 'Capture Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => profile && generatePDF(profile, invoice)}
                  disabled={!profile}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileDown size={16} />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => profile && downloadXRechnung(profile, invoice)}
                  disabled={!profile}
                  className="flex items-center gap-2 rounded-2xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileText size={16} />
                  XML
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
