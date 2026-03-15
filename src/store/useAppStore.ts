import { create } from 'zustand';
import {
  buildInvoiceFromDraft,
  createEmptyBusinessProfile,
  createEmptyCustomerDraft,
  createInvoiceDraft,
  formatInvoiceNumber,
} from '../lib/invoice';
import {
  deleteCustomer as deleteStoredCustomer,
  generateId,
  loadAppData,
  saveCustomer,
  saveInvoices,
  saveProfile,
  setNextInvoiceSequence,
} from '../lib/storage';
import {
  BusinessProfile,
  Customer,
  CustomerDraft,
  Invoice,
  InvoiceDraft,
  LineItem,
} from '../types';

type InvoiceBuilderStep = 1 | 2 | 3;

interface HistoryFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
}

interface PaymentDialogState {
  invoiceId: string | null;
  method: string;
  notes: string;
}

interface CustomerEditorState {
  editingId: string | null;
  draft: CustomerDraft;
}

interface AppStore {
  profile: BusinessProfile | null;
  settingsForm: BusinessProfile;
  customers: Customer[];
  invoices: Invoice[];
  nextInvoiceSequence: number;
  invoiceBuilderStep: InvoiceBuilderStep;
  invoiceDraft: InvoiceDraft;
  invoiceCustomerSearch: string;
  isAddingDraftCustomer: boolean;
  draftCustomerForm: CustomerDraft;
  historyFilters: HistoryFilters;
  previewInvoiceId: string | null;
  paymentDialog: PaymentDialogState;
  clientSearch: string;
  customerEditor: CustomerEditorState;
  updateSettingsField: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
  resetSettingsForm: () => void;
  saveSettingsForm: () => void;
  setInvoiceBuilderStep: (step: InvoiceBuilderStep) => void;
  resetInvoiceDraft: (customerId?: string | null) => void;
  setInvoiceCustomerSearch: (search: string) => void;
  selectDraftCustomer: (customerId: string) => void;
  setDraftCustomerMode: (isEnabled: boolean) => void;
  updateDraftCustomerField: <K extends keyof CustomerDraft>(field: K, value: CustomerDraft[K]) => void;
  saveDraftCustomer: () => Customer | null;
  updateInvoiceDraftField: <K extends keyof InvoiceDraft>(field: K, value: InvoiceDraft[K]) => void;
  addInvoiceDraftItem: () => void;
  removeInvoiceDraftItem: (id: string) => void;
  updateInvoiceDraftItem: <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => void;
  createInvoice: () => Invoice | null;
  prepareNextInvoice: () => void;
  setHistoryFilter: <K extends keyof HistoryFilters>(field: K, value: HistoryFilters[K]) => void;
  openInvoicePreview: (invoiceId: string) => void;
  closeInvoicePreview: () => void;
  openPaymentDialog: (invoiceId: string) => void;
  closePaymentDialog: () => void;
  updatePaymentDialogField: <K extends keyof Omit<PaymentDialogState, 'invoiceId'>>(
    field: K,
    value: PaymentDialogState[K],
  ) => void;
  savePaymentDialog: () => void;
  setClientSearch: (search: string) => void;
  startCustomerDraft: (customerId?: string) => void;
  updateCustomerEditorField: <K extends keyof CustomerDraft>(field: K, value: CustomerDraft[K]) => void;
  saveCustomerEditor: () => Customer | null;
  cancelCustomerEditor: () => void;
  removeCustomer: (customerId: string) => void;
  beginInvoiceForCustomer: (customerId: string) => void;
}

const initialData = loadAppData();

function createPaymentDialog(): PaymentDialogState {
  return {
    invoiceId: null,
    method: '',
    notes: '',
  };
}

