import { ArrowRight, FileText, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hasRequiredProfile } from '../../../lib/invoice';
import { DashboardSummary } from '../components/DashboardSummary';
import { InvoiceFilters } from '../components/InvoiceFilters';
import { InvoiceList } from '../components/InvoiceList';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { PaymentModal } from '../components/PaymentModal';
import {
  selectPaymentInvoice,
  selectPreviewInvoice,
  useAppStore,
} from '../../../store/useAppStore';

export function DashboardPage() {
  const profile = useAppStore(state => state.profile);
  const customers = useAppStore(state => state.customers);
  const invoices = useAppStore(state => state.invoices);
  const historyFilters = useAppStore(state => state.historyFilters);
  const setHistoryFilter = useAppStore(state => state.setHistoryFilter);
  const openInvoicePreview = useAppStore(state => state.openInvoicePreview);
  const closeInvoicePreview = useAppStore(state => state.closeInvoicePreview);
  const openPaymentDialog = useAppStore(state => state.openPaymentDialog);
  const closePaymentDialog = useAppStore(state => state.closePaymentDialog);
  const updatePaymentDialogField = useAppStore(state => state.updatePaymentDialogField);
  const savePaymentDialog = useAppStore(state => state.savePaymentDialog);
  const previewInvoice = useAppStore(selectPreviewInvoice);
  const paymentInvoice = useAppStore(selectPaymentInvoice);
  const paymentDialog = useAppStore(state => state.paymentDialog);

  const filteredInvoices = invoices.filter(invoice => {
    const searchValue = historyFilters.search.trim().toLowerCase();
    const matchesSearch = !searchValue ||
      invoice.invoiceNumber.toLowerCase().includes(searchValue) ||
      invoice.customer.name.toLowerCase().includes(searchValue);

    const issuedAt = new Date(invoice.invoiceDate).getTime();
    const matchesFrom = !historyFilters.dateFrom ||
      issuedAt >= new Date(historyFilters.dateFrom).getTime();
    const matchesTo = !historyFilters.dateTo ||
      issuedAt <= new Date(historyFilters.dateTo).getTime();

    return matchesSearch && matchesFrom && matchesTo;
  });

  const openInvoiceCount = invoices.filter(invoice => !invoice.paid).length;
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const profileReady = hasRequiredProfile(profile);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
            Dashboard
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-heading font-bold leading-tight">
            Invoice ops are now routed by feature instead of living in one component.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-slate-300">
            The dashboard keeps history and monitoring in one place while the invoice builder,
            client manager, and settings page focus on their own concerns.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/invoices/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              New invoice
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/clients"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-primary/40"
            >
              Client manager
              <Users size={16} />
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-primary/40"
            >
              Business settings
              <Settings size={16} />
            </Link>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Readiness
          </p>
          <h3 className="mt-4 text-2xl font-heading font-bold text-slate-900">
            {profileReady ? 'Profile configured' : 'Complete your business profile'}
          </h3>
          <p className="mt-3 text-sm text-slate-500">
            {profileReady
              ? 'Your company profile is available to every feature through the global store.'
              : 'Before exporting invoices, add your business details in Settings.'}
          </p>
          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Current setup</p>
            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <p className="flex items-center justify-between">
                <span>Company profile</span>
                <span className={profileReady ? 'text-emerald-600' : 'text-amber-600'}>
                  {profileReady ? 'Ready' : 'Needed'}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Clients</span>
                <span>{customers.length}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Invoices</span>
                <span>{invoices.length}</span>
              </p>
            </div>
          </div>
        </article>
      </section>

      <DashboardSummary
        invoiceCount={invoices.length}
        customerCount={customers.length}
        openInvoiceCount={openInvoiceCount}
        revenue={revenue}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              History
            </p>
            <h2 className="mt-2 text-2xl font-heading font-bold text-slate-900">
              Invoice history
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {filteredInvoices.length} of {invoices.length} invoices
          </p>
        </div>

        <InvoiceFilters
          search={historyFilters.search}
          dateFrom={historyFilters.dateFrom}
          dateTo={historyFilters.dateTo}
          onSearchChange={value => setHistoryFilter('search', value)}
          onDateFromChange={value => setHistoryFilter('dateFrom', value)}
          onDateToChange={value => setHistoryFilter('dateTo', value)}
        />

        {invoices.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText className="mx-auto text-slate-400" size={32} />
            <h3 className="mt-4 text-xl font-heading font-bold text-slate-900">
              No invoices yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first invoice in the dedicated Invoice Builder feature.
            </p>
            <Link
              to="/invoices/new"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Open invoice builder
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <InvoiceList
            invoices={filteredInvoices}
            profile={profile}
            onPreview={openInvoicePreview}
            onPayment={openPaymentDialog}
          />
        )}
      </section>

      {previewInvoice && profileReady && profile && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          profile={profile}
          onClose={closeInvoicePreview}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          method={paymentDialog.method}
          notes={paymentDialog.notes}
          onMethodChange={value => updatePaymentDialogField('method', value)}
          onNotesChange={value => updatePaymentDialogField('notes', value)}
          onClose={closePaymentDialog}
          onSave={() => { void savePaymentDialog(); }}
        />
      )}
    </div>
  );
}
