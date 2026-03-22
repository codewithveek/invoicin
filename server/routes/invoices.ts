// ─────────────────────────────────────────────────────────────────────────────
// Invoice routes — validation + auth + delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { invoiceController } from "../controllers/invoice.controller";

export const invoicesRouter = new Hono<AppEnv>();

const createSchema = z.object({
  type: z
    .enum(["standard", "proforma", "deposit", "credit"])
    .default("standard"),
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientAddress: z.string().optional(),
  currency: z.string().default("USD"),
  items: z
    .array(
      z.object({
        desc: z.string(),
        qty: z.number().min(1),
        price: z.number().min(0),
      })
    )
    .min(1),
  taxType: z.enum(["vat", "wht", "custom"]).optional(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
  deposit: z.number().min(0).max(100).optional(),
  total: z.number().min(0),
  dueDate: z.coerce.date().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
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
  notes: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  note: z.string().optional(),
  paidDate: z.string(),
});

invoicesRouter.get("/", requireAuth, (c) => invoiceController.list(c));
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
