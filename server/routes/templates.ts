// ─────────────────────────────────────────────────────────────────────────────
// Template routes — validation + auth + delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { templateController } from "../controllers/template.controller";

export const templatesRouter = new Hono<AppEnv>();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  items: z.array(z.unknown()),
  currency: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  items: z.array(z.unknown()).optional(),
  currency: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

templatesRouter.get("/", requireAuth, (c) => templateController.list(c));
templatesRouter.post(
  "/",
  requireAuth,
  zValidator("json", createTemplateSchema),
  (c) => templateController.create(c, c.req.valid("json"))
);
templatesRouter.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateTemplateSchema),
  (c) => templateController.update(c, c.req.valid("json"))
);
templatesRouter.delete("/:id", requireAuth, (c) =>
  templateController.remove(c)
);
