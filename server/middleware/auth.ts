// ─────────────────────────────────────────────────────────────────────────────
// Auth middleware — replace the x-user-id header stub with real JWT / session
// ─────────────────────────────────────────────────────────────────────────────

import type { MiddlewareHandler } from "hono";

// Typed context variable so c.get("userId") is typed as string in route handlers
export type AppEnv = { Variables: { userId: string } };

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = c.req.header("x-user-id"); // TODO: replace with JWT decode or session
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  await next();
};
