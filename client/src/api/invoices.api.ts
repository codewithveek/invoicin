import { http } from "./client";
import type { AppInvoice } from "../types";

export const invoicesApi = {
  list: () => http.get<AppInvoice[]>("/invoices"),
  get: (id: string) => http.get<AppInvoice>(`/invoices/${id}`),
  create: (data: Omit<AppInvoice, "id" | "linkId" | "events" | "created">) =>
    http.post<AppInvoice>("/invoices", data),
  update: (id: string, data: Partial<AppInvoice>) =>
    http.patch<AppInvoice>(`/invoices/${id}`, data),
  send: (id: string) => http.post<void>(`/invoices/${id}/send`, {}),
  remind: (id: string) => http.post<void>(`/invoices/${id}/remind`, {}),
  recordPayment: (id: string) =>
    http.post<AppInvoice>(`/invoices/${id}/pay`, {}),
  cancel: (id: string) =>
    http.post<AppInvoice>(`/invoices/${id}/cancel`, {}),
};
