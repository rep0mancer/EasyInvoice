import { Download, FileText, X } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../lib/invoice';
import { generatePDF } from '../../../lib/pdf';
import { downloadXRechnung } from '../../../lib/xrechnung';
import { BusinessProfile, Invoice } from '../../../types';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  profile: BusinessProfile;
  onClose: () => void;
}

export function InvoicePreviewModal({
  invoice,
  profile,
  onClose,
}: InvoicePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {profile.logo && (
              <img src={profile.logo} alt="Company logo" className="mb-4 h-16 object-contain" />
            )}
            <h2 className="text-2xl font-heading font-bold text-primary">
              {profile.companyName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {profile.address}, {profile.postalCode} {profile.city}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => generatePDF(profile, invoice)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
            >
              <Download size={16} />
              PDF
            </button>
            <button
              type="button"
              onClick={() => downloadXRechnung(profile, invoice)}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              <FileText size={16} />
              XML
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 p-2 text-slate-600 hover:border-primary/50 hover:text-primary"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Invoice</p>
            <p className="mt-2 font-heading text-lg font-bold text-slate-900">{invoice.invoiceNumber}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Issued</p>
            <p className="mt-2 font-medium text-slate-900">{formatDisplayDate(invoice.invoiceDate)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Due</p>
            <p className="mt-2 font-medium text-slate-900">{formatDisplayDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Customer</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{invoice.customer.name}</p>
          <p className="mt-1 text-sm text-slate-500">{invoice.customer.address}</p>
          {invoice.customer.vatId && (
            <p className="mt-1 text-sm text-slate-500">VAT ID: {invoice.customer.vatId}</p>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Unit</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-700">{item.description || 'Untitled item'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-slate-600">
            <span>VAT</span>
            <span>{formatCurrency(invoice.vatTotal)}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-heading font-bold text-primary">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Notes</p>
            <p className="mt-2 text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
