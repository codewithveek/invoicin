// ─────────────────────────────────────────────────────────────────────────────
// Client routes — validation + auth + delegate to controller
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { clientController } from "../controllers/client.controller";

export const clientsRouter = new Hono<AppEnv>();

const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  address: z.string().max(1000).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

clientsRouter.get("/", requireAuth, zValidator("query", listQuerySchema), (c) =>
  clientController.list(c)
);
clientsRouter.post(
  "/",
  requireAuth,
  zValidator("json", createClientSchema),
  (c) => clientController.create(c, c.req.valid("json"))
);
clientsRouter.patch(
  "/:id",
  requireAuth,
  zValidator("json", updateClientSchema),
  (c) => clientController.update(c, c.req.valid("json"))
);
clientsRouter.delete("/:id", requireAuth, (c) => clientController.remove(c));
