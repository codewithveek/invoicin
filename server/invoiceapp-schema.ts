// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — Drizzle ORM Schema (MySQL)
// Run:  npx drizzle-kit generate && npx drizzle-kit migrate
// ─────────────────────────────────────────────────────────────────────────────

import {
  mysqlTable, varchar, text, decimal, int, boolean,
  timestamp, date, json, index, uniqueIndex
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ── USERS ─────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id:           varchar("id", { length: 36 }).primaryKey(),           // ULID
  email:        varchar("email", { length: 255 }).notNull().unique(),
  name:         varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  address:      text("address"),
  phone:        varchar("phone", { length: 50 }),
  logoUrl:      varchar("logo_url", { length: 500 }),
  // Defaults
  defaultCurrency: varchar("default_currency", { length: 10 }).default("USD"),
  defaultTerms:    varchar("default_terms", { length: 100 }).default("Net 14"),
  defaultNotes:    text("default_notes"),
  // Auth
  passwordHash: varchar("password_hash", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  // Plan
  plan:         varchar("plan", { length: 20 }).default("free"),     // free | pro | business
  createdAt:    timestamp("created_at").defaultNow(),
  updatedAt:    timestamp("updated_at").defaultNow().onUpdateNow(),
}, t => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export const clients = mysqlTable("clients", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  userId:    varchar("user_id", { length: 36 }).notNull(),
  name:      varchar("name", { length: 255 }).notNull(),
  email:     varchar("email", { length: 255 }).notNull(),
  address:   text("address"),
  phone:     varchar("phone", { length: 50 }),
  company:   varchar("company", { length: 255 }),
  notes:     text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, t => ({
  userIdx: index("clients_user_idx").on(t.userId),
  emailIdx: index("clients_email_idx").on(t.email),
}));

// ── INVOICE TEMPLATES ─────────────────────────────────────────────────────────
export const invoiceTemplates = mysqlTable("invoice_templates", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  userId:    varchar("user_id", { length: 36 }).notNull(),
  name:      varchar("name", { length: 255 }).notNull(),
  // items: [{ desc: string, qty: number, price: number | null }]
  items:     json("items").notNull(),
  currency:  varchar("currency", { length: 10 }).default("USD"),
  terms:     varchar("terms", { length: 100 }),
  notes:     text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, t => ({
  userIdx: index("templates_user_idx").on(t.userId),
}));

// ── INVOICES ──────────────────────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id:       varchar("id", { length: 36 }).primaryKey(),              // INV-2026-XXXX
  linkId:   varchar("link_id", { length: 32 }).notNull().unique(),   // public share token
  userId:   varchar("user_id", { length: 36 }).notNull(),
  clientId: varchar("client_id", { length: 36 }),                    // nullable if manual entry

  // Type: standard | proforma | deposit | credit
  type:     varchar("type", { length: 20 }).default("standard"),

  // Status: draft | sent | viewed | overdue | paid | cancelled | disputed | partial
  status:   varchar("status", { length: 20 }).default("draft"),

  // Client snapshot (denormalised for history accuracy)
  clientName:    varchar("client_name", { length: 255 }).notNull(),
  clientEmail:   varchar("client_email", { length: 255 }),
  clientAddress: text("client_address"),

  // Currency & amounts
  currency:  varchar("currency", { length: 10 }).notNull().default("USD"),
  subtotal:  decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxType:   varchar("tax_type", { length: 20 }),                    // vat | wht | custom
  taxRate:   decimal("tax_rate", { precision: 5, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  deposit:   decimal("deposit", { precision: 5, scale: 2 }).default("0"),  // % e.g. 50
  total:     decimal("total", { precision: 12, scale: 2 }).notNull(),

  // NGN equivalent at time of payment
  ngnRate:   decimal("ngn_rate", { precision: 12, scale: 2 }),
  ngnTotal:  decimal("ngn_total", { precision: 14, scale: 2 }),

  // Dates
  issueDate: date("issue_date").notNull(),
  dueDate:   date("due_date"),
  paidDate:  date("paid_date"),

  // Content
  // items: [{ desc: string, qty: number, price: number }]
  items:     json("items").notNull(),
  notes:     text("notes"),
  terms:     varchar("terms", { length: 255 }),

  // Partial payment tracking
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0"),

  // Reminder tracking
  remindersSent: int("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, t => ({
  userIdx:    index("invoices_user_idx").on(t.userId),
  statusIdx:  index("invoices_status_idx").on(t.status),
  linkIdx:    uniqueIndex("invoices_link_idx").on(t.linkId),
  clientIdx:  index("invoices_client_idx").on(t.clientId),
  dueDateIdx: index("invoices_due_date_idx").on(t.dueDate),
}));

// ── INVOICE EVENTS ────────────────────────────────────────────────────────────
// Append-only log. Never update, only insert.
export const invoiceEvents = mysqlTable("invoice_events", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull(),
  // type: created | sent | viewed | downloaded | paid | cancelled | disputed |
  //        reminder_sent | partial_payment | note_added
  type:      varchar("type", { length: 50 }).notNull(),
  // Optional metadata: IP address, user agent, note text, payment amount, etc.
  meta:      json("meta"),
  // Who triggered it: user (freelancer), client, or system (cron job)
  actor:     varchar("actor", { length: 20 }).default("user"),       // user | client | system
  createdAt: timestamp("created_at").defaultNow(),
}, t => ({
  invoiceIdx: index("events_invoice_idx").on(t.invoiceId),
  typeIdx:    index("events_type_idx").on(t.type),
  createdIdx: index("events_created_idx").on(t.createdAt),
}));

