// ─────────────────────────────────────────────────────────────────────────────
// Internal / cron routes — delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { internalController } from "../controllers/internal.controller";

export const internalRouter = new Hono();

internalRouter.post("/overdue-check", (c) =>
  internalController.overdueCheck(c)
);
