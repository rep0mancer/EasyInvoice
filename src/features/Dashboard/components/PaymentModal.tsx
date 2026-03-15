import { Invoice } from '../../../types';

interface PaymentModalProps {
  invoice: Invoice;
  method: string;
  notes: string;
  onMethodChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const paymentOptions = [
  'Bar',
  'Bank transfer',
  'Card',
  'PayPal',
  'Other',
];

export function PaymentModal({
  invoice,
  method,
  notes,
  onMethodChange,
  onNotesChange,
  onClose,
  onSave,
}: PaymentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-heading font-bold text-slate-900">
          {invoice.paid ? 'Update payment' : 'Capture payment'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {invoice.invoiceNumber} · {invoice.customer.name}
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Payment method</label>
            <select
              value={method}
              onChange={event => onMethodChange(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a method</option>
              {paymentOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={event => onNotesChange(event.target.value)}
              placeholder="Optional payment reference..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {invoice.paid ? 'Toggle to open' : 'Mark as paid'}
          </button>
        </div>
      </div>
    </div>
  );
}
