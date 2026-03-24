import type { InvoiceData } from "../email/types";
import type { Invoice, InvoiceItem } from "../schema/types";

/**
 * Maps a raw Drizzle invoice row to the InvoiceData shape expected by email / PDF renderers.
 * Handles decimal string → number conversions and null → undefined coercions.
 */
export function toEmailData(inv: Invoice): InvoiceData {
  return {
    id: inv.id,
    linkId: inv.linkId,
    type: inv.type ?? "standard",
    clientName: inv.clientName,
    clientEmail: inv.clientEmail ?? "",
    currency: inv.currency,
    items: inv.items as InvoiceItem[],
    total: parseFloat(inv.total),
    taxType: inv.taxType ?? undefined,
    taxRate: inv.taxRate != null ? parseFloat(inv.taxRate) : undefined,
    taxAmount: inv.taxAmount != null ? parseFloat(inv.taxAmount) : undefined,
    deposit: inv.deposit != null ? parseFloat(inv.deposit) : undefined,
    // mysql2 returns date columns as strings at runtime despite the TS type being Date
    issueDate: inv.issueDate as unknown as string,
    dueDate:
      inv.dueDate != null ? (inv.dueDate as unknown as string) : undefined,
    terms: inv.terms ?? undefined,
    notes: inv.notes ?? undefined,
  };
}

/**
 * Transforms a flat DB invoice row into the nested shape expected by the client.
 */
export function formatInvoice(row: Record<string, unknown>) {
  const {
    clientName,
    clientEmail,
    clientAddress,
    clientId,
    userId,
    issueDate,
    paidDate,
    taxType,
    taxRate,
    taxAmount,
    subtotal,
    homeRate,
    amountPaid,
    remindersSent,
    lastReminderAt,
    createdAt,
    updatedAt,
    ...rest
  } = row;
  return {
    ...rest,
    client: {
      name: clientName ?? "",
      email: clientEmail ?? "",
      address: clientAddress ?? "",
    },
    tax:
      taxType && taxRate != null
        ? { type: taxType, rate: Number(taxRate) }
        : null,
    taxAmt: taxAmount != null ? Number(taxAmount) : 0,
    deposit: rest.deposit != null ? Number(rest.deposit) : 0,
    total: rest.total != null ? Number(rest.total) : 0,
    homeTotal: rest.homeTotal != null ? Number(rest.homeTotal) : null,
    created: createdAt ?? issueDate ?? "",
    paid: paidDate ?? null,
    dueDate: rest.dueDate ?? "",
    notes: rest.notes ?? "",
    terms: rest.terms ?? "",
    events: (rest.events as unknown[]) ?? [],
  };
}
