# EasyInvoice.at - Complete Documentation

## Project Overview

**Name:** EasyInvoice.at  
**Type:** E-invoicing Web Application (SaaS)  
**Purpose:** Help Austrian/German small businesses create legally compliant E-Rechnungen (XRechnung format)  
**Target Users:** Solopreneurs, freelancers, small tradespeople (1-5 employees)

## Why This Project Exists

**Problem:** E-invoicing is mandatory for B2B in Germany since Jan 2025, coming to Austria. Existing solutions (Lexware, sevdesk, DATEV) are too complex and expensive for small businesses.

**Solution:** Dead-simple, guided invoice creator that outputs PDF + XRechnung (XML) without requiring accounting software expertise.

## Current Status (2026-03-15)

### ✅ Working Features
- Business profile management (edit/reset)
- Customer management with search
- Invoice creation with line items
- Auto-calculated totals (subtotal, VAT, total)
- PDF export (professional layout)
- XRechnung XML export (EN 16931 compliant)
- Invoice history with search + date filter
- Download PDF/XML from history
- Preview invoices in history
- Mark invoices as paid/unpaid
- Payment modal: payment method (Bar, Banküberweisung, Karte, PayPal, Sonstiges) + notes
- Company logo upload (appears on invoices)

### ⏳ Known Issues
- Logo positioning in PDF needs adjustment
- Preview modal doesn't show logo yet
- No ZUGFeRD export (v2)
- No batch download
- No edit existing invoices

## Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **PDF:** jsPDF
- **Storage:** localStorage (no backend)
- **Fonts:** Space Grotesk (headings) + Outfit (body)

## File Structure

```
~/Documents/Projects/EasyInvoice/
├── SPEC.md                    # Original specification
├── package.json               # Dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind config (teal primary #0D9488)
├── index.html                 # Entry HTML
├── tsconfig.json              # TypeScript config
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Main application (ALL COMPONENTS HERE)
    ├── index.css             # Global styles + Tailwind
    ├── types/
    │   └── index.ts         # TypeScript interfaces
    └── lib/
        ├── storage.ts        # localStorage helpers
        ├── pdf.ts            # PDF generation (jsPDF)
        └── xrechnung.ts      # XRechnung XML generation
```

## Data Models

### BusinessProfile
```typescript
{
  companyName: string
  address: string
  city: string
  postalCode: string
  country: string
  vatId: string
  phone: string
  email: string
  logo?: string  // base64 encoded
}
```

### Customer
```typescript
{
  id: string
  name: string
  address: string
  vatId: string
}
```

### Invoice
```typescript
{
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customer: Customer
  items: LineItem[]
  subtotal: number
  vatTotal: number
  total: number
  notes: string
  paid: boolean
  paidDate?: string
  paidMethod?: string  // Bar, Banküberweisung, Karte, PayPal, Sonstiges
  paidNotes?: string
  createdAt: string
}
```

### LineItem
```typescript
{
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number  // 0, 10, or 20
}
```

## localStorage Keys

- `easyinvoice_profile` - Business profile
- `easyinvoice_customers` - Customer array
- `easyinvoice_invoices` - Invoice array
- `easyinvoice_nextNumber` - Next invoice number (integer)

## Running the Project

```bash
cd ~/Documents/Projects/EasyInvoice
npm install   # If needed
npm run dev   # Start dev server at localhost:5173
npm run build # Build for production
```

## Key Functions in App.tsx

### State
- `step` - Current wizard step (1-4)
- `profile` - BusinessProfile or null
- `customers` - Customer[]
- `invoices` - Invoice[]
- `selectedCustomer` - Currently selected customer
- `lineItems` - Current invoice line items
- `showHistory` - Show invoice history view
- `previewInvoice` - Invoice being previewed
- `paymentInvoice` - Invoice getting payment recorded
- `editingProfile` - Show profile edit form

### Key Functions
- `handleSaveProfile(p)` - Save business profile
- `handleSelectCustomer(c)` - Select customer for invoice
- `handleCreateInvoice()` - Save new invoice
- `handleExportPDF()` / `handleExportXRechnung()` - Export current invoice
- `togglePaid(inv)` / `openPayment(inv)` - Mark as paid with details
- `savePayment()` - Save payment method + notes

## UI Components (All in App.tsx)

1. **App** - Main container, routing between steps
2. **BusinessProfileForm** - Create/edit business profile (includes logo upload)
3. **CustomerStep** - Select or add customer (includes search)
4. **InvoiceForm** - Create invoice with line items
5. **ReviewExport** - Review and export created invoice
6. **InvoicePreviewModal** - Full invoice preview (inline, not separate component)

## Color Scheme

- Primary: `#0D9488` (teal-600)
- Primary Hover: `#0F766E` (teal-700)
- Accent: `#F59E0B` (amber-500 for XRechnung buttons)
- Background: `#F8FAFC` (slate-50)
- Text: `#1E293B` (slate-800)

## Next Steps (Priority Order)

1. Fix logo in PDF positioning
2. Show logo in preview modal
3. Add ZUGFeRD export (PDF + XML embedded)
4. Add batch download
5. Allow editing existing invoices
6. Deploy to Vercel

## Pricing Model (from plan)

- **Free:** 3 invoices/month, PDF only
- **Starter:** €5/mo - Unlimited invoices + XRechnung
- **Pro:** €10/mo - + ZUGFeRD, customer database, history
- **Business:** €20/mo - + multi-user, recurring invoices

---

*Documentation created: 2026-03-15*
*Last updated: 2026-03-15 00:55*
*Project location: ~/Documents/Projects/EasyInvoice/*