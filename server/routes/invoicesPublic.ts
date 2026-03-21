// ─────────────────────────────────────────────────────────────────────────────
// Public invoice routes — no auth required (client-facing share links)
// Mount at: app.route("/i", invoicesPublicRouter)
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { invoices } from "../schema";
import { logEvent } from "../helpers";

export const invoicesPublicRouter = new Hono();

// ── GET /i/:linkId — public invoice view ─────────────────────────────────────
invoicesPublicRouter.get("/:linkId", async (c) => {
  const linkId = c.req.param("linkId");
  const [inv] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.linkId, linkId));
  if (!inv || inv.status === "cancelled")
    return c.json({ error: "Invoice not found" }, 404);

  // Log the view (captures IP + UA for activity tracking)
  const ip = c.req.header("x-forwarded-for") ?? "unknown";
  const ua = (c.req.header("user-agent") ?? "unknown").slice(0, 100);
  await logEvent(inv.id, "viewed", { ip, ua }, "client");

  // Auto-advance status from "sent" → "viewed"
  if (inv.status === "sent") {
    await db
      .update(invoices)
      .set({ status: "viewed", updatedAt: new Date() })
      .where(eq(invoices.id, inv.id));
  }

  // Strip the internal user ID before returning
  const { userId: _userId, ...publicInv } = inv;
  return c.json(publicInv);
});

// ── POST /i/:linkId/confirm — client confirms payment ────────────────────────
invoicesPublicRouter.post("/:linkId/confirm", async (c) => {
  const linkId = c.req.param("linkId");
  const body = await c.req.json<{ note?: string }>().catch(() => ({}));
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

// ── POST /i/:linkId/download — track PDF downloads ───────────────────────────
invoicesPublicRouter.post("/:linkId/download", async (c) => {
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
