import { useNavigate } from 'react-router-dom';
import { CustomerDirectory } from '../components/CustomerDirectory';
import { CustomerEditor } from '../components/CustomerEditor';
import { useAppStore } from '../../../store/useAppStore';

export function ClientManagerPage() {
  const navigate = useNavigate();
  const customers = useAppStore(state => state.customers);
  const clientSearch = useAppStore(state => state.clientSearch);
  const customerEditor = useAppStore(state => state.customerEditor);
  const setClientSearch = useAppStore(state => state.setClientSearch);
  const startCustomerDraft = useAppStore(state => state.startCustomerDraft);
  const updateCustomerEditorField = useAppStore(state => state.updateCustomerEditorField);
  const saveCustomerEditor = useAppStore(state => state.saveCustomerEditor);
  const cancelCustomerEditor = useAppStore(state => state.cancelCustomerEditor);
  const removeCustomer = useAppStore(state => state.removeCustomer);
  const beginInvoiceForCustomer = useAppStore(state => state.beginInvoiceForCustomer);

  const filteredCustomers = customers.filter(customer => {
    const searchValue = clientSearch.trim().toLowerCase();
    return !searchValue ||
      customer.name.toLowerCase().includes(searchValue) ||
      customer.address.toLowerCase().includes(searchValue);
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CustomerDirectory
        customers={filteredCustomers}
        search={clientSearch}
        activeCustomerId={customerEditor.editingId}
        onSearchChange={setClientSearch}
        onCreateCustomer={() => startCustomerDraft()}
        onEditCustomer={startCustomerDraft}
        onDeleteCustomer={removeCustomer}
        onCreateInvoice={customerId => {
          beginInvoiceForCustomer(customerId);
          navigate('/invoices/new');
        }}
      />
      <CustomerEditor
        draft={customerEditor.draft}
        isEditing={Boolean(customerEditor.editingId)}
        onFieldChange={updateCustomerEditorField}
        onSave={saveCustomerEditor}
        onCancel={cancelCustomerEditor}
      />
    </div>
  );
}
