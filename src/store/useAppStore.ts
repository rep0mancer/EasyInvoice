import { create } from 'zustand';
import { ApiError, authApi, clientsApi, invoicesApi, profileApi } from '../lib/api';
import {
  createEmptyBusinessProfile,
  createEmptyCustomerDraft,
  createInvoiceDraft,
  formatInvoiceNumber,
} from '../lib/invoice';
import {
  AuthCredentials,
  AuthUser,
  BusinessProfile,
  Customer,
  CustomerDraft,
  Invoice,
  InvoiceDraft,
  LineItem,
  RegisterCredentials,
  SessionPayload,
} from '../types';

type InvoiceBuilderStep = 1 | 2 | 3;
type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

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
  authStatus: AuthStatus;
  authUser: AuthUser | null;
  profile: BusinessProfile | null;
  settingsForm: BusinessProfile;
  customers: Customer[];
  invoices: Invoice[];
  nextInvoiceNumber: string;
  isInitializing: boolean;
  isAuthSubmitting: boolean;
  isSyncing: boolean;
  errorMessage: string | null;
  authError: string | null;
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
  initializeApp: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearAuthError: () => void;
  updateSettingsField: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
  resetSettingsForm: () => void;
  saveSettingsForm: () => Promise<void>;
  setInvoiceBuilderStep: (step: InvoiceBuilderStep) => void;
  resetInvoiceDraft: (customerId?: string | null) => void;
  setInvoiceCustomerSearch: (search: string) => void;
  selectDraftCustomer: (customerId: string) => void;
  setDraftCustomerMode: (isEnabled: boolean) => void;
  updateDraftCustomerField: <K extends keyof CustomerDraft>(field: K, value: CustomerDraft[K]) => void;
  saveDraftCustomer: () => Promise<Customer | null>;
  updateInvoiceDraftField: <K extends keyof InvoiceDraft>(field: K, value: InvoiceDraft[K]) => void;
  addInvoiceDraftItem: () => void;
  removeInvoiceDraftItem: (id: string) => void;
  updateInvoiceDraftItem: <K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => void;
  createInvoice: () => Promise<Invoice | null>;
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
  savePaymentDialog: () => Promise<void>;
  setClientSearch: (search: string) => void;
  startCustomerDraft: (customerId?: string) => void;
  updateCustomerEditorField: <K extends keyof CustomerDraft>(field: K, value: CustomerDraft[K]) => void;
  saveCustomerEditor: () => Promise<Customer | null>;
  cancelCustomerEditor: () => void;
  removeCustomer: (customerId: string) => Promise<void>;
  beginInvoiceForCustomer: (customerId: string) => void;
}

const defaultInvoiceNumber = formatInvoiceNumber(1);

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

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

function buildAnonymousState() {
  return {
    authStatus: 'anonymous' as const,
    authUser: null,
    profile: null,
    settingsForm: createEmptyBusinessProfile(),
    customers: [],
    invoices: [],
    nextInvoiceNumber: defaultInvoiceNumber,
    invoiceBuilderStep: 1 as const,
    invoiceDraft: createInvoiceDraft(defaultInvoiceNumber),
    invoiceCustomerSearch: '',
    isAddingDraftCustomer: false,
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
  };
}

