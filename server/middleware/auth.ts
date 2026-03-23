// ─────────────────────────────────────────────────────────────────────────────
// Auth middleware — uses better-auth session verification
// ─────────────────────────────────────────────────────────────────────────────

import type { MiddlewareHandler } from "hono";
import { auth } from "../auth";

// Typed context variable so c.get("userId") is typed as string in route handlers
export type AppEnv = { Variables: { userId: string } };

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.user.id);
  await next();
};
