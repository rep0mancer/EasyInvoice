import { BusinessProfile, Customer, Invoice, LineItem } from '../types';

export function generateXRechnung(
  profile: BusinessProfile,
  invoice: Invoice
): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:2p0" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:20p0" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:20p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <rsm:ExchangedDocumentContext>
    <rsm:BusinessProcessSpecifiedDocumentContextParameter>
      <rsm:ID>urn:fdc: CEN/TS 16931:2019</rsm:ID>
    </rsm:BusinessProcessSpecifiedDocumentContextParameter>
    <rsm:GuidelineSpecifiedDocumentContextParameter>
      <rsm:ID>urn:cen.eu:en16931:2017</rsm:ID>
    </rsm:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <rsm:ID>${escapeXml(invoice.invoiceNumber)}</rsm:ID>
    <rsm:TypeCode>380</rsm:TypeCode>
    <rsm:IssueDateTime>
      <udt:DateTimeString format="102">${formatDateForXRechnung(invoice.invoiceDate)}</udt:DateTimeString>
    </rsm:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    ${generateSellerTradeParty(profile)}
    ${generateBuyerTradeParty(invoice.customer)}
    ${generateLineItems(invoice.items)}
    ${generateLegalMonetaryTotal(invoice)}
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
  
  return xml;
}

function generateSellerTradeParty(profile: BusinessProfile): string {
  return `
    <rsm:SellerTradeParty>
      <rsm:Name>${escapeXml(profile.companyName)}</rsm:Name>
      <rsm:PostalTradeAddress>
        <rsm:StreetName>${escapeXml(profile.address)}</rsm:StreetName>
        <rsm:CityName>${escapeXml(profile.city)}</rsm:CityName>
        <rsm:PostalCode>${escapeXml(profile.postalCode)}</rsm:PostalCode>
        <rsm:CountryID>${profile.country || 'AT'}</rsm:CountryID>
      </rsm:PostalTradeAddress>
      ${profile.vatId ? `<rsm:VATID>${escapeXml(profile.vatId)}</rsm:VATID>` : ''}
      ${profile.phone ? `
      <rsm:TelephoneTradeCommunication>
        <rsm:URIID>${escapeXml(profile.phone)}</rsm:URIID>
      </rsm:TelephoneTradeCommunication>` : ''}
      ${profile.email ? `
      <rsm:EmailTradeCommunication>
        <rsm:URIID>${escapeXml(profile.email)}</rsm:URIID>
      </rsm:EmailTradeCommunication>` : ''}
    </rsm:SellerTradeParty>`;
}

function generateBuyerTradeParty(customer: Customer): string {
  return `
    <rsm:BuyerTradeParty>
      <rsm:Name>${escapeXml(customer.name)}</rsm:Name>
      <rsm:PostalTradeAddress>
        <rsm:StreetName>${escapeXml(customer.address)}</rsm:StreetName>
        <rsm:CountryID>AT</rsm:CountryID>
      </rsm:PostalTradeAddress>
      ${customer.vatId ? `<rsm:VATID>${escapeXml(customer.vatId)}</rsm:VATID>` : ''}
    </rsm:BuyerTradeParty>`;
}

function generateLineItems(items: LineItem[]): string {
  return items.map((item, index) => `
    <rsm:IncludedSupplyChainTradeLineItem>
      <rsm:AssociatedDocumentLineDocument>
        <rsm:LineID>${index + 1}</rsm:LineID>
      </rsm:AssociatedDocumentLineDocument>
      <rsm:SpecifiedTradeProduct>
        <rsm:Name>${escapeXml(item.description)}</rsm:Name>
      </rsm:SpecifiedTradeProduct>
      <rsm:SpecifiedLineTradeAgreement>
        <rsm:NetPriceProductTradePrice>
          <rsm:ChargeAmount>${item.unitPrice.toFixed(2)}</rsm:ChargeAmount>
        </rsm:NetPriceProductTradePrice>
      </rsm:SpecifiedLineTradeAgreement>
      <rsm:SpecifiedLineTradeDelivery>
        <rsm:BilledQuantity unitCode="EA">${item.quantity}</rsm:BilledQuantity>
      </rsm:SpecifiedLineTradeDelivery>
      <rsm:SpecifiedLineTradeSettlement>
        <rsm:ApplicableTradeTax>
          <rsm:TypeCode>VAT</rsm:TypeCode>
          <rsm:CategoryCode>S</rsm:CategoryCode>
          <rsm:RateApplicablePercent>${item.vatRate}</rsm:RateApplicablePercent>
        </rsm:ApplicableTradeTax>
        <rsm:SpecifiedTradeSettlementLineMonetarySummation>
          <rsm:LineTotalAmount>${(item.quantity * item.unitPrice).toFixed(2)}</rsm:LineTotalAmount>
        </rsm:SpecifiedTradeSettlementLineMonetarySummation>
      </rsm:SpecifiedLineTradeSettlement>
    </rsm:IncludedSupplyChainTradeLineItem>`).join('');
}

function generateLegalMonetaryTotal(invoice: Invoice): string {
  return `
    <rsm:SpecifiedTradeSettlementHeaderMonetarySummation>
      <rsm:LineTotalAmount>${invoice.subtotal.toFixed(2)}</rsm:LineTotalAmount>
      <rsm:TaxBasisTotalAmount>${invoice.subtotal.toFixed(2)}</rsm:TaxBasisTotalAmount>
      <rsm:TaxTotalAmount currencyID="EUR">${invoice.vatTotal.toFixed(2)}</rsm:TaxTotalAmount>
      <rsm:GrandTotalAmount>${invoice.total.toFixed(2)}</rsm:GrandTotalAmount>
    </rsm:SpecifiedTradeSettlementHeaderMonetarySummation>`;
}

function formatDateForXRechnung(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadXRechnung(
  profile: BusinessProfile,
  invoice: Invoice
): void {
  const xml = generateXRechnung(profile, invoice);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoiceNumber}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
