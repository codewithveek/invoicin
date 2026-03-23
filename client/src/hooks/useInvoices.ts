import { useApp } from "../context/AppContext";
import { invoicesApi } from "../api/invoices.api";
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
  const { setInvoices, showToast, refreshInvoices } = useApp();

  function syncInvoice(updated: AppInvoice) {
    setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)));
  }

  function createInvoice(inv: AppInvoice) {
    setInvoices((p) => [inv, ...p]);
  }

  async function sendInvoice(id: string) {
    await invoicesApi.send(id);
    setInvoices((p) =>
      p.map((i) => (i.id === id ? { ...i, status: "sent" as const } : i))
    );
  }

  async function remindInvoice(id: string) {
    await invoicesApi.remind(id);
  }

  async function updateInvoice(id: string, data: Partial<AppInvoice>) {
    const updated = await invoicesApi.update(id, data);
    setInvoices((p) => p.map((i) => (i.id === id ? { ...i, ...updated } : i)));
  }

  async function recordPayment(
    id: string,
    data: { amount: number; currency: string; note?: string; paidDate: string }
  ) {
    await invoicesApi.recordPayment(id, data);
    await refreshInvoices();
  }

  async function downloadPdf(id: string) {
    const blob = await invoicesApi.downloadPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    syncInvoice,
    createInvoice,
    sendInvoice,
    remindInvoice,
    updateInvoice,
    recordPayment,
    downloadPdf,
    showToast,
    refreshInvoices,
  };
}
