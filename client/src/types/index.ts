// ─────────────────────────────────────────────────────────────────────────────
// Client-side domain types — derived from the server schema
// ─────────────────────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "overdue"
  | "paid"
  | "cancelled"
  | "disputed"
  | "partial";

export type InvoiceType = "standard" | "proforma" | "deposit" | "credit";

export interface InvoiceItem {
  desc: string;
  qty: number;
  price: number | string; // string during form entry, number when stored
}

export interface InvoiceTax {
  type: string; // "vat" | "wht" | "custom"
  rate: number;
}

export interface InvoiceEvent {
  type: string;
  ts: string;
}

export interface InvoiceClient {
  name: string;
  email: string;
  address?: string;
}

export interface AppInvoice {
  id: string;
  linkId: string;
  client: InvoiceClient;
  type: InvoiceType;
  currency: string;
  items: InvoiceItem[];
  tax: InvoiceTax | null;
  taxAmt: number;
  deposit: number;
  total: number;
  status: InvoiceStatus;
  created: string;
  dueDate: string;
  paid: string | null;
  notes: string;
  terms: string;
  ngn: number | null;
  events: InvoiceEvent[];
}

export interface AppClient {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface AppTemplate {
  id: string;
  name: string;
  items: InvoiceItem[];
  currency?: string;
  terms?: string;
  notes?: string;
}
