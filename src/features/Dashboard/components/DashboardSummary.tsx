import { CircleDollarSign, FileClock, FileText, Users } from 'lucide-react';
import { formatCurrency } from '../../../lib/invoice';

interface DashboardSummaryProps {
  invoiceCount: number;
  customerCount: number;
  openInvoiceCount: number;
  revenue: number;
}

const summaryCards = [
  {
    key: 'invoiceCount',
    label: 'Invoices',
    icon: FileText,
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    key: 'customerCount',
    label: 'Clients',
    icon: Users,
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'openInvoiceCount',
    label: 'Open',
    icon: FileClock,
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: CircleDollarSign,
    accent: 'bg-primary/10 text-primary',
  },
] as const;

export function DashboardSummary({
  invoiceCount,
  customerCount,
  openInvoiceCount,
  revenue,
}: DashboardSummaryProps) {
  const values: Record<(typeof summaryCards)[number]['key'], string> = {
    invoiceCount: invoiceCount.toString(),
    customerCount: customerCount.toString(),
    openInvoiceCount: openInvoiceCount.toString(),
    revenue: formatCurrency(revenue),
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map(card => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-heading font-bold text-slate-900">
                  {values[card.key]}
                </p>
              </div>
              <div className={`rounded-2xl p-3 ${card.accent}`}>
                <Icon size={22} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
