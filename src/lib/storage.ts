import { BusinessProfile, Customer, Invoice } from '../types';

const PROFILE_KEY = 'easyinvoice_profile';
const CUSTOMERS_KEY = 'easyinvoice_customers';
const INVOICES_KEY = 'easyinvoice_invoices';
const NEXT_NUMBER_KEY = 'easyinvoice_nextNumber';

export function saveProfile(profile: BusinessProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): BusinessProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveCustomer(customer: Customer): void {
  const customers = getCustomers();
  const existing = customers.findIndex(c => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  invoices.unshift(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getNextInvoiceNumber(): string {
  const num = parseInt(localStorage.getItem(NEXT_NUMBER_KEY) || '1');
  const year = new Date().getFullYear();
  return `INV-${year}-${num.toString().padStart(3, '0')}`;
}

export function incrementInvoiceNumber(): void {
  const num = parseInt(localStorage.getItem(NEXT_NUMBER_KEY) || '1');
  localStorage.setItem(NEXT_NUMBER_KEY, (num + 1).toString());
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