function createCustomerEditor(): CustomerEditorState {
  return {
    editingId: null,
    draft: createEmptyCustomerDraft(),
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  profile: initialData.profile,
  settingsForm: initialData.profile ?? createEmptyBusinessProfile(),
  customers: initialData.customers,
  invoices: initialData.invoices,
  nextInvoiceSequence: initialData.nextInvoiceSequence,
  invoiceBuilderStep: 1,
  invoiceDraft: createInvoiceDraft(initialData.nextInvoiceSequence),
  invoiceCustomerSearch: '',
  isAddingDraftCustomer: initialData.customers.length === 0,
  draftCustomerForm: createEmptyCustomerDraft(),
  historyFilters: {
    search: '',
    dateFrom: '',
    dateTo: '',
  },
  previewInvoiceId: null,
  paymentDialog: createPaymentDialog(),
  clientSearch: '',
  customerEditor: createCustomerEditor(),

  updateSettingsField: (field, value) => {
    set(state => ({
      settingsForm: {
        ...state.settingsForm,
        [field]: value,
      },
    }));
  },

  resetSettingsForm: () => {
    set(state => ({
      settingsForm: state.profile ?? createEmptyBusinessProfile(),
    }));
  },

  saveSettingsForm: () => {
    const profile = get().settingsForm;
    saveProfile(profile);
    set({
      profile,
      settingsForm: profile,
    });
  },

  setInvoiceBuilderStep: step => {
    set({
      invoiceBuilderStep: step,
    });
  },

  resetInvoiceDraft: customerId => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(
        state.nextInvoiceSequence,
        customerId ?? state.invoiceDraft.customerId,
      ),
      invoiceCustomerSearch: '',
      isAddingDraftCustomer: state.customers.length === 0,
      draftCustomerForm: createEmptyCustomerDraft(),
    }));
  },

  setInvoiceCustomerSearch: search => {
    set({
      invoiceCustomerSearch: search,
    });
  },

  selectDraftCustomer: customerId => {
    set(state => ({
      invoiceDraft: {
        ...state.invoiceDraft,
        customerId,
        createdInvoiceId: null,
      },
      isAddingDraftCustomer: false,
    }));
  },

  setDraftCustomerMode: isEnabled => {
    set({
      isAddingDraftCustomer: isEnabled,
      draftCustomerForm: isEnabled ? get().draftCustomerForm : createEmptyCustomerDraft(),
    });
  },

  updateDraftCustomerField: (field, value) => {
    set(state => ({
      draftCustomerForm: {
        ...state.draftCustomerForm,
        [field]: value,
      },
    }));
  },

  saveDraftCustomer: () => {
    const { draftCustomerForm } = get();
    if (!draftCustomerForm.name || !draftCustomerForm.address) {
      return null;
    }

    const customer: Customer = {
      id: generateId(),
      ...draftCustomerForm,
    };

    saveCustomer(customer);

    set(state => ({
      customers: [...state.customers, customer],
      invoiceDraft: {
        ...state.invoiceDraft,
        customerId: customer.id,
      },
      isAddingDraftCustomer: false,
      draftCustomerForm: createEmptyCustomerDraft(),
    }));

    return customer;
  },

  updateInvoiceDraftField: (field, value) => {
    set(state => ({
      invoiceDraft: {
        ...state.invoiceDraft,
        [field]: value,
      },
    }));
  },

  addInvoiceDraftItem: () => {
    set(state => ({
      invoiceDraft: {
        ...state.invoiceDraft,
        items: [...state.invoiceDraft.items, {
          id: generateId(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          vatRate: 20,
        }],
      },
    }));
  },

  removeInvoiceDraftItem: id => {
    set(state => ({
      invoiceDraft: {
        ...state.invoiceDraft,
        items: state.invoiceDraft.items.length > 1
          ? state.invoiceDraft.items.filter(item => item.id !== id)
          : state.invoiceDraft.items,
      },
    }));
  },

  updateInvoiceDraftItem: (id, field, value) => {
    set(state => ({
      invoiceDraft: {
        ...state.invoiceDraft,
        items: state.invoiceDraft.items.map(item => (
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
        )),
      },
    }));
  },

  createInvoice: () => {
    const { customers, invoiceDraft, nextInvoiceSequence } = get();
    const customer = customers.find(entry => entry.id === invoiceDraft.customerId);
    if (!customer) {
      return null;
    }

    const invoice = buildInvoiceFromDraft(invoiceDraft, customer);
    const updatedInvoices = [invoice, ...get().invoices];
    const updatedSequence = nextInvoiceSequence + 1;

    saveInvoices(updatedInvoices);
    setNextInvoiceSequence(updatedSequence);

    set({
      invoices: updatedInvoices,
      nextInvoiceSequence: updatedSequence,
      invoiceDraft: {
        ...invoiceDraft,
        createdInvoiceId: invoice.id,
      },
      invoiceBuilderStep: 3,
    });

    return invoice;
  },

  prepareNextInvoice: () => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(
        state.nextInvoiceSequence,
        state.invoiceDraft.customerId,
      ),
      invoiceCustomerSearch: '',
      isAddingDraftCustomer: false,
      draftCustomerForm: createEmptyCustomerDraft(),
    }));
  },

  setHistoryFilter: (field, value) => {
    set(state => ({
      historyFilters: {
        ...state.historyFilters,
        [field]: value,
      },
    }));
  },

  openInvoicePreview: invoiceId => {
    set({
      previewInvoiceId: invoiceId,
    });
  },

  closeInvoicePreview: () => {
    set({
      previewInvoiceId: null,
    });
  },

  openPaymentDialog: invoiceId => {
    const invoice = get().invoices.find(entry => entry.id === invoiceId);
    set({
      paymentDialog: {
        invoiceId,
        method: invoice?.paidMethod || '',
        notes: invoice?.paidNotes || '',
      },
    });
  },

  closePaymentDialog: () => {
    set({
      paymentDialog: createPaymentDialog(),
    });
  },

  updatePaymentDialogField: (field, value) => {
    set(state => ({
      paymentDialog: {
        ...state.paymentDialog,
        [field]: value,
      },
    }));
  },

  savePaymentDialog: () => {
    const { invoices, paymentDialog } = get();
    if (!paymentDialog.invoiceId) {
      return;
    }

    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id !== paymentDialog.invoiceId) {
        return invoice;
      }

      const nextPaid = !invoice.paid;

      return {
        ...invoice,
        paid: nextPaid,
        paidMethod: paymentDialog.method,
        paidNotes: paymentDialog.notes,
        paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined,
      };
    });

    saveInvoices(updatedInvoices);
    set({
      invoices: updatedInvoices,
      paymentDialog: createPaymentDialog(),
    });
  },

  setClientSearch: search => {
    set({
      clientSearch: search,
    });
  },

  startCustomerDraft: customerId => {
    if (!customerId) {
      set({
        customerEditor: createCustomerEditor(),
      });
      return;
    }

    const customer = get().customers.find(entry => entry.id === customerId);
    if (!customer) {
      return;
    }

    set({
      customerEditor: {
        editingId: customer.id,
        draft: {
          name: customer.name,
          address: customer.address,
          vatId: customer.vatId,
        },
      },
    });
  },

  updateCustomerEditorField: (field, value) => {
    set(state => ({
      customerEditor: {
        ...state.customerEditor,
        draft: {
          ...state.customerEditor.draft,
          [field]: value,
        },
      },
    }));
  },

  saveCustomerEditor: () => {
    const { customerEditor, customers } = get();
    if (!customerEditor.draft.name || !customerEditor.draft.address) {
      return null;
    }

    const customer: Customer = {
      id: customerEditor.editingId ?? generateId(),
      ...customerEditor.draft,
    };

    saveCustomer(customer);

    const updatedCustomers = customerEditor.editingId
      ? customers.map(entry => entry.id === customer.id ? customer : entry)
      : [...customers, customer];

    set(state => ({
      customers: updatedCustomers,
      customerEditor: createCustomerEditor(),
      invoiceDraft: state.invoiceDraft.customerId === customer.id
        ? {
            ...state.invoiceDraft,
            customerId: customer.id,
          }
        : state.invoiceDraft,
    }));

    return customer;
  },

  cancelCustomerEditor: () => {
    set({
      customerEditor: createCustomerEditor(),
    });
  },

  removeCustomer: customerId => {
    deleteStoredCustomer(customerId);
    set(state => ({
      customers: state.customers.filter(customer => customer.id !== customerId),
      invoiceDraft: state.invoiceDraft.customerId === customerId
        ? createInvoiceDraft(state.nextInvoiceSequence)
        : state.invoiceDraft,
    }));
  },

  beginInvoiceForCustomer: customerId => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(state.nextInvoiceSequence, customerId),
      isAddingDraftCustomer: false,
      invoiceCustomerSearch: '',
      draftCustomerForm: createEmptyCustomerDraft(),
    }));
  },
}));

