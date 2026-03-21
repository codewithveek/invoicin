// ─────────────────────────────────────────────────────────────────────────────
// Types shared between the PDF renderer, email templates, and API routes
// ─────────────────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  desc: string;
  qty: number;
  price: number;
}

export interface PDFInvoice {
  id: string;
  type: string;
  currency: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
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
  status?: string;
}

export interface PDFFreelancer {
  name: string;
  businessName?: string;
  email: string;
  address?: string;
}
