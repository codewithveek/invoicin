// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — API Routes (Hono.js on Node.js / Cloudflare Workers)
//
// Install:
//   npm install hono drizzle-orm mysql2 @hono/zod-validator zod ulid
//
// Mount in your app:
//   import { invoiceRouter } from "./invoiceapp-api";
//   app.route("/api", invoiceRouter);
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, desc, lte, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "./db"; // your drizzle db instance
import {
  invoices,
  invoiceEvents,
  clients,
  users,
  invoiceTemplates,
  partialPayments,
} from "./invoiceapp-schema";
import {
  sendInvoiceEmail,
  sendReminderEmail,
} from "../client/invoiceapp-email";

const APP_URL = process.env.APP_URL || "https://yourdomain.com";

// ── MIDDLEWARE: auth (replace with your auth solution) ───────────────────────
async function requireAuth(c: any, next: any) {
  const userId = c.req.header("x-user-id"); // replace with JWT decode or session
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  await next();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function generateInvoiceId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000 + 1000));
  return `INV-${year}-${num}`;
}

async function logEvent(
  invoiceId: string,
  type: string,
  meta?: object,
  actor: "user" | "client" | "system" = "user"
) {
  await db.insert(invoiceEvents).values({
    id: ulid(),
    invoiceId,
    type,
    meta: meta || null,
    actor,
  });
}

async function getFreelancer(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

// ── INVOICE ROUTES ────────────────────────────────────────────────────────────
export const invoiceRouter = new Hono();

// GET /invoices — list with optional status filter
invoiceRouter.get("/invoices", requireAuth, async (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status");
  const conditions = status
    ? and(eq(invoices.userId, userId), eq(invoices.status, status as any))
    : eq(invoices.userId, userId);

  const rows = await db
    .select()
    .from(invoices)
    .where(conditions)
    .orderBy(desc(invoices.createdAt));
  return c.json(rows);
});

// POST /invoices — create
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
  taxType: z.string().optional(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
  deposit: z.number().min(0).max(100).optional(),
  total: z.number().min(0),
  dueDate: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

invoiceRouter.post(
  "/invoices",
  requireAuth,
  zValidator("json", createSchema),
  async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const subtotal = body.items.reduce(
      (s: number, i) => s + i.price * i.qty,
      0
    );

    const inv = {
      id: generateInvoiceId(),
      linkId: ulid().toLowerCase().slice(0, 16),
      userId,
      clientId: body.clientId || null,
      type: body.type,
      status: "draft" as const,
      clientName: body.clientName,
      clientEmail: body.clientEmail || null,
      clientAddress: body.clientAddress || null,
      currency: body.currency,
      subtotal: String(subtotal),
      taxType: body.taxType || null,
      taxRate: body.taxRate ? String(body.taxRate) : null,
      taxAmount: body.taxAmount ? String(body.taxAmount) : "0",
      deposit: body.deposit ? String(body.deposit) : "0",
      total: String(body.total),
      items: body.items,
      dueDate: body.dueDate || null,
      terms: body.terms || null,
      notes: body.notes || null,
      issueDate: new Date().toISOString().split("T")[0],
    };

    await db.insert(invoices).values(inv);
    await logEvent(inv.id, "created");

    return c.json(inv, 201);
  }
);

// GET /invoices/:id
invoiceRouter.get("/invoices/:id", requireAuth, async (c) => {
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

// PATCH /invoices/:id — update status or fields
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
  paidDate: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

invoiceRouter.patch(
  "/invoices/:id",
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

// POST /invoices/:id/send — send by email
invoiceRouter.post("/invoices/:id/send", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  const freelancer = await getFreelancer(userId);
  if (!inv || !inv.clientEmail)
    return c.json({ error: "Invoice not found or missing client email" }, 400);

  await sendInvoiceEmail({
    invoice: { ...inv, items: inv.items as any, total: parseFloat(inv.total) },
    freelancer: {
      name: freelancer.name,
      businessName: freelancer.businessName || undefined,
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

// POST /invoices/:id/remind — send a payment reminder
invoiceRouter.post("/invoices/:id/remind", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  const freelancer = await getFreelancer(userId);
  if (!inv || !inv.clientEmail)
    return c.json({ error: "Not found or no email" }, 400);

  const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date();
  const daysOverdue = Math.max(
    0,
    Math.floor((Date.now() - dueDate.getTime()) / 86400000)
  );

  await sendReminderEmail({
    invoice: { ...inv, items: inv.items as any, total: parseFloat(inv.total) },
    freelancer: {
      name: freelancer.name,
      businessName: freelancer.businessName || undefined,
      email: freelancer.email,
    },
    appUrl: APP_URL,
    daysOverdue,
  });

  await db
    .update(invoices)
    .set({
      remindersSent: (inv.remindersSent || 0) + 1,
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

// ── PUBLIC ROUTES (no auth — for client-facing invoice page) ──────────────────

// GET /i/:linkId — public invoice view (client-facing)
invoiceRouter.get("/i/:linkId", async (c) => {
  const linkId = c.req.param("linkId");
  const [inv] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.linkId, linkId));
  if (!inv || inv.status === "cancelled")
    return c.json({ error: "Invoice not found" }, 404);

  // Log the view event (captures IP + user-agent for tracking)
  const ip = c.req.header("x-forwarded-for") || "unknown";
  const ua = c.req.header("user-agent") || "unknown";
  await logEvent(inv.id, "viewed", { ip, ua: ua.slice(0, 100) }, "client");

  // Auto-update status from "sent" -> "viewed"
  if (inv.status === "sent") {
    await db
      .update(invoices)
      .set({ status: "viewed", updatedAt: new Date() })
      .where(eq(invoices.id, inv.id));
  }

  // Return public fields only — strip internal IDs
  const { userId, ...publicInv } = inv;
  return c.json(publicInv);
});

// POST /i/:linkId/confirm — client confirms payment
invoiceRouter.post("/i/:linkId/confirm", async (c) => {
  const linkId = c.req.param("linkId");
  const body = await c.req.json().catch(() => ({}));
  const [inv] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.linkId, linkId));
  if (!inv) return c.json({ error: "Not found" }, 404);

  await logEvent(
    inv.id,
    "client_confirmed_payment",
    { ip: c.req.header("x-forwarded-for"), note: body.note },
    "client"
  );
  return c.json({ success: true });
});

// POST /i/:linkId/download — track PDF downloads
invoiceRouter.post("/i/:linkId/download", async (c) => {
  const [inv] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.linkId, c.req.param("linkId")));
  if (!inv) return c.json({ error: "Not found" }, 404);
  await logEvent(
    inv.id,
    "downloaded",
    { ip: c.req.header("x-forwarded-for") },
    "client"
  );
  return c.json({ success: true });
});

// ── CLIENT ROUTES ─────────────────────────────────────────────────────────────
invoiceRouter.get("/clients", requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, c.get("userId")))
    .orderBy(clients.name);
  return c.json(rows);
});

invoiceRouter.post("/clients", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const client = { id: ulid(), userId, ...body };
  await db.insert(clients).values(client);
  return c.json(client, 201);
});

invoiceRouter.delete("/clients/:id", requireAuth, async (c) => {
  await db
    .delete(clients)
    .where(
      and(
        eq(clients.id, c.req.param("id")),
        eq(clients.userId, c.get("userId"))
      )
    );
  return c.json({ success: true });
});

// ── TEMPLATE ROUTES ───────────────────────────────────────────────────────────
invoiceRouter.get("/templates", requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(invoiceTemplates)
    .where(eq(invoiceTemplates.userId, c.get("userId")));
  return c.json(rows);
});

