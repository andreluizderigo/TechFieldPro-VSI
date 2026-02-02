
export interface CompanyProfile {
  name: string;
  cnpj: string;
  address: string;
  number: string;
  city: string;
  state: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  website?: string;
  logoUrl?: string;
  serviceTaxRate: number;
  travelRatePerKm: number;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  zipCode?: string;
  address: string;
  number: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  unit: string;
}

export interface Service {
  id: string;
  name: string;
  hourlyRate: number;
  costPrice: number;
  description: string;
  durationMinutes: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface Appointment {
  id: string;
  quoteId: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'scheduled' | 'completed' | 'canceled';
}

export interface QuoteItem {
  id: string;
  type: 'service' | 'product';
  description: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
  durationMinutes?: number;
}

export interface ReportPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface ReportData {
  photos: ReportPhoto[];
  notes: string;
  finalDate: string;
}

export interface Quote {
  id: string;
  date: string;
  clientId: string;
  projectName: string;
  scope: string;
  deliveryTime: string;
  paymentTerms: string;
  items: QuoteItem[];
  travelDistanceKm: number;
  travelCost: number;
  discount: number;
  total: number;
  totalDurationMinutes: number;
  status: 'draft' | 'sent' | 'approved' | 'completed' | 'invoiced';
  nfseNumber?: string;
  reportData?: ReportData; // Novos dados do relatório
}

export type AppView = 'dashboard' | 'quotes' | 'clients' | 'inventory' | 'settings' | 'new-quote' | 'finance' | 'calendar' | 'report-editor';
