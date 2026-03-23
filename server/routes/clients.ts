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
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

clientsRouter.get("/", requireAuth, (c) => clientController.list(c));
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
