export interface StudioInfo {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  portfolio: string;
  address: string;
  logoText: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  details?: string;
  qty: number;
  price: number;
}

export type PaymentScheme = 'dp_50' | 'dp_custom' | 'full';

export type PaymentStatus = 'draft' | 'dp_paid' | 'paid';

export interface PaymentDetails {
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  qrisImageUrl?: string;
  showQris: boolean;
  qrisNotes?: string;
}

export interface InvoiceDiscount {
  enabled: boolean;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface InvoiceTax {
  enabled: boolean;
  percentage: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuotationOption {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  timeline?: string;
  isPopular?: boolean;
  ctaText?: string;
}

export interface QuotationData {
  quotationNumber: string;
  quotationDate: string;
  validUntilDate: string;
  subject: string;
  introduction: string;
  studio: StudioInfo;
  client: ClientInfo;
  items: LineItem[];
  options?: QuotationOption[];
  optionsLayout?: 'cards' | 'table';
  selectedOptionIds?: string[];
  discount: InvoiceDiscount;
  tax: InvoiceTax;
  timeline: string;
  paymentTerms: string;
  paymentDetails: PaymentDetails;
  notes: string;
  terms: string[];
  currency: string;
  status: QuotationStatus;
  clientApprovalNotes?: string;
}

export interface SavedQuotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  clientCompany?: string;
  subject: string;
  quotationDate: string;
  validUntilDate: string;
  grandTotal: number;
  status: QuotationStatus;
  updatedAt: string;
  data: QuotationData;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  studio: StudioInfo;
  client: ClientInfo;
  items: LineItem[];
  discount: InvoiceDiscount;
  tax: InvoiceTax;
  paymentScheme: PaymentScheme;
  customDpAmount?: number;
  paymentStatus: PaymentStatus;
  dpReceivedDate?: string;
  finalReceivedDate?: string;
  paymentDetails: PaymentDetails;
  notes: string;
  terms: string[];
  currency: string;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  projectSummary?: string;
  invoiceDate: string;
  dueDate: string;
  grandTotal: number;
  remainingAmount: number;
  paymentScheme: PaymentScheme;
  paymentStatus: PaymentStatus;
  updatedAt: string;
  data: InvoiceData;
  syncedToSheetsAt?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt?: string;
}
