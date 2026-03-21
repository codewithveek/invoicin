// ─────────────────────────────────────────────────────────────────────────────
// Client routes: list, create, delete
// Mount at: app.route("/clients", clientsRouter)
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "../db";
import { clients } from "../schema";
import { type AppEnv, requireAuth } from "../middleware/auth";

export const clientsRouter = new Hono<AppEnv>();

// ── GET /clients ──────────────────────────────────────────────────────────────
clientsRouter.get("/", requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, c.get("userId")))
    .orderBy(clients.name);
  return c.json(rows);
});

// ── POST /clients ─────────────────────────────────────────────────────────────
clientsRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{
    name: string;
    email: string;
    address?: string;
    phone?: string;
    company?: string;
    notes?: string;
  }>();
  const client = { id: ulid(), userId, ...body };
  await db.insert(clients).values(client);
  return c.json(client, 201);
});

// ── DELETE /clients/:id ───────────────────────────────────────────────────────
clientsRouter.delete("/:id", requireAuth, async (c) => {
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
