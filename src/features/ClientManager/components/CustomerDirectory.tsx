import { Pencil, PlusCircle, ReceiptText, Search, Trash2 } from 'lucide-react';
import { Customer } from '../../../types';

interface CustomerDirectoryProps {
  customers: Customer[];
  search: string;
  activeCustomerId: string | null;
  onSearchChange: (value: string) => void;
  onCreateCustomer: () => void;
  onEditCustomer: (customerId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
  onCreateInvoice: (customerId: string) => void;
}

export function CustomerDirectory({
  customers,
  search,
  activeCustomerId,
  onSearchChange,
  onCreateCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onCreateInvoice,
}: CustomerDirectoryProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Client Manager
          </p>
          <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
            Client directory
          </h2>
        </div>
        <button
          type="button"
          onClick={onCreateCustomer}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <PlusCircle size={16} />
          New client
        </button>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search by name or address..."
          className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-6 space-y-3">
        {customers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No clients found.
          </div>
        ) : (
          customers.map(customer => (
            <article
              key={customer.id}
              className={`rounded-3xl border p-4 transition ${
                customer.id === activeCustomerId
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-heading font-bold text-slate-900">
                    {customer.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{customer.address}</p>
                  {customer.vatId && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {customer.vatId}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onCreateInvoice(customer.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
                  >
                    <ReceiptText size={16} />
                    Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditCustomer(customer.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
