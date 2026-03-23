import { useApp } from "../context/AppContext";
import type { AppInvoice } from "../types";

export function useInvoices() {
  const { invoices } = useApp();
  return { invoices };
}

export function useInvoice(id: string) {
  const { invoices } = useApp();
  return invoices.find((i) => i.id === id) ?? null;
}

export function useInvoiceMutations() {
  const { setInvoices, showToast } = useApp();

  function syncInvoice(updated: AppInvoice) {
    setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)));
  }

  function createInvoice(inv: AppInvoice) {
    setInvoices((p) => [inv, ...p]);
  }

  return { syncInvoice, createInvoice, showToast };
}