// ── PARTIAL PAYMENTS ──────────────────────────────────────────────────────────
export const partialPayments = mysqlTable("partial_payments", {
  id:        varchar("id", { length: 36 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull(),
  amount:    decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency:  varchar("currency", { length: 10 }).notNull(),
  note:      text("note"),
  paidDate:  date("paid_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, t => ({
  invoiceIdx: index("partial_invoice_idx").on(t.invoiceId),
}));

// ── NOTIFICATION PREFERENCES ──────────────────────────────────────────────────
export const notificationPrefs = mysqlTable("notification_prefs", {
  userId:                varchar("user_id", { length: 36 }).primaryKey(),
  invoiceViewed:         boolean("invoice_viewed").default(true),
  invoiceDownloaded:     boolean("invoice_downloaded").default(true),
  invoicePaid:           boolean("invoice_paid").default(true),
  overdueReminders:      boolean("overdue_reminders").default(false),
  reminderDay1:          boolean("reminder_day_1").default(true),
  reminderDay7:          boolean("reminder_day_7").default(true),
  reminderDay14:         boolean("reminder_day_14").default(true),
  weeklySummary:         boolean("weekly_summary").default(false),
  updatedAt:             timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ── RELATIONS ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  invoices:  many(invoices),
  clients:   many(clients),
  templates: many(invoiceTemplates),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user:           one(users,    { fields: [invoices.userId],   references: [users.id] }),
  client:         one(clients,  { fields: [invoices.clientId], references: [clients.id] }),
  events:         many(invoiceEvents),
  partialPayments: many(partialPayments),
}));

export const invoiceEventsRelations = relations(invoiceEvents, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceEvents.invoiceId], references: [invoices.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user:     one(users, { fields: [clients.userId], references: [users.id] }),
  invoices: many(invoices),
}));

// ── TYPES (inferred) ──────────────────────────────────────────────────────────
export type User              = typeof users.$inferSelect;
export type NewUser           = typeof users.$inferInsert;
export type Client            = typeof clients.$inferSelect;
export type NewClient         = typeof clients.$inferInsert;
export type Invoice           = typeof invoices.$inferSelect;
export type NewInvoice        = typeof invoices.$inferInsert;
export type InvoiceEvent      = typeof invoiceEvents.$inferSelect;
export type NewInvoiceEvent   = typeof invoiceEvents.$inferInsert;
export type InvoiceTemplate   = typeof invoiceTemplates.$inferSelect;
export type PartialPayment    = typeof partialPayments.$inferSelect;
