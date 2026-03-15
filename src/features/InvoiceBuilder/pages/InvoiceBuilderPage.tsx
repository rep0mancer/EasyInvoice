import { ArrowRight, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BuilderProgress } from '../components/BuilderProgress';
import { CustomerSelectionStep } from '../components/CustomerSelectionStep';
import { InvoiceDetailsStep } from '../components/InvoiceDetailsStep';
import { ReviewExportStep } from '../components/ReviewExportStep';
import {
  selectCreatedInvoice,
  selectDraftCustomer,
  useAppStore,
} from '../../../store/useAppStore';

export function InvoiceBuilderPage() {
  const profile = useAppStore(state => state.profile);
  const customers = useAppStore(state => state.customers);
  const invoiceBuilderStep = useAppStore(state => state.invoiceBuilderStep);
  const invoiceDraft = useAppStore(state => state.invoiceDraft);
  const invoiceCustomerSearch = useAppStore(state => state.invoiceCustomerSearch);
  const isAddingDraftCustomer = useAppStore(state => state.isAddingDraftCustomer);
  const draftCustomerForm = useAppStore(state => state.draftCustomerForm);
  const selectedCustomer = useAppStore(selectDraftCustomer);
  const createdInvoice = useAppStore(selectCreatedInvoice);
  const setInvoiceBuilderStep = useAppStore(state => state.setInvoiceBuilderStep);
  const setInvoiceCustomerSearch = useAppStore(state => state.setInvoiceCustomerSearch);
  const selectDraftCustomerById = useAppStore(state => state.selectDraftCustomer);
  const setDraftCustomerMode = useAppStore(state => state.setDraftCustomerMode);
  const updateDraftCustomerField = useAppStore(state => state.updateDraftCustomerField);
  const saveDraftCustomer = useAppStore(state => state.saveDraftCustomer);
  const updateInvoiceDraftField = useAppStore(state => state.updateInvoiceDraftField);
  const addInvoiceDraftItem = useAppStore(state => state.addInvoiceDraftItem);
  const removeInvoiceDraftItem = useAppStore(state => state.removeInvoiceDraftItem);
  const updateInvoiceDraftItem = useAppStore(state => state.updateInvoiceDraftItem);
  const createInvoice = useAppStore(state => state.createInvoice);
  const prepareNextInvoice = useAppStore(state => state.prepareNextInvoice);

  const filteredCustomers = customers.filter(customer => {
    const searchValue = invoiceCustomerSearch.trim().toLowerCase();
    return !searchValue ||
      customer.name.toLowerCase().includes(searchValue) ||
      customer.address.toLowerCase().includes(searchValue);
  });

  if (!profile) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
        <Settings className="mx-auto text-slate-400" size={32} />
        <h2 className="mt-4 text-2xl font-heading font-bold text-slate-900">
          Add your business profile first
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The invoice builder is now isolated from settings, so it reads profile data from the shared store.
        </p>
        <Link
          to="/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Open settings
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Invoice Builder
            </p>
            <h2 className="mt-2 text-4xl font-heading font-bold text-slate-900">
              Focused invoice creation
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              This route owns the invoice drafting workflow while domain state lives in the global store.
            </p>
          </div>
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
          >
            Manage clients
            <Users size={16} />
          </Link>
        </div>
      </section>

      <BuilderProgress currentStep={invoiceBuilderStep} />

      {invoiceBuilderStep === 1 && (
        <CustomerSelectionStep
          customers={filteredCustomers}
          selectedCustomerId={invoiceDraft.customerId}
          search={invoiceCustomerSearch}
          isAddingCustomer={isAddingDraftCustomer}
          draftCustomer={draftCustomerForm}
          onSearchChange={setInvoiceCustomerSearch}
          onSelectCustomer={selectDraftCustomerById}
          onStartAddCustomer={() => setDraftCustomerMode(true)}
          onCancelAddCustomer={() => setDraftCustomerMode(false)}
          onDraftCustomerFieldChange={updateDraftCustomerField}
          onContinue={() => {
            if (isAddingDraftCustomer) {
              const customer = saveDraftCustomer();
              if (customer) {
                setInvoiceBuilderStep(2);
              }
              return;
            }

            if (invoiceDraft.customerId) {
              setInvoiceBuilderStep(2);
            }
          }}
        />
      )}

      {invoiceBuilderStep === 2 && selectedCustomer && (
        <InvoiceDetailsStep
          draft={invoiceDraft}
          customer={selectedCustomer}
          onDraftFieldChange={updateInvoiceDraftField}
          onAddItem={addInvoiceDraftItem}
          onRemoveItem={removeInvoiceDraftItem}
          onUpdateItem={updateInvoiceDraftItem}
          onBack={() => setInvoiceBuilderStep(1)}
          onCreate={createInvoice}
        />
      )}

      {invoiceBuilderStep === 3 && createdInvoice && (
        <ReviewExportStep
          invoice={createdInvoice}
          profile={profile}
          onNewInvoice={prepareNextInvoice}
        />
      )}
    </div>
  );
}