async function loadTenantData(session: SessionPayload) {
  const [clientsResponse, invoicesResponse] = await Promise.all([
    clientsApi.list(),
    invoicesApi.list(),
  ]);

  return {
    authStatus: 'authenticated' as const,
    authUser: session.user,
    profile: session.profile,
    settingsForm: session.profile,
    customers: clientsResponse.clients,
    invoices: invoicesResponse.invoices,
    nextInvoiceNumber: session.nextInvoiceNumber,
    invoiceBuilderStep: 1 as const,
    invoiceDraft: createInvoiceDraft(session.nextInvoiceNumber),
    invoiceCustomerSearch: '',
    isAddingDraftCustomer: clientsResponse.clients.length === 0,
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
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  authStatus: 'checking',
  authUser: null,
  profile: null,
  settingsForm: createEmptyBusinessProfile(),
  customers: [],
  invoices: [],
  nextInvoiceNumber: defaultInvoiceNumber,
  isInitializing: false,
  isAuthSubmitting: false,
  isSyncing: false,
  errorMessage: null,
  authError: null,
  invoiceBuilderStep: 1,
  invoiceDraft: createInvoiceDraft(defaultInvoiceNumber),
  invoiceCustomerSearch: '',
  isAddingDraftCustomer: false,
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

  initializeApp: async () => {
    set({
      authStatus: 'checking',
      isInitializing: true,
      errorMessage: null,
      authError: null,
    });

    try {
      const session = await authApi.me();
      const authenticatedState = await loadTenantData(session);

      set({
        ...authenticatedState,
        isInitializing: false,
        isAuthSubmitting: false,
        isSyncing: false,
        errorMessage: null,
        authError: null,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return;
      }

      set({
        ...buildAnonymousState(),
        isInitializing: false,
        isAuthSubmitting: false,
        isSyncing: false,
        errorMessage: getErrorMessage(error),
        authError: null,
      });
    }
  },

  login: async credentials => {
    set({
      isAuthSubmitting: true,
      authError: null,
      errorMessage: null,
    });

    try {
      const session = await authApi.login(credentials);
      const authenticatedState = await loadTenantData(session);

      set({
        ...authenticatedState,
        isInitializing: false,
        isAuthSubmitting: false,
        isSyncing: false,
        errorMessage: null,
        authError: null,
      });
    } catch (error) {
      set({
        isAuthSubmitting: false,
        authError: getErrorMessage(error),
      });
    }
  },

  register: async credentials => {
    set({
      isAuthSubmitting: true,
      authError: null,
      errorMessage: null,
    });

    try {
      const session = await authApi.register(credentials);
      const authenticatedState = await loadTenantData(session);

      set({
        ...authenticatedState,
        isInitializing: false,
        isAuthSubmitting: false,
        isSyncing: false,
        errorMessage: null,
        authError: null,
      });
    } catch (error) {
      set({
        isAuthSubmitting: false,
        authError: getErrorMessage(error),
      });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({
        ...buildAnonymousState(),
        isInitializing: false,
        isAuthSubmitting: false,
        isSyncing: false,
        errorMessage: null,
        authError: null,
      });
    }
  },

  clearError: () => {
    set({ errorMessage: null });
  },

  clearAuthError: () => {
    set({ authError: null });
  },

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

  saveSettingsForm: async () => {
    set({ isSyncing: true, errorMessage: null });

    try {
      const response = await profileApi.update(get().settingsForm);
      set({
        profile: response.profile,
        settingsForm: response.profile,
        nextInvoiceNumber: response.nextInvoiceNumber,
        invoiceDraft: createInvoiceDraft(
          response.nextInvoiceNumber,
          get().invoiceDraft.customerId,
        ),
        isSyncing: false,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  setInvoiceBuilderStep: step => {
    set({ invoiceBuilderStep: step });
  },

  resetInvoiceDraft: customerId => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(
        state.nextInvoiceNumber,
        customerId ?? state.invoiceDraft.customerId,
      ),
      invoiceCustomerSearch: '',
      isAddingDraftCustomer: state.customers.length === 0,
      draftCustomerForm: createEmptyCustomerDraft(),
    }));
  },

  setInvoiceCustomerSearch: search => {
    set({ invoiceCustomerSearch: search });
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

  saveDraftCustomer: async () => {
    const { draftCustomerForm } = get();

    if (!draftCustomerForm.name || !draftCustomerForm.address) {
      return null;
    }

    set({ isSyncing: true, errorMessage: null });

    try {
      const response = await clientsApi.create(draftCustomerForm);

      set(state => ({
        customers: [...state.customers, response.client],
        invoiceDraft: {
          ...state.invoiceDraft,
          customerId: response.client.id,
        },
        isAddingDraftCustomer: false,
        draftCustomerForm: createEmptyCustomerDraft(),
        isSyncing: false,
      }));

      return response.client;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return null;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });
      return null;
    }
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
        items: [
          ...state.invoiceDraft.items,
          {
            id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            vatRate: 20,
          },
        ],
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

  createInvoice: async () => {
    const { invoiceDraft } = get();

    if (!invoiceDraft.customerId) {
      return null;
    }

    set({ isSyncing: true, errorMessage: null });

    try {
      const response = await invoicesApi.create({
        clientId: invoiceDraft.customerId,
        invoiceDate: invoiceDraft.invoiceDate,
        dueDate: invoiceDraft.dueDate,
        items: invoiceDraft.items,
        notes: invoiceDraft.notes,
      });

      set(state => ({
        invoices: [response.invoice, ...state.invoices],
        nextInvoiceNumber: response.nextInvoiceNumber ?? state.nextInvoiceNumber,
        invoiceDraft: {
          ...state.invoiceDraft,
          createdInvoiceId: response.invoice.id,
          invoiceNumber: response.nextInvoiceNumber ?? state.nextInvoiceNumber,
        },
        invoiceBuilderStep: 3,
        isSyncing: false,
      }));

      return response.invoice;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return null;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });

      return null;
    }
  },

  prepareNextInvoice: () => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(
        state.nextInvoiceNumber,
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
    set({ previewInvoiceId: invoiceId });
  },

  closeInvoicePreview: () => {
    set({ previewInvoiceId: null });
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
    set({ paymentDialog: createPaymentDialog() });
  },

  updatePaymentDialogField: (field, value) => {
    set(state => ({
      paymentDialog: {
        ...state.paymentDialog,
        [field]: value,
      },
    }));
  },

  savePaymentDialog: async () => {
    const { paymentDialog, invoices } = get();
    const invoice = invoices.find(entry => entry.id === paymentDialog.invoiceId);

    if (!invoice) {
      return;
    }

    set({ isSyncing: true, errorMessage: null });

    try {
      const response = await invoicesApi.updatePayment(invoice.id, {
        paid: !invoice.paid,
        method: paymentDialog.method,
        notes: paymentDialog.notes,
      });

      set(state => ({
        invoices: state.invoices.map(entry => entry.id === response.invoice.id ? response.invoice : entry),
        paymentDialog: createPaymentDialog(),
        isSyncing: false,
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  setClientSearch: search => {
    set({ clientSearch: search });
  },

  startCustomerDraft: customerId => {
    if (!customerId) {
      set({
        customerEditor: {
          editingId: null,
          draft: createEmptyCustomerDraft(),
        },
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

  saveCustomerEditor: async () => {
    const { customerEditor } = get();

    if (!customerEditor.draft.name || !customerEditor.draft.address) {
      return null;
    }

    set({ isSyncing: true, errorMessage: null });

    try {
      const response = customerEditor.editingId
        ? await clientsApi.update(customerEditor.editingId, customerEditor.draft)
        : await clientsApi.create(customerEditor.draft);

      set(state => ({
        customers: customerEditor.editingId
          ? state.customers.map(entry => entry.id === response.client.id ? response.client : entry)
          : [...state.customers, response.client],
        customerEditor: createCustomerEditor(),
        isSyncing: false,
      }));

      return response.client;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return null;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });

      return null;
    }
  },

  cancelCustomerEditor: () => {
    set({ customerEditor: createCustomerEditor() });
  },

  removeCustomer: async customerId => {
    set({ isSyncing: true, errorMessage: null });

    try {
      await clientsApi.delete(customerId);

      set(state => ({
        customers: state.customers.filter(customer => customer.id !== customerId),
        invoiceDraft: state.invoiceDraft.customerId === customerId
          ? createInvoiceDraft(state.nextInvoiceNumber)
          : state.invoiceDraft,
        isSyncing: false,
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({
          ...buildAnonymousState(),
          isInitializing: false,
          isAuthSubmitting: false,
          isSyncing: false,
          errorMessage: null,
          authError: null,
        });
        return;
      }

      set({
        isSyncing: false,
        errorMessage: getErrorMessage(error),
      });
    }
  },

  beginInvoiceForCustomer: customerId => {
    set(state => ({
      invoiceBuilderStep: 1,
      invoiceDraft: createInvoiceDraft(state.nextInvoiceNumber, customerId),
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
