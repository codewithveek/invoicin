// ─────────────────────────────────────────────────────────────────────────────
// Database table definitions (Drizzle ORM / MySQL)
// ─────────────────────────────────────────────────────────────────────────────

import {
  mysqlTable,
  varchar,
  text,
  decimal,
  int,
  boolean,
  timestamp,
  date,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { id } from "./helpers";

// ── USERS ─────────────────────────────────────────────────────────────────────
export const users = mysqlTable(
  "users",
  {
    id,
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    businessName: varchar("business_name", { length: 255 }),
    address: text("address"),
    phone: varchar("phone", { length: 50 }),
    logoUrl: varchar("logo_url", { length: 500 }),
    defaultCurrency: varchar("default_currency", { length: 10 }).default("USD"),
    homeCurrency: varchar("home_currency", { length: 10 }).default("NGN"),
    defaultTerms: varchar("default_terms", { length: 100 }).default("Net 14"),
    defaultNotes: text("default_notes"),
    passwordHash: varchar("password_hash", { length: 255 }),
    emailVerified: boolean("email_verified").default(false),
    plan: varchar("plan", { length: 20 }).default("free"), // free | pro | business
    onboarded: boolean("onboarded").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

// ── BETTER-AUTH: SESSION ──────────────────────────────────────────────────────
export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ── BETTER-AUTH: ACCOUNT ──────────────────────────────────────────────────────
export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: varchar("scope", { length: 255 }),
  idToken: text("id_token"),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ── BETTER-AUTH: VERIFICATION ─────────────────────────────────────────────────
export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export const clients = mysqlTable(
  "clients",
  {
    id,
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    address: text("address"),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("clients_user_idx").on(t.userId),
    index("clients_email_idx").on(t.email),
  ]
);

// ── INVOICE TEMPLATES ─────────────────────────────────────────────────────────
export const invoiceTemplates = mysqlTable(
  "invoice_templates",
  {
    id,
    userId: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    // items: [{ desc: string, qty: number, price: number | null }]
    items: json("items").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    terms: varchar("terms", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("templates_user_idx").on(t.userId)]
);

// ── INVOICES ──────────────────────────────────────────────────────────────────
export const invoices = mysqlTable(
  "invoices",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // INV-2026-XXXX
    linkId: varchar("link_id", { length: 32 }).notNull().unique(), // public share token
    userId: varchar("user_id", { length: 36 }).notNull(),
    clientId: varchar("client_id", { length: 36 }), // nullable if manual entry

    // Type: standard | proforma | deposit | credit
    type: varchar("type", {
      length: 20,
      enum: ["standard", "proforma", "deposit", "credit"],
    }).default("standard"),

    // Status: draft | sent | viewed | overdue | paid | cancelled | disputed | partial
    status: varchar("status", {
      length: 20,
      enum: [
        "draft",
        "sent",
        "viewed",
        "overdue",
        "paid",
        "cancelled",
        "disputed",
        "partial",
      ],
    }).default("draft"),

    // Client snapshot (denormalised for history accuracy)
    clientName: varchar("client_name", { length: 255 }).notNull(),
    clientEmail: varchar("client_email", { length: 255 }),
    clientAddress: text("client_address"),

    // Currency & amounts
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    taxType: varchar("tax_type", {
      length: 20,
      enum: ["vat", "wht", "custom"],
    }),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
    deposit: decimal("deposit", { precision: 5, scale: 2 }).default("0"), // % e.g. 50
    total: decimal("total", { precision: 12, scale: 2 }).notNull(),

    // Home-currency equivalent at time of payment (currency set per user)
    homeRate: decimal("home_rate", { precision: 12, scale: 2 }),
    homeTotal: decimal("home_total", { precision: 14, scale: 2 }),
    homeCurrency: varchar("home_currency", { length: 10 }),

    // Dates
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date"),
    paidDate: date("paid_date"),

    // Content — items: [{ desc: string, qty: number, price: number }]
    items: json("items").notNull(),
    notes: text("notes"),
    terms: varchar("terms", { length: 255 }),

    // Partial payment tracking
    amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default(
      "0"
    ),

    // Reminder tracking
    remindersSent: int("reminders_sent").default(0),
    lastReminderAt: timestamp("last_reminder_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("invoices_user_idx").on(t.userId),
    index("invoices_status_idx").on(t.status),
    uniqueIndex("invoices_link_idx").on(t.linkId),
    index("invoices_client_idx").on(t.clientId),
    index("invoices_due_date_idx").on(t.dueDate),
  ]
);

// ── INVOICE EVENTS ────────────────────────────────────────────────────────────
// Append-only log. Never update, only insert.
export const invoiceEvents = mysqlTable(
  "invoice_events",
  {
    id,
    invoiceId: varchar("invoice_id", { length: 36 }).notNull(),
    // type: created | sent | viewed | downloaded | paid | cancelled | disputed |
    //        reminder_sent | partial_payment | note_added
    type: varchar("type", {
      length: 50,
      enum: [
        "created",
        "sent",
        "viewed",
        "downloaded",
        "paid",
        "cancelled",
        "disputed",
        "reminder_sent",
        "partial_payment",
        "note_added",
        "status_changed",
        "client_confirmed_payment",
      ],
    }).notNull(),
    // Optional metadata: IP address, user agent, note text, payment amount, etc.
    meta: json("meta"),
    // Who triggered it: user (freelancer), client, or system (cron job)
    actor: varchar("actor", { length: 20 }).default("user"), // user | client | system
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("events_invoice_idx").on(t.invoiceId),
    index("events_type_idx").on(t.type),
    index("events_created_idx").on(t.createdAt),
  ]
);

// ── PARTIAL PAYMENTS ──────────────────────────────────────────────────────────
export const partialPayments = mysqlTable(
  "partial_payments",
  {
    id,
    invoiceId: varchar("invoice_id", { length: 36 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull(),
    note: text("note"),
    paidDate: date("paid_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("partial_invoice_idx").on(t.invoiceId)]
);

// ── NOTIFICATION PREFERENCES ──────────────────────────────────────────────────
export const notificationPrefs = mysqlTable("notification_prefs", {
  userId: varchar("user_id", { length: 36 }).primaryKey(),
  invoiceViewed: boolean("invoice_viewed").default(true),
  invoiceDownloaded: boolean("invoice_downloaded").default(true),
  invoicePaid: boolean("invoice_paid").default(true),
  overdueReminders: boolean("overdue_reminders").default(false),
  reminderDay1: boolean("reminder_day_1").default(true),
  reminderDay7: boolean("reminder_day_7").default(true),
  reminderDay14: boolean("reminder_day_14").default(true),
  weeklySummary: boolean("weekly_summary").default(false),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