export function selectCreatedInvoice(state: AppStore): Invoice | null {
  if (!state.invoiceDraft.createdInvoiceId) {
    return null;
  }

  return state.invoices.find(invoice => invoice.id === state.invoiceDraft.createdInvoiceId) ?? null;
}

export function selectPreviewInvoice(state: AppStore): Invoice | null {
  if (!state.previewInvoiceId) {
    return null;
  }

  return state.invoices.find(invoice => invoice.id === state.previewInvoiceId) ?? null;
}

export function selectPaymentInvoice(state: AppStore): Invoice | null {
  if (!state.paymentDialog.invoiceId) {
    return null;
  }

  return state.invoices.find(invoice => invoice.id === state.paymentDialog.invoiceId) ?? null;
}

export function selectDraftCustomer(state: AppStore): Customer | null {
  if (!state.invoiceDraft.customerId) {
    return null;
  }

  return state.customers.find(customer => customer.id === state.invoiceDraft.customerId) ?? null;
}

export function selectCustomerForEdit(state: AppStore): Customer | null {
  if (!state.customerEditor.editingId) {
    return null;
  }

  return state.customers.find(customer => customer.id === state.customerEditor.editingId) ?? null;
}

export function nextInvoiceLabel(state: AppStore): string {
  return formatInvoiceNumber(state.nextInvoiceSequence);
}
