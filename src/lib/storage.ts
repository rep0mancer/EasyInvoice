import { BusinessProfile, Customer, Invoice } from '../types';

const PROFILE_KEY = 'easyinvoice_profile';
const CUSTOMERS_KEY = 'easyinvoice_customers';
const INVOICES_KEY = 'easyinvoice_invoices';
const NEXT_NUMBER_KEY = 'easyinvoice_nextNumber';

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) {
    return fallback;
  }

  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) as T : fallback;
}

function writeJson<T>(key: string, value: T): void {
  if (!isStorageAvailable()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export interface PersistedAppData {
  profile: BusinessProfile | null;
  customers: Customer[];
  invoices: Invoice[];
  nextInvoiceSequence: number;
}

export function saveProfile(profile: BusinessProfile): void {
  writeJson(PROFILE_KEY, profile);
}

export function getProfile(): BusinessProfile | null {
  return readJson<BusinessProfile | null>(PROFILE_KEY, null);
}

export function saveCustomer(customer: Customer): void {
  const customers = getCustomers();
  const existing = customers.findIndex(c => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
  saveCustomers(customers);
}

export function getCustomers(): Customer[] {
  return readJson<Customer[]>(CUSTOMERS_KEY, []);
}

export function saveCustomers(customers: Customer[]): void {
  writeJson(CUSTOMERS_KEY, customers);
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  invoices.unshift(invoice);
  saveInvoices(invoices);
}

export function getInvoices(): Invoice[] {
  return readJson<Invoice[]>(INVOICES_KEY, []);
}

export function saveInvoices(invoices: Invoice[]): void {
  writeJson(INVOICES_KEY, invoices);
}

export function getNextInvoiceSequence(): number {
  if (!isStorageAvailable()) {
    return 1;
  }

  return parseInt(localStorage.getItem(NEXT_NUMBER_KEY) || '1', 10);
}

export function getNextInvoiceNumber(): string {
  const num = getNextInvoiceSequence();
  const year = new Date().getFullYear();
  return `INV-${year}-${num.toString().padStart(3, '0')}`;
}

export function incrementInvoiceNumber(): void {
  setNextInvoiceSequence(getNextInvoiceSequence() + 1);
}

export function setNextInvoiceSequence(sequence: number): void {
  if (!isStorageAvailable()) {
    return;
  }

  localStorage.setItem(NEXT_NUMBER_KEY, sequence.toString());
}

export function loadAppData(): PersistedAppData {
  return {
    profile: getProfile(),
    customers: getCustomers(),
    invoices: getInvoices(),
    nextInvoiceSequence: getNextInvoiceSequence(),
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
