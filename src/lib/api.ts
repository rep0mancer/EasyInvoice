import {
  AuthCredentials,
  BusinessProfile,
  Customer,
  CustomerDraft,
  Invoice,
  LineItem,
  RegisterCredentials,
  SessionPayload,
} from '../types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

interface ClientsResponse {
  clients: Customer[];
}

interface ClientResponse {
  client: Customer;
}

interface InvoicesResponse {
  invoices: Invoice[];
}

interface InvoiceResponse {
  invoice: Invoice;
  nextInvoiceNumber?: string;
}

interface ProfileResponse {
  profile: BusinessProfile;
  nextInvoiceNumber: string;
}

interface SuccessResponse {
  success: true;
}

export const authApi = {
  me: () => request<SessionPayload>('/api/auth/me'),
  login: (credentials: AuthCredentials) => request<SessionPayload>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (credentials: RegisterCredentials) => request<SessionPayload>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  logout: () => request<SuccessResponse>('/api/auth/logout', { method: 'POST' }),
};

export const profileApi = {
  get: () => request<ProfileResponse>('/api/profile'),
  update: (profile: BusinessProfile) => request<ProfileResponse>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  }),
};

export const clientsApi = {
  list: () => request<ClientsResponse>('/api/clients'),
  create: (draft: CustomerDraft) => request<ClientResponse>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(draft),
  }),
  update: (clientId: string, draft: CustomerDraft) => request<ClientResponse>(`/api/clients/${clientId}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  }),
  delete: (clientId: string) => request<SuccessResponse>(`/api/clients/${clientId}`, {
    method: 'DELETE',
  }),
};

interface InvoiceCreatePayload {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
}

interface PaymentPayload {
  paid: boolean;
  method: string;
  notes: string;
}

export const invoicesApi = {
  list: () => request<InvoicesResponse>('/api/invoices'),
  create: (payload: InvoiceCreatePayload) => request<InvoiceResponse>('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (invoiceId: string, payload: InvoiceCreatePayload) => request<InvoiceResponse>(`/api/invoices/${invoiceId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  updatePayment: (invoiceId: string, payload: PaymentPayload) => request<InvoiceResponse>(`/api/invoices/${invoiceId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
  delete: (invoiceId: string) => request<SuccessResponse>(`/api/invoices/${invoiceId}`, {
    method: 'DELETE',
  }),
};
