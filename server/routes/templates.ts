// ─────────────────────────────────────────────────────────────────────────────
// Template routes — validation + auth + delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { templateController } from "../controllers/template.controller";

export const templatesRouter = new Hono<AppEnv>();

const templateItemSchema = z.object({
  desc: z.string().max(500),
  qty: z.number().positive(),
  price: z.number().min(0),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  items: z.array(templateItemSchema).min(1).max(50),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  terms: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  items: z.array(templateItemSchema).min(1).max(50).optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  terms: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

templatesRouter.get(
  "/",
  requireAuth,
  zValidator("query", listQuerySchema),
  (c) => templateController.list(c)
);
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
