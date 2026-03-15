import { useState, useEffect } from 'react'
import { BusinessProfile, Customer, Invoice, LineItem } from './types'
import { 
  saveProfile, getProfile, saveCustomer, getCustomers, 
  saveInvoice, getNextInvoiceNumber, incrementInvoiceNumber, 
  generateId 
} from './lib/storage'
import { generatePDF } from './lib/pdf'
import { downloadXRechnung } from './lib/xrechnung'
import { FileText, Download, Plus, Trash2, ArrowRight, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4

function App() {
  const [step, setStep] = useState<Step>(1)
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({})
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: generateId(), description: '', quantity: 1, unitPrice: 0, vatRate: 20 }
  ])
  const [notes, setNotes] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [invSearch, setInvSearch] = useState('')
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    const savedProfile = getProfile()
    if (savedProfile) {
      setProfile(savedProfile)
      setCustomers(getCustomers())
      setInvoices(getInvoices())
    }
    const num = getNextInvoiceNumber()
    setInvoiceNumber(num)
    const today = new Date().toISOString().split('T')[0]
    setInvoiceDate(today)
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setDueDate(due)
  }, [])

  function getInvoices(): Invoice[] {
    const data = localStorage.getItem('easyinvoice_invoices')
    return data ? JSON.parse(data) : []
  }

  function openPayment(inv: Invoice) {
    setPaymentInvoice(inv)
    setPaymentMethod(inv.paidMethod || '')
    setPaymentNotes(inv.paidNotes || '')
  }
  
  function savePayment() {
    if (!paymentInvoice) return
    const updated = invoices.map(i => i.id === paymentInvoice.id ? { 
      ...i, 
      paid: !i.paid,
      paidMethod: paymentMethod,
      paidNotes: paymentNotes,
      paidDate: !paymentInvoice.paid ? new Date().toISOString().split('T')[0] : undefined
    } : i)
    localStorage.setItem('easyinvoice_invoices', JSON.stringify(updated))
    setInvoices(updated)
    setPaymentInvoice(null)
  }

  function handleSaveProfile(p: BusinessProfile) {
    saveProfile(p)
    setProfile(p)
    setStep(2)
  }

  function handleSelectCustomer(customer: Customer | null) {
    setSelectedCustomer(customer)
    if (customer) setIsNewCustomer(false)
  }

  function handleAddCustomer() {
    if (!newCustomer.name || !newCustomer.address) return
    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name,
      address: newCustomer.address,
      vatId: newCustomer.vatId || ''
    }
    saveCustomer(customer)
    setCustomers(getCustomers())
    setSelectedCustomer(customer)
    setIsNewCustomer(false)
  }

  function handleContinueToInvoice() {
    if (!selectedCustomer && !isNewCustomer) return
    if (isNewCustomer && newCustomer.name && newCustomer.address) handleAddCustomer()
    setStep(3)
  }

  function addLineItem() {
    setLineItems([...lineItems, { id: generateId(), description: '', quantity: 1, unitPrice: 0, vatRate: 20 }])
  }

  function removeLineItem(id: string) {
    if (lineItems.length > 1) setLineItems(lineItems.filter(item => item.id !== id))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function calculateTotals() {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const vatTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0)
    return { subtotal, vatTotal, total: subtotal + vatTotal }
  }

  function handleCreateInvoice() {
    if (!profile || !selectedCustomer) return
    const { subtotal, vatTotal, total } = calculateTotals()
    const invoice: Invoice = {
      id: generateId(), invoiceNumber, invoiceDate, dueDate,
      customer: selectedCustomer, items: lineItems, paid: false,
      subtotal, vatTotal, total, notes, createdAt: new Date().toISOString()
    }
    saveInvoice(invoice)
    incrementInvoiceNumber()
    setInvoices(getInvoices())
    setStep(4)
  }

  function handleExportPDF() {
    if (!profile || !selectedCustomer) return
    const { subtotal, vatTotal, total } = calculateTotals()
    const invoice: Invoice = {
      id: generateId(), invoiceNumber, invoiceDate, dueDate,
      customer: selectedCustomer, items: lineItems, paid: false,
      subtotal, vatTotal, total, notes, createdAt: new Date().toISOString()
    }
    generatePDF(profile, invoice)
  }

  function handleExportXRechnung() {
    if (!profile || !selectedCustomer) return
    const { subtotal, vatTotal, total } = calculateTotals()
    const invoice: Invoice = {
      id: generateId(), invoiceNumber, invoiceDate, dueDate,
      customer: selectedCustomer, items: lineItems, paid: false,
      subtotal, vatTotal, total, notes, createdAt: new Date().toISOString()
    }
    downloadXRechnung(profile, invoice)
  }

  function handleNewInvoice() {
    setInvoiceNumber(getNextInvoiceNumber())
    setInvoiceDate(new Date().toISOString().split('T')[0])
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setDueDate(due)
    setLineItems([{ id: generateId(), description: '', quantity: 1, unitPrice: 0, vatRate: 20 }])
    setSelectedCustomer(null)
    setIsNewCustomer(false)
    setNewCustomer({})
    setNotes('')
    setStep(2)
  }

  // Preview Modal
  if (previewInvoice && profile) {
    const inv = previewInvoice
    const subtotal = inv.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
    const vatTotal = inv.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.vatRate / 100), 0)
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setPreviewInvoice(null)} className="text-slate-500">← Zurück</button>
            <div className="flex gap-2">
              <button onClick={() => generatePDF(profile, inv)} className="px-3 py-1 bg-slate-100 rounded text-sm">PDF</button>
              <button onClick={() => downloadXRechnung(profile, inv)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-sm">XML</button>
            </div>
          </div>
          {profile.logo && <img src={profile.logo} alt="Logo" className="h-16 mb-4" />}
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-primary">{profile.companyName}</h2>
            <p className="text-sm text-slate-500">{profile.address}, {profile.postalCode} {profile.city}</p>
          </div>
          <div className="flex justify-between mb-6">
            <div><p className="text-xs text-slate-500 uppercase">Rechnungsnr.</p><p className="font-bold">{inv.invoiceNumber}</p></div>
            <div><p className="text-xs text-slate-500 uppercase">Datum</p><p>{new Date(inv.invoiceDate).toLocaleDateString('de-AT')}</p></div>
            <div><p className="text-xs text-slate-500 uppercase">Fällig</p><p>{new Date(inv.dueDate).toLocaleDateString('de-AT')}</p></div>
          </div>
          <div className="mb-6"><p className="text-xs text-slate-500 uppercase mb-1">Rechnungsempfänger</p><p className="font-medium">{inv.customer.name}</p><p className="text-sm text-slate-500">{inv.customer.address}</p></div>
          <table className="w-full mb-4 text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 text-xs text-slate-500">Beschreibung</th><th className="text-right py-2 text-xs text-slate-500">Menge</th><th className="text-right py-2 text-xs text-slate-500">Preis</th><th className="text-right py-2 text-xs text-slate-500">Gesamt</th></tr></thead>
            <tbody>
              {inv.items.map((item, i) => <tr key={i} className="border-b"><td className="py-2">{item.description}</td><td className="text-right py-2">{item.quantity}</td><td className="text-right py-2">{item.unitPrice.toFixed(2)} €</td><td className="text-right py-2">{(item.quantity * item.unitPrice).toFixed(2)} €</td></tr>)}
            </tbody>
          </table>
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm"><span>Zwischensumme</span><span>{subtotal.toFixed(2)} €</span></div>
            <div className="flex justify-between text-sm"><span>MwSt</span><span>{vatTotal.toFixed(2)} €</span></div>
            <div className="flex justify-between text-xl font-bold text-primary mt-2"><span>Gesamt</span><span>{inv.total.toFixed(2)} €</span></div>
          </div>
          {inv.notes && <div className="mt-4 p-3 bg-slate-50 rounded text-sm">{inv.notes}</div>}
          {inv.paid && (inv.paidMethod || inv.paidNotes) && (
            <div className="mt-4 p-3 bg-green-50 rounded text-sm">
              <p className="font-medium text-green-800 mb-1">✓ Bezahlt</p>
              {inv.paidMethod && <p className="text-green-700">Zahlungsart: {inv.paidMethod}</p>}
              {inv.paidDate && <p className="text-green-700">Datum: {new Date(inv.paidDate).toLocaleDateString('de-AT')}</p>}
              {inv.paidNotes && <p className="text-green-600 text-xs mt-1">{inv.paidNotes}</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Payment Modal
  if (paymentInvoice) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Zahlung erfassen</h2>
          <p className="text-sm text-slate-500 mb-4">Rechnung: {paymentInvoice.invoiceNumber} - {paymentInvoice.total.toFixed(2)} €</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zahlungsart</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- Auswählen --</option>
                <option value="Bar">Bar</option>
                <option value="Banküberweisung">Banküberweisung</option>
                <option value="Karte">Karte</option>
                <option value="PayPal">PayPal</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notiz (z.B. Rechnungsnr. der Zahlung)</label>
              <input type="text" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Optional..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPaymentInvoice(null)} className="flex-1 py-3 border rounded-lg">Abbrechen</button>
              <button onClick={savePayment} className="flex-1 py-3 bg-primary text-white rounded-lg">Speichern</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showHistory) {
    const filteredInvoices = invoices.filter(inv => {
      const matchSearch = !invSearch || inv.invoiceNumber.toLowerCase().includes(invSearch.toLowerCase()) || inv.customer.name.toLowerCase().includes(invSearch.toLowerCase())
      const invDate = new Date(inv.invoiceDate)
      const matchFrom = !dateFrom || invDate >= new Date(dateFrom)
      const matchTo = !dateTo || invDate <= new Date(dateTo)
      return matchSearch && matchFrom && matchTo
    })
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold text-slate-800">Rechnungsübersicht</h1>
            <button onClick={() => setShowHistory(false)} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-medium">← Zurück</button>
          </div>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Rechnung oder Kunde suchen..." value={invSearch} onChange={e => setInvSearch(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-lg text-sm" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <p className="text-xs text-slate-400 mb-3">{filteredInvoices.length} von {invoices.length} Rechnungen</p>
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Keine Rechnungen gefunden.</p>
            ) : filteredInvoices.map(inv => (
              <div key={inv.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{inv.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">{inv.customer.name}</p>
                    <p className="text-xs text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString('de-AT')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{inv.total.toFixed(2)} €</p>
                    <div className="flex gap-1 mt-2">
                      
                      <button onClick={() => setPreviewInvoice(inv)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">👁</button>
                      <button onClick={() => openPayment(inv)} className={`text-xs px-2 py-1 rounded ${inv.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{inv.paid ? '✓ Bezahlt' : '○ Offen'}</button>
                      <button onClick={() => { if(profile) generatePDF(profile, inv) }} className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">PDF</button>
                      <button onClick={() => { if(profile) downloadXRechnung(profile, inv) }} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200">XML</button>
                    </div>
                  </div>
                </div>
                {inv.paid && (inv.paidMethod || inv.paidNotes) && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    {inv.paidMethod && <span className="mr-2">💳 {inv.paidMethod}</span>}
                    {inv.paidDate && <span className="mr-2">📅 {new Date(inv.paidDate).toLocaleDateString('de-AT')}</span>}
                    {inv.paidNotes && <span className="text-slate-400">{inv.paidNotes}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-primary">EasyInvoice.at</h1>
          <button onClick={() => setEditingProfile(true)} className="text-xs text-slate-400 hover:text-slate-600">✏️ Bearbeiten</button>
          <button onClick={() => setShowHistory(true)} className="p-2 text-slate-500 hover:text-slate-700"><FileText size={20} /></button>
        </div>
      </header>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${s === step ? 'bg-primary text-white' : s < step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {s < step ? <Check size={16} /> : s}
                </div>
                {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <main className="max-w-xl mx-auto px-4 py-6">
        {editingProfile && profile && <BusinessProfileForm onSave={(p) => { saveProfile(p); setProfile(p); setEditingProfile(false); }} initialData={profile} />}
        {step === 1 && !profile && !editingProfile && <BusinessProfileForm onSave={handleSaveProfile} />}
        {step === 1 && profile && <CustomerStep {...{ customers, selectedCustomer, isNewCustomer, newCustomer, onSelect: handleSelectCustomer, onAddNew: () => { setIsNewCustomer(true); setSelectedCustomer(null); }, onNewCustomerChange: setNewCustomer, onContinue: handleContinueToInvoice, onBack: () => setShowHistory(true) }} />}
        {step === 3 && <InvoiceForm {...{ invoiceNumber, invoiceDate, dueDate, lineItems, notes, customer: selectedCustomer!, onInvoiceNumberChange: setInvoiceNumber, onInvoiceDateChange: setInvoiceDate, onDueDateChange: setDueDate, onAddItem: addLineItem, onRemoveItem: removeLineItem, onUpdateItem: updateLineItem, onNotesChange: setNotes, onCreate: handleCreateInvoice, onBack: () => setStep(2), setLineItems }} />}
        {step === 4 && <ReviewExport {...{ invoiceNumber, customer: selectedCustomer!, lineItems, onExportPDF: handleExportPDF, onExportXRechnung: handleExportXRechnung, onNew: handleNewInvoice }} />}
      </main>
      <footer className="text-center py-6 text-slate-400 text-sm">Made for Austrian & German small businesses</footer>
    </div>
  )
}

function BusinessProfileForm({ onSave, initialData }: { onSave: (p: BusinessProfile) => void; initialData?: BusinessProfile }) {
  const [form, setForm] = useState<BusinessProfile>(initialData || { companyName: '', address: '', city: '', postalCode: '', country: 'AT', vatId: '', phone: '', email: '', logo: '' })
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setForm({...form, logo: reader.result as string})
      reader.readAsDataURL(file)
    }
  }
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.companyName || !form.address || !form.city || !form.postalCode) return; onSave(form) }
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">Dein Unternehmen</h2>
      <p className="text-slate-500 mb-6">Erstelle dein Business-Profil für deine Rechnungen.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.logo && <img src={form.logo} alt="Logo" className="h-20 mb-4" />}
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Logo (optional)</label><input type="file" accept="image/*" onChange={handleLogo} className="w-full text-sm" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Firmenname *</label><input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Max Mustermann GmbH" required /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Adresse *</label><input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Musterstraße 123" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">PLZ *</label><input type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="1234" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Stadt *</label><input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Wien" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">UID-Nummer</label><input type="text" value={form.vatId} onChange={e => setForm({...form, vatId: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="AT12345678901" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="+43 664 1234567" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="info@firma.at" /></div>
        </div>
        <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg mt-6">Speichern</button>
        {initialData && <button type="button" onClick={() => onSave(form)} className="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl mt-2">Abbrechen</button>}
      </form>
    </div>
  )
}

function CustomerStep({ customers, selectedCustomer, isNewCustomer, newCustomer, onSelect, onAddNew, onNewCustomerChange, onContinue, onBack }: { customers: Customer[]; selectedCustomer: Customer | null; isNewCustomer: boolean; newCustomer: Partial<Customer>; onSelect: (c: Customer | null) => void; onAddNew: () => void; onNewCustomerChange: (c: Partial<Customer>) => void; onContinue: () => void; onBack: () => void, setLineItems?: (items: LineItem[]) => void }) {
  const [search, setSearch] = useState('')
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-slate-500 text-sm mb-2">← Zurück</button>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">Kunde auswählen</h2>
        <p className="text-slate-500 mb-6">Wähle einen bestehenden Kunden oder füge einen neuen hinzu.</p>
        {customers.length > 0 && !isNewCustomer && <div className="mb-3"><input type="text" placeholder="Kunde suchen..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" /></div> && <div className="space-y-2 mb-4">{filtered.map(c => <button key={c.id} onClick={() => onSelect(c)} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedCustomer?.id === c.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}`}><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-500">{c.address}</p></button>)}</div>}
        {!isNewCustomer && <button onClick={onAddNew} className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 flex items-center justify-center gap-2 hover:border-primary hover:text-primary"><Plus size={20} /> Neuen Kunden hinzufügen</button>}
        {isNewCustomer && <div className="space-y-4 pt-4 border-t border-slate-200"><h3 className="font-semibold">Neuer Kunde</h3><div><input type="text" value={newCustomer.name || ''} onChange={e => onNewCustomerChange({...newCustomer, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Name *" /></div><div><input type="text" value={newCustomer.address || ''} onChange={e => onNewCustomerChange({...newCustomer, address: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Adresse *" /></div><div><input type="text" value={newCustomer.vatId || ''} onChange={e => onNewCustomerChange({...newCustomer, vatId: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="UID (optional)" /></div></div>}
        <button onClick={onContinue} disabled={(!selectedCustomer && !isNewCustomer) || (isNewCustomer && (!newCustomer.name || !newCustomer.address))} className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-semibold rounded-xl mt-6 flex items-center justify-center gap-2">Weiter <ArrowRight size={20} /></button>
      </div>
    </div>
  )
}

function InvoiceForm({ invoiceNumber, invoiceDate, dueDate, lineItems, notes, customer, onInvoiceNumberChange, onInvoiceDateChange, onDueDateChange, onAddItem, onRemoveItem, onUpdateItem, onNotesChange, onCreate, onBack }: { invoiceNumber: string; invoiceDate: string; dueDate: string; lineItems: LineItem[]; notes: string; customer: Customer; onInvoiceNumberChange: (s: string) => void; onInvoiceDateChange: (s: string) => void; onDueDateChange: (s: string) => void; onAddItem: () => void; onRemoveItem: (id: string) => void; onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void; onNotesChange: (s: string) => void; onCreate: () => void; onBack: () => void; setLineItems: (items: LineItem[]) => void }) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const vatTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0)
  const total = subtotal + vatTotal
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-slate-500 text-sm mb-2">← Zurück</button>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-heading font-bold mb-2">Rechnung erstellen</h2>
        <p className="text-slate-500 mb-6">Für: <span className="font-semibold">{customer.name}</span></p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div><label className="block text-sm font-medium mb-1">Rechnungsnr.</label><input type="text" value={invoiceNumber} onChange={e => onInvoiceNumberChange(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Datum</label><input type="date" value={invoiceDate} onChange={e => onInvoiceDateChange(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Fällig</label><input type="date" value={dueDate} onChange={e => onDueDateChange(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
        </div>
        <div className="space-y-3 mb-4">
          <h3 className="font-semibold">Positionen</h3>
          {lineItems.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex gap-2 mb-2">
                <input type="text" value={item.description} onChange={e => onUpdateItem(item.id, 'description', e.target.value)} placeholder="Beschreibung" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                {lineItems.length > 1 && <button onClick={() => onRemoveItem(item.id)} className="text-red-500 p-2"><Trash2 size={18} /></button>}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input type="number" value={item.quantity} onChange={e => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Stk" min="1" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input type="number" value={item.unitPrice} onChange={e => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="€ pro Stück" step="0.01" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <select value={item.vatRate} onChange={e => onUpdateItem(item.id, 'vatRate', parseFloat(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg text-sm"><option value="0">0%</option><option value="10">10%</option><option value="20">20%</option></select>
                <div className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-right">{(item.quantity * item.unitPrice).toFixed(2)} €</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onAddItem} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary flex items-center justify-center gap-2 mb-6"><Plus size={18} /> Weitere Position</button>
        <div className="mb-6"><label className="block text-sm font-medium mb-1">Anmerkungen</label><textarea value={notes} onChange={e => onNotesChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" rows={2} placeholder="Zahlungsziel, Bankverbindung, etc." /></div>
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Zwischensumme</span><span className="font-medium">{subtotal.toFixed(2)} €</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">MwSt</span><span className="font-medium">{vatTotal.toFixed(2)} €</span></div>
          <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-slate-200"><span>Gesamtbetrag</span><span>{total.toFixed(2)} €</span></div>
        </div>
        <button onClick={onCreate} className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl mt-6 flex items-center justify-center gap-2">Weiter zur Prüfung <ArrowRight size={20} /></button>
      </div>
    </div>
  )
}

function ReviewExport({ invoiceNumber, customer, lineItems, onExportPDF, onExportXRechnung, onNew }: { invoiceNumber: string; customer: Customer; lineItems: LineItem[]; onExportPDF: () => void; onExportXRechnung: () => void; onNew: () => void }) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const vatTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0)
  const total = subtotal + vatTotal
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Check className="text-green-600" size={24} /></div>
          <div><h2 className="text-xl font-heading font-bold">Rechnung erstellt!</h2><p className="text-slate-500">{invoiceNumber}</p></div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3">Vorschau</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Kunde:</span><span className="font-medium">{customer.name}</span></div>
            {lineItems.map((item, i) => <div key={i} className="flex justify-between"><span className="text-slate-500">{item.description || 'Position ' + (i+1)}</span><span>{(item.quantity * item.unitPrice).toFixed(2)} €</span></div>)}
            <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-semibold">Gesamt:</span><span className="font-bold text-primary">{total.toFixed(2)} €</span></div>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={onExportPDF} className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2"><Download size={20} /> Als PDF herunterladen</button>
          <button onClick={onExportXRechnung} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"><FileText size={20} /> Als XRechnung (XML)</button>
        </div>
        <button onClick={onNew} className="w-full py-4 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl mt-4 hover:bg-slate-50">+ Neue Rechnung</button>
      </div>
    </div>
  )
}

export function InvoicePreviewModal({ invoice, profile, onClose }: { invoice: Invoice; profile: BusinessProfile; onClose: () => void }) {
  const subtotal = invoice.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const vatTotal = invoice.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.vatRate / 100), 0)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div><h2 className="text-2xl font-bold text-primary">{profile.companyName}</h2><p className="text-sm text-slate-500">{profile.address}, {profile.postalCode} {profile.city}</p></div>
          <button onClick={onClose} className="text-2xl">export default Apptimes;</button>
        </div>
        <div className="flex justify-between mb-4">
          <div><p className="text-xs text-slate-500">Rechnung</p><p className="font-bold">{invoice.invoiceNumber}</p></div>
          <div><p className="text-xs text-slate-500">Datum</p><p>{new Date(invoice.invoiceDate).toLocaleDateString("de-AT")}</p></div>
          <div><p className="text-xs text-slate-500">Fällig</p><p>{new Date(invoice.dueDate).toLocaleDateString("de-AT")}</p></div>
        </div>
        <div className="mb-4"><p className="text-xs text-slate-500">Kunde</p><p>{invoice.customer.name}</p><p className="text-sm text-slate-500">{invoice.customer.address}</p></div>
        <table className="w-full mb-4 text-sm"><thead><tr className="border-b"><th className="text-left py-2">Beschreibung</th><th className="text-right py-2">Menge</th><th className="text-right py-2">Preis</th><th className="text-right py-2">Gesamt</th></tr></thead><tbody>
        {invoice.items.map((item, i) => <tr key={i} className="border-b"><td className="py-2">{item.description}</td><td className="text-right">{item.quantity}</td><td className="text-right">{item.unitPrice.toFixed(2)} €</td><td className="text-right">{(item.quantity * item.unitPrice).toFixed(2)} €</td></tr>)}
        </tbody></table>
        <div className="border-t pt-4 text-right"><p className="text-sm">Zwischensumme: {subtotal.toFixed(2)} €</p><p className="text-sm">MwSt: {vatTotal.toFixed(2)} €</p><p className="text-xl font-bold text-primary">Gesamt: {invoice.total.toFixed(2)} €</p></div>
      </div>
    </div>
  )
}

export default App
