import { http } from "./client";
import type { AppInvoice, InvoiceType } from "../types";

export interface CreateInvoiceInput {
  type: InvoiceType;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  currency: string;
  items: { desc: string; qty: number; price: number }[];
  taxType?: string;
  taxRate?: number;
  taxAmount?: number;
  deposit?: number;
  total: number;
  dueDate?: string;
  terms?: string;
  notes?: string;
}

export const invoicesApi = {
  list: () => http.get<AppInvoice[]>("/invoices"),
  get: (id: string) => http.get<AppInvoice>(`/invoices/${id}`),
  create: (data: CreateInvoiceInput) =>
    http.post<AppInvoice>("/invoices", data),
  update: (id: string, data: Partial<AppInvoice>) =>
    http.patch<AppInvoice>(`/invoices/${id}`, data),
  send: (id: string) => http.post<void>(`/invoices/${id}/send`, {}),
  remind: (id: string) => http.post<void>(`/invoices/${id}/remind`, {}),
  recordPayment: (
    id: string,
    data: { amount: number; currency: string; note?: string; paidDate: string }
  ) => http.post<{ success: boolean }>(`/invoices/${id}/payment`, data),
  downloadPdf: async (id: string) => {
    const res = await fetch(`/api/invoices/${id}/pdf`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("PDF download failed");
    return res.blob();
  },
};
