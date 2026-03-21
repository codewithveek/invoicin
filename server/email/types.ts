export interface InvoiceItem {
  desc: string;
  qty: number;
  price: number;
}

export interface InvoiceData {
  id: string;
  linkId: string;
  type: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  items: InvoiceItem[];
  taxType?: string;
  taxRate?: number;
  taxAmount?: number;
  deposit?: number;
  total: number;
  dueDate?: string;
  terms?: string;
  notes?: string;
  issueDate: string;
}

export interface FreelancerData {
  name: string;
  businessName?: string;
  email: string;
}

export const currencySymbol = (c: string) =>
  ({ USD: "$", GBP: "£", EUR: "€", CAD: "C$", AUD: "A$", NGN: "₦" })[c] || "$";

export const fmt = (n: number, d = 2) =>
  n.toLocaleString("en", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
