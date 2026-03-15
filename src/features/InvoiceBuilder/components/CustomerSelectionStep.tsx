import { ArrowRight, Plus } from 'lucide-react';
import { Customer, CustomerDraft } from '../../../types';

interface CustomerSelectionStepProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  search: string;
  isAddingCustomer: boolean;
  draftCustomer: CustomerDraft;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStartAddCustomer: () => void;
  onCancelAddCustomer: () => void;
  onDraftCustomerFieldChange: <K extends keyof CustomerDraft>(
    field: K,
    value: CustomerDraft[K],
  ) => void;
  onContinue: () => Promise<void> | void;
}

export function CustomerSelectionStep({
  customers,
  selectedCustomerId,
  search,
  isAddingCustomer,
  draftCustomer,
  onSearchChange,
  onSelectCustomer,
  onStartAddCustomer,
  onCancelAddCustomer,
  onDraftCustomerFieldChange,
  onContinue,
}: CustomerSelectionStepProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Step 1
          </p>
          <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
            Choose the client
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Select an existing client or add a new one without leaving the builder.
          </p>
        </div>
        {!isAddingCustomer && (
          <button
            type="button"
            onClick={onStartAddCustomer}
            className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
          >
            <Plus size={16} />
            Quick add client
          </button>
        )}
      </div>

      {customers.length > 0 && !isAddingCustomer && (
        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search clients by name or address..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-4 grid gap-3">
            {customers.map(customer => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelectCustomer(customer.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  selectedCustomerId === customer.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-primary/50'
                }`}
              >
                <p className="font-semibold text-slate-900">{customer.name}</p>
                <p className="mt-1 text-sm text-slate-500">{customer.address}</p>
                {customer.vatId && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {customer.vatId}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isAddingCustomer && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-bold text-slate-900">New client</h3>
            {customers.length > 0 && (
              <button
                type="button"
                onClick={onCancelAddCustomer}
                className="text-sm font-medium text-slate-500 hover:text-primary"
              >
                Back to list
              </button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={draftCustomer.name}
              onChange={event => onDraftCustomerFieldChange('name', event.target.value)}
              placeholder="Client name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              value={draftCustomer.address}
              onChange={event => onDraftCustomerFieldChange('address', event.target.value)}
              placeholder="Address"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              value={draftCustomer.vatId}
              onChange={event => onDraftCustomerFieldChange('vatId', event.target.value)}
              placeholder="VAT ID (optional)"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => { void onContinue(); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
