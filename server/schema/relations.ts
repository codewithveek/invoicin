// ─────────────────────────────────────────────────────────────────────────────
// Drizzle ORM relation definitions
// ─────────────────────────────────────────────────────────────────────────────

import { relations } from "drizzle-orm";
import {
  users,
  clients,
  invoices,
  invoiceTemplates,
  invoiceEvents,
  partialPayments,
} from "./tables";

export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
  clients: many(clients),
  templates: many(invoiceTemplates),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  events: many(invoiceEvents),
  partialPayments: many(partialPayments),
}));

export const invoiceEventsRelations = relations(invoiceEvents, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceEvents.invoiceId],
    references: [invoices.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  invoices: many(invoices),
}));
