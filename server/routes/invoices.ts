// ─────────────────────────────────────────────────────────────────────────────
// Invoice routes: CRUD + send email + remind + partial payments
// Mount at: app.route("/invoices", invoicesRouter)
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../db";
import { invoices, invoiceEvents, partialPayments } from "../schema";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { generateInvoiceId, logEvent, getFreelancer } from "../helpers";
import type { InvoiceItem } from "../schema/types";
import { sendInvoiceEmail, sendReminderEmail } from "../invoiceapp-email";
import { APP_URL } from "../config";

export const invoicesRouter = new Hono<AppEnv>();

// ── GET /invoices — list, optional ?status= filter ───────────────────────────
invoicesRouter.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status") as
    | (typeof invoices.$inferSelect)["status"]
    | undefined;
  const conditions = status
    ? and(eq(invoices.userId, userId), eq(invoices.status, status))
    : eq(invoices.userId, userId);

  const rows = await db
    .select()
    .from(invoices)
    .where(conditions)
    .orderBy(desc(invoices.createdAt));
  return c.json(rows);
});

// ── POST /invoices — create ───────────────────────────────────────────────────
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
  dueDate: z.date().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

invoicesRouter.post(
  "/",
  requireAuth,
  zValidator("json", createSchema),
  async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const subtotal = body.items.reduce((s, i) => s + i.price * i.qty, 0);

    const inv = {
      id: generateInvoiceId(),
      linkId: ulid().toLowerCase().slice(0, 16),
      userId,
      clientId: body.clientId ?? null,
      type: body.type,
      status: "draft" as const,
      clientName: body.clientName,
      clientEmail: body.clientEmail ?? null,
      clientAddress: body.clientAddress ?? null,
      currency: body.currency,
      subtotal: String(subtotal),
      taxType: body.taxType ?? null,
      taxRate: body.taxRate != null ? String(body.taxRate) : null,
      taxAmount: body.taxAmount != null ? String(body.taxAmount) : "0",
      deposit: body.deposit != null ? String(body.deposit) : "0",
      total: String(body.total),
      items: body.items,
      dueDate: body.dueDate ?? null,
      terms: body.terms ?? null,
      notes: body.notes ?? null,
      issueDate: new Date(new Date().toISOString().split("T")[0]),
    };

    await db.insert(invoices).values(inv);
    await logEvent(inv.id, "created");

    return c.json(inv, 201);
  }
);

// ── GET /invoices/:id ─────────────────────────────────────────────────────────
invoicesRouter.get("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const [inv] = await db
    .select()
    .from(invoices)
    .where(
      and(eq(invoices.id, c.req.param("id")), eq(invoices.userId, userId))
    );
  if (!inv) return c.json({ error: "Not found" }, 404);

  const events = await db
    .select()
    .from(invoiceEvents)
    .where(eq(invoiceEvents.invoiceId, inv.id))
    .orderBy(desc(invoiceEvents.createdAt));

  return c.json({ ...inv, events });
});

// ── PATCH /invoices/:id — update status or fields ────────────────────────────
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
  paidDate: z.date().optional(),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
});

invoicesRouter.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateSchema),
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [inv] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    if (!inv) return c.json({ error: "Not found" }, 404);

    await db
      .update(invoices)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(invoices.id, id));

    if (body.status && body.status !== inv.status) {
      await logEvent(id, body.status === "paid" ? "paid" : "status_changed", {
        from: inv.status,
        to: body.status,
      });
    }

    return c.json({ success: true });
  }
);

// ── POST /invoices/:id/send — send invoice by email ───────────────────────────
invoicesRouter.post("/:id/send", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  if (!inv?.clientEmail)
    return c.json({ error: "Invoice not found or missing client email" }, 400);

  const freelancer = await getFreelancer(userId);

  await sendInvoiceEmail({
    invoice: {
      ...inv,
      items: inv.items as InvoiceItem[],
      total: parseFloat(inv.total),
    },
    freelancer: {
      name: freelancer.name,
      businessName: freelancer.businessName ?? undefined,
      email: freelancer.email,
    },
    appUrl: APP_URL,
  });

  await db
    .update(invoices)
    .set({ status: "sent", updatedAt: new Date() })
    .where(eq(invoices.id, id));
  await logEvent(id, "sent", { to: inv.clientEmail });

  return c.json({ success: true });
});

// ── POST /invoices/:id/remind — send a payment reminder ──────────────────────
invoicesRouter.post("/:id/remind", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  if (!inv?.clientEmail) return c.json({ error: "Not found or no email" }, 400);

  const freelancer = await getFreelancer(userId);
  const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date();
  const daysOverdue = Math.max(
    0,
    Math.floor((Date.now() - dueDate.getTime()) / 86_400_000)
  );

  await sendReminderEmail({
    invoice: {
      ...inv,
      items: inv.items as InvoiceItem[],
      total: parseFloat(inv.total),
    },
    freelancer: {
      name: freelancer.name,
      businessName: freelancer.businessName ?? undefined,
      email: freelancer.email,
    },
    appUrl: APP_URL,
    daysOverdue,
  });

  await db
    .update(invoices)
    .set({
      remindersSent: (inv.remindersSent ?? 0) + 1,
      lastReminderAt: new Date(),
    })
    .where(eq(invoices.id, id));
  await logEvent(
    id,
    "reminder_sent",
    { daysOverdue, to: inv.clientEmail },
    "system"
  );

  return c.json({ success: true });
});

// ── POST /invoices/:id/payment — record a partial payment ─────────────────────
const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
  note: z.string().optional(),
  paidDate: z.string(),
});

invoicesRouter.post(
  "/:id/payment",
  requireAuth,
  zValidator("json", paymentSchema),
  async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [inv] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    if (!inv) return c.json({ error: "Not found" }, 404);

    await db
      .insert(partialPayments)
      .values({ id: ulid(), invoiceId: id, ...body });

    const newPaid = parseFloat(String(inv.amountPaid ?? 0)) + body.amount;
    const total = parseFloat(String(inv.total));
    const newStatus = newPaid >= total ? "paid" : "partial";

    await db
      .update(invoices)
      .set({
        amountPaid: String(newPaid),
        status: newStatus,
        paidDate: newPaid >= total ? body.paidDate : null,
      })
      .where(eq(invoices.id, id));

    await logEvent(id, newPaid >= total ? "paid" : "partial_payment", {
      amount: body.amount,
      note: body.note,
    });

    return c.json({ success: true, status: newStatus });
  }
);
