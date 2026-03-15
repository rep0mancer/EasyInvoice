import { Check, Download, FileText, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../lib/invoice';
import { generatePDF } from '../../../lib/pdf';
import { downloadXRechnung } from '../../../lib/xrechnung';
import { BusinessProfile, Invoice } from '../../../types';

interface ReviewExportStepProps {
  invoice: Invoice;
  profile: BusinessProfile;
  onNewInvoice: () => void;
}

export function ReviewExportStep({
  invoice,
  profile,
  onNewInvoice,
}: ReviewExportStepProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Step 3
          </p>
          <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
            Invoice created
          </h2>
          <p className="mt-2 text-sm text-slate-500">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <h3 className="text-lg font-heading font-bold text-slate-900">Summary</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Client</span>
            <span className="font-medium text-slate-900">{invoice.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Items</span>
            <span>{invoice.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-semibold text-primary">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => generatePDF(profile, invoice)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => downloadXRechnung(profile, invoice)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-4 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <FileText size={18} />
          Download XML
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNewInvoice}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
        >
          <PlusCircle size={18} />
          Create another invoice
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
