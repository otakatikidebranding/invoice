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

export type PaymentScheme = 'dp_50' | 'full';

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
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;
  notes: string;
  terms: string[];
  currency: string;
}
