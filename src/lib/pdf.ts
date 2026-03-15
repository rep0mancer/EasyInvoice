import { jsPDF } from 'jspdf';
import { BusinessProfile, Invoice, LineItem } from '../types';

export function generatePDF(
  profile: BusinessProfile,
  invoice: Invoice
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - Logo if exists
  if (profile.logo) {
    try {
      doc.addImage(profile.logo, 'JPEG', 20, 15, 30, 30)
    } catch (e) {
      // Skip if image fails
    }
  }
  
  // Header - Company Info
  doc.setFontSize(20);
  doc.setTextColor(13, 148, 136); // teal
  doc.text(profile.companyName, profile.logo ? 60 : 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(profile.address, 20, 32);
  doc.text(`${profile.postalCode} ${profile.city}`, 20, 37);
  if (profile.vatId) {
    doc.text(`UID: ${profile.vatId}`, 20, 42);
  }
  
  // Invoice Title
  doc.setFontSize(28);
  doc.setTextColor(30, 41, 59);
  doc.text('RECHNUNG', pageWidth - 20, 25, { align: 'right' });
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Rechnungsnummer: ${invoice.invoiceNumber}`, pageWidth - 20, 35, { align: 'right' });
  doc.text(`Datum: ${formatDate(invoice.invoiceDate)}`, pageWidth - 20, 40, { align: 'right' });
  doc.text(`Fällig: ${formatDate(invoice.dueDate)}`, pageWidth - 20, 45, { align: 'right' });
  
  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Rechnungsempfänger:', 20, 60);
  
  doc.setFontSize(10);
  doc.text(invoice.customer.name, 20, 68);
  doc.text(invoice.customer.address, 20, 73);
  if (invoice.customer.vatId) {
    doc.text(`UID: ${invoice.customer.vatId}`, 20, 78);
  }
  
  // Table Header
  const tableTop = 95;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, tableTop, pageWidth - 40, 10, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Beschreibung', 22, tableTop + 6);
  doc.text('Menge', 110, tableTop + 6);
  doc.text('Einzelpreis', 130, tableTop + 6);
  doc.text('MwSt', 155, tableTop + 6);
  doc.text('Gesamt', pageWidth - 22, tableTop + 6, { align: 'right' });
  
  // Table Rows
  let y = tableTop + 15;
  doc.setTextColor(30, 41, 59);
  
  invoice.items.forEach((item: LineItem) => {
    doc.text(item.description, 22, y);
    doc.text(item.quantity.toString(), 110, y);
    doc.text(formatCurrency(item.unitPrice), 130, y);
    doc.text(`${item.vatRate}%`, 155, y);
    doc.text(formatCurrency(item.quantity * item.unitPrice), pageWidth - 22, y, { align: 'right' });
    y += 8;
  });
  
  // Totals
  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, y, pageWidth - 20, y);
  y += 10;
  
  doc.text('Zwischensumme:', 130, y);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 22, y, { align: 'right' });
  y += 8;
  
  doc.text('MwSt:', 130, y);
  doc.text(formatCurrency(invoice.vatTotal), pageWidth - 22, y, { align: 'right' });
  y += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Gesamtbetrag:', 130, y);
  doc.text(formatCurrency(invoice.total), pageWidth - 22, y, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Anmerkungen:', 20, y);
    doc.text(invoice.notes, 20, y + 6);
  }
  
  // Payment Info
  if (invoice.paid && (invoice.paidMethod || invoice.paidNotes)) {
    y += 20;
    doc.setFillColor(220, 252, 231); // light green
    doc.rect(20, y - 5, pageWidth - 40, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74); // green
    doc.text('✓ Bezahlt', 22, y + 2);
    doc.setTextColor(80);
    if (invoice.paidMethod) {
      doc.text(`Zahlungsart: ${invoice.paidMethod}`, 22, y + 10);
    }
    if (invoice.paidDate) {
      doc.text(`Datum: ${formatDate(invoice.paidDate)}`, 22, y + 16);
    }
    if (invoice.paidNotes) {
      doc.text(`Notiz: ${invoice.paidNotes}`, 22, y + 22);
    }
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Erstellt mit EasyInvoice.at', pageWidth / 2, 280, { align: 'center' });
  
  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-AT');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
