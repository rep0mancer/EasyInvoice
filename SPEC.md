# EasyInvoice.at - MVP Specification

## Project Overview
- **Name:** EasyInvoice.at
- **Type:** Single-page web application (PWA)
- **Core functionality:** Dead-simple E-invoice creator for Austrian/German small businesses
- **Target users:** Solopreneurs, freelancers, small tradespeople (1-5 employees)

## Tech Stack
- React 18 with Vite
- TypeScript
- shadcn/ui for components
- Tailwind CSS for styling
- jsPDF for PDF generation
- Local storage for data persistence

## UI/UX Specification

### Design System

**Colors:**
- Primary: #0D9488 (teal-600)
- Primary Hover: #0F766E (teal-700)
- Accent: #F59E0B (amber-500)
- Background: #F8FAFC (slate-50)
- Card: #FFFFFF
- Text: #1E293B (slate-800)
- Text Muted: #64748B (slate-500)
- Border: #E2E8F0 (slate-200)
- Error: #EF4444 (red-500)
- Success: #22C55E (green-500)

**Typography:**
- Headings: Space Grotesk (Google Fonts)
- Body: Outfit (Google Fonts)
- Sizes: h1: 32px, h2: 24px, h3: 20px, body: 16px, small: 14px

**Spacing:**
- Base unit: 4px
- Card padding: 24px
- Section gap: 32px
- Element gap: 16px

### Layout Structure

**Header:**
- Logo/App name "EasyInvoice.at" on left
- Current step indicator (1-4) in center
- Settings gear icon on right

**Main Content:**
- Centered card (max-width: 520px)
- White background, rounded corners (16px)
- Shadow for elevation

**Footer:**
- Minimal, only copyright text
- "Made for Austrian/German small businesses"

### Pages/Steps

#### Step 1: Business Profile (first time only)
Fields:
- Company name (required)
- Address - Street + Number (required)
- City + Postal code (required)
- Country (default: Austria)
- VAT ID / UID (optional)
- Logo upload (optional, base64 stored)
- Phone (optional)
- Email (optional)

Save to localStorage, skip on subsequent visits.

#### Step 2: Customer Selection
- Dropdown: Select saved customer OR "Add new customer"
- If "Add new customer":
  - Customer name (required)
  - Address (required)
  - VAT ID (optional, required for B2B)
- "Save customer for later" checkbox

#### Step 3: Invoice Details
- Invoice number (auto-generated: INV-2026-001)
- Invoice date (default: today)
- Due date (default: +14 days)
- Line items table:
  - Description (text input)
  - Quantity (number, default: 1)
  - Unit price (EUR)
  - VAT rate (dropdown: 0%, 10%, 20%)
  - Line total (auto-calculated)
- "Add another item" button
- Notes/Terms (optional textarea)

#### Step 4: Review & Export
- Invoice preview (PDF-like display)
- Shows all data clearly
- Export buttons:
  - "Als PDF herunterladen" (Primary)
  - "Als XRechnung (XML) herunterladen" (Secondary)
  - "Als ZUGFeRD herunterladen" (Secondary)
- "Neue Rechnung" button after download

### Components Needed

1. **ProgressDots** - Shows current step (4 dots)
2. **FormCard** - Main container with styling
3. **Input** - Text, number, date inputs with labels
4. **Select** - Dropdown with options
5. **Button** - Primary, Secondary, Ghost variants
6. **LineItemRow** - Invoice line item with delete
7. **InvoicePreview** - Read-only invoice display
8. **CustomerSelect** - Customer dropdown + add new

### Animations

- Page transitions: Fade in (200ms ease-out)
- Button hover: Scale 1.02, shadow increase
- Form errors: Shake animation
- Success: Confetti or checkmark animation

## Functionality Specification

### Data Flow

1. **localStorage keys:**
   - `easyinvoice_profile` - Business profile object
   - `easyinvoice_customers` - Array of customer objects
   - `easyinvoice_invoices` - Array of created invoices
   - `easyinvoice_nextNumber` - Next invoice number integer

2. **Invoice object structure:**
   ```typescript
   {
     id: string,
     invoiceNumber: string,
     invoiceDate: string, // ISO
     dueDate: string, // ISO
     customer: Customer,
     items: LineItem[],
     subtotal: number,
     vatTotal: number,
     total: number,
     notes: string,
     createdAt: string // ISO
   }
   ```

### PDF Generation

- Use jsPDF library
- A4 format
- Include: Logo (if uploaded), company details, customer details, line items table, totals
- Professional layout with borders

### XRechnung Generation

- Build XML string manually (EN 16931 compliant)
- Include all mandatory BT fields
- Valid XML structure
- Download as .xml file

### ZUGFeRD Generation

- Create PDF first (jsPDF)
- Embed XML as attachment (PDF/A-3)
- Use zugferd library or manual XML embedding

### Edge Cases

- No business profile: Redirect to step 1
- Empty line items: Show error
- Invalid VAT calculation: Auto-fix
- Very long descriptions: Truncate in preview
- Offline mode: Show warning, still allow PDF generation

## Acceptance Criteria

### Must Have (MVP)
- [ ] Business profile form saves to localStorage
- [ ] Customer can be added and saved
- [ ] Invoice with multiple line items can be created
- [ ] Invoice numbers auto-increment
- [ ] PDF export works and looks professional
- [ ] XRechnung XML export is valid
- [ ] Mobile responsive (test on 375px width)
- [ ] Data persists across page refreshes

### Should Have
- [ ] ZUGFeRD export
- [ ] Invoice preview before export
- [ ] Invoice history page
- [ ] Delete/edit invoices

### Nice to Have (v2)
- [ ] Customer database management
- [ ] Recurring invoices
- [ ] Quote to invoice conversion
- [ ] Email delivery

---

## File Structure

```
EasyInvoice/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── ui/           # shadcn components
    │   ├── ProgressDots.tsx
    │   ├── BusinessForm.tsx
    │   ├── CustomerForm.tsx
    │   ├── InvoiceForm.tsx
    │   ├── InvoicePreview.tsx
    │   └── ExportButtons.tsx
    ├── lib/
    │   ├── storage.ts    # localStorage helpers
    │   ├── pdf.ts        # jsPDF generation
    │   ├── xrechnung.ts  # XML generation
    │   └── zugferd.ts    # ZUGFeRD generation
    ├── types/
    │   └── index.ts
    └── data/
        └── constants.ts   # VAT rates, etc.
```

---

*Ready for Codex implementation*