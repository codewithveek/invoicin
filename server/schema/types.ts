// ─────────────────────────────────────────────────────────────────────────────
// TypeScript types inferred from the Drizzle schema
// ─────────────────────────────────────────────────────────────────────────────

import {
  users,
  clients,
  invoices,
  invoiceTemplates,
  invoiceEvents,
  partialPayments,
  notificationPrefs,
} from "./tables";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceEvent = typeof invoiceEvents.$inferSelect;
export type NewInvoiceEvent = typeof invoiceEvents.$inferInsert;

export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type PartialPayment = typeof partialPayments.$inferSelect;

export type NotificationPrefs = typeof notificationPrefs.$inferSelect;
export type NewNotificationPrefs = typeof notificationPrefs.$inferInsert;

// Strongly-typed JSON field shapes
export interface InvoiceItem {
  desc: string;
  qty: number;
  price: number;
}