invoiceRouter.post("/templates", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const tpl = { id: ulid(), userId, ...body };
  await db.insert(invoiceTemplates).values(tpl);
  return c.json(tpl, 201);
});

invoiceRouter.delete("/templates/:id", requireAuth, async (c) => {
  await db
    .delete(invoiceTemplates)
    .where(
      and(
        eq(invoiceTemplates.id, c.req.param("id")),
        eq(invoiceTemplates.userId, c.get("userId"))
      )
    );
  return c.json({ success: true });
});

// ── PARTIAL PAYMENT ROUTE ─────────────────────────────────────────────────────
invoiceRouter.post("/invoices/:id/payment", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  if (!inv) return c.json({ error: "Not found" }, 404);

  await db
    .insert(partialPayments)
    .values({ id: ulid(), invoiceId: id, ...body });

  const newPaid =
    parseFloat(String(inv.amountPaid || 0)) + parseFloat(body.amount);
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
});

// ── OVERDUE CRON (call this from a cron job every day at 8am) ─────────────────
// POST /internal/overdue-check  (secure with a secret header)
invoiceRouter.post("/internal/overdue-check", async (c) => {
  const secret = c.req.header("x-cron-secret");
  if (secret !== process.env.CRON_SECRET)
    return c.json({ error: "Forbidden" }, 403);

  const today = new Date().toISOString().split("T")[0];

  // Find all sent/viewed invoices that are now past their due date
  const overdueCandidates = await db
    .select()
    .from(invoices)
    .where(
      and(
        inArray(invoices.status, ["sent", "viewed"]),
        lte(invoices.dueDate, today)
      )
    );

  let updated = 0,
    reminded = 0;
  for (const inv of overdueCandidates) {
    if (inv.status !== "overdue") {
      await db
        .update(invoices)
        .set({ status: "overdue", updatedAt: new Date() })
        .where(eq(invoices.id, inv.id));
      await logEvent(inv.id, "overdue", {}, "system");
      updated++;
    }

    // Check if we should send a reminder (day 1, 7, 14)
    const dueDate = new Date(inv.dueDate!);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / 86400000);
    const lastReminder = inv.lastReminderAt
      ? new Date(inv.lastReminderAt)
      : null;
    const daysSinceReminder = lastReminder
      ? Math.floor((Date.now() - lastReminder.getTime()) / 86400000)
      : 999;

    const shouldRemind =
      inv.clientEmail &&
      (daysOverdue === 1 || daysOverdue === 7 || daysOverdue === 14) &&
      daysSinceReminder >= 1;

    if (shouldRemind) {
      const [freelancer] = await db
        .select()
        .from(users)
        .where(eq(users.id, inv.userId));
      if (freelancer) {
        try {
          await sendReminderEmail({
            invoice: {
              ...inv,
              items: inv.items as any,
              total: parseFloat(inv.total),
            },
            freelancer: {
              name: freelancer.name,
              businessName: freelancer.businessName || undefined,
              email: freelancer.email,
            },
            appUrl: APP_URL,
            daysOverdue,
          });
          await db
            .update(invoices)
            .set({
              remindersSent: (inv.remindersSent || 0) + 1,
              lastReminderAt: new Date(),
            })
            .where(eq(invoices.id, inv.id));
          await logEvent(inv.id, "reminder_sent", { daysOverdue }, "system");
          reminded++;
        } catch (e) {
          console.error("Reminder failed for", inv.id, e);
        }
      }
    }
  }

  return c.json({ updated, reminded, checked: overdueCandidates.length });
});

export default invoiceRouter;
