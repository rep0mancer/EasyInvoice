import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import {
  calculateInvoiceTotals,
  formatCurrency,
} from '../../../lib/invoice';
import { Customer, InvoiceDraft, LineItem } from '../../../types';

interface InvoiceDetailsStepProps {
  draft: InvoiceDraft;
  customer: Customer;
  onDraftFieldChange: <K extends keyof InvoiceDraft>(
    field: K,
    value: InvoiceDraft[K],
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: <K extends keyof LineItem>(itemId: string, field: K, value: LineItem[K]) => void;
  onBack: () => void;
  onCreate: () => Promise<void> | void;
}

export function InvoiceDetailsStep({
  draft,
  customer,
  onDraftFieldChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onBack,
  onCreate,
}: InvoiceDetailsStepProps) {
  const totals = calculateInvoiceTotals(draft.items);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Step 2
          </p>
          <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
            Build the invoice
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Drafting for <span className="font-semibold text-slate-700">{customer.name}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Invoice number</label>
          <input
            type="text"
            value={draft.invoiceNumber}
            readOnly
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Invoice date</label>
          <input
            type="date"
            value={draft.invoiceDate}
            onChange={event => onDraftFieldChange('invoiceDate', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Due date</label>
          <input
            type="date"
            value={draft.dueDate}
            onChange={event => onDraftFieldChange('dueDate', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {draft.items.map(item => (
          <div key={item.id} className="rounded-3xl bg-slate-50 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={item.description}
                onChange={event => onUpdateItem(item.id, 'description', event.target.value)}
                placeholder="Description"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {draft.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-2xl border border-red-200 px-3 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={event => onUpdateItem(item.id, 'quantity', parseFloat(event.target.value) || 0)}
                placeholder="Qty"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                step="0.01"
                value={item.unitPrice}
                onChange={event => onUpdateItem(item.id, 'unitPrice', parseFloat(event.target.value) || 0)}
                placeholder="Unit price"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={item.vatRate}
                onChange={event => onUpdateItem(item.id, 'vatRate', parseFloat(event.target.value))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="0">0% VAT</option>
                <option value="10">10% VAT</option>
                <option value="20">20% VAT</option>
              </select>
              <div className="flex items-center justify-end rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
      >
        <Plus size={16} />
        Add line item
      </button>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={draft.notes}
          onChange={event => onDraftFieldChange('notes', event.target.value)}
          rows={4}
          placeholder="Payment terms, banking details, or a short note..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-slate-600">
          <span>VAT</span>
          <span>{formatCurrency(totals.vatTotal)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-heading font-bold text-primary">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={() => { void onCreate(); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Save invoice
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
