// ─────────────────────────────────────────────────────────────────────────────
// Invoice template routes: list, create, delete
// Mount at: app.route("/templates", templatesRouter)
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../db";
import { invoiceTemplates } from "../schema";
import { type AppEnv, requireAuth } from "../middleware/auth";

export const templatesRouter = new Hono<AppEnv>();

// ── GET /templates ────────────────────────────────────────────────────────────
templatesRouter.get("/", requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(invoiceTemplates)
    .where(eq(invoiceTemplates.userId, c.get("userId")));
  return c.json(rows);
});

// ── POST /templates ───────────────────────────────────────────────────────────
templatesRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{
    name: string;
    items: unknown[];
    currency?: string;
    terms?: string;
    notes?: string;
  }>();
  const tpl = { id: ulid(), userId, ...body };
  await db.insert(invoiceTemplates).values(tpl);
  return c.json(tpl, 201);
});

// ── DELETE /templates/:id ─────────────────────────────────────────────────────
templatesRouter.delete("/:id", requireAuth, async (c) => {
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
