// ─────────────────────────────────────────────────────────────────────────────
// Invoice routes — validation + auth + delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { invoiceController } from "../controllers/invoice.controller";

export const invoicesRouter = new Hono<AppEnv>();

/** ISO 4217 currency regex used across schemas */
const currencyCode = z.string().regex(/^[A-Z]{3}$/, "Invalid currency code");

const createSchema = z.object({
  type: z
    .enum(["standard", "proforma", "deposit", "credit"])
    .default("standard"),
  clientId: z.string().max(36).optional(),
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email().max(255).optional(),
  clientAddress: z.string().max(500).optional(),
  currency: currencyCode.default("USD"),
  items: z
    .array(
      z.object({
        desc: z.string().min(1).max(500),
        qty: z.number().min(1).max(10_000),
        price: z.number().min(0).max(10_000_000),
      })
    )
    .min(1)
    .max(100),
  taxType: z.enum(["vat", "wht", "custom"]).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  deposit: z.number().min(0).max(100).optional(),
  // total is computed server-side; this field is accepted but ignored
  total: z.number().min(0).optional(),
  dueDate: z.coerce.date().optional(),
  terms: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

const updateSchema = z.object({
  status: z
    .enum([
      "draft",
      "sent",
      "viewed",
      "overdue",
      "paid",
      "cancelled",
      "disputed",
      "partial",
    ])
    .optional(),
  paidDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
  dueDate: z.coerce.date().optional(),
  homeRate: z.number().positive().optional(),
  homeCurrency: currencyCode.optional(),
});

const disputeSchema = z.object({
  reason: z.string().max(1000).optional(),
});

const paymentSchema = z.object({
  amount: z.number().positive().max(10_000_000),
  currency: currencyCode,
  note: z.string().max(500).optional(),
  paidDate: z.string(),
});

const listQuerySchema = z.object({
  status: z
    .enum([
      "draft",
      "sent",
      "viewed",
      "overdue",
      "paid",
      "cancelled",
      "disputed",
      "partial",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

invoicesRouter.get(
  "/",
  requireAuth,
  zValidator("query", listQuerySchema),
  (c) => invoiceController.list(c)
);
invoicesRouter.post("/", requireAuth, zValidator("json", createSchema), (c) =>
  invoiceController.create(c, c.req.valid("json"))
);
invoicesRouter.get("/:id", requireAuth, (c) => invoiceController.get(c));
invoicesRouter.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateSchema),
  (c) => invoiceController.update(c, c.req.valid("json"))
);
invoicesRouter.post("/:id/send", requireAuth, (c) => invoiceController.send(c));
invoicesRouter.post("/:id/remind", requireAuth, (c) =>
  invoiceController.remind(c)
);
invoicesRouter.post(
  "/:id/payment",
  requireAuth,
  zValidator("json", paymentSchema),
  (c) => invoiceController.recordPayment(c, c.req.valid("json"))
);
invoicesRouter.get("/:id/payments", requireAuth, (c) =>
  invoiceController.listPayments(c)
);
invoicesRouter.get("/:id/pdf", requireAuth, (c) =>
  invoiceController.downloadPdf(c)
);
invoicesRouter.post(
  "/:id/dispute",
  requireAuth,
  zValidator("json", disputeSchema),
  (c) => invoiceController.dispute(c, c.req.valid("json"))
);
