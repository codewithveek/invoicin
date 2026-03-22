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
