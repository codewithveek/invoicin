// ─────────────────────────────────────────────────────────────────────────────
// User / profile routes — onboarding + profile management
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { auth } from "../auth";

export const userRouter = new Hono<AppEnv>();

const onboardingSchema = z.object({
  name: z.string().min(1),
  homeCurrency: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  defaultCurrency: z.string().optional(),
  homeCurrency: z.string().optional(),
  defaultTerms: z.string().optional(),
  defaultNotes: z.string().optional(),
});

// GET /api/user/me — returns the current user profile
userRouter.get("/me", requireAuth, async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  return c.json(session.user);
});

// POST /api/user/onboard — complete onboarding (set name + optional homeCurrency)
userRouter.post(
  "/onboard",
  requireAuth,
  zValidator("json", onboardingSchema),
  async (c) => {
    const userId = c.get("userId");
    const { name, homeCurrency } = c.req.valid("json");

    const updated = await auth.api.updateUser({
      body: {
        name,
        ...(homeCurrency ? { homeCurrency } : {}),
        onboarded: true,
      },
      headers: c.req.raw.headers,
    });

    return c.json(updated);
  }
);

// PATCH /api/user/profile — update profile fields
userRouter.patch(
  "/profile",
  requireAuth,
  zValidator("json", profileSchema),
  async (c) => {
    const body = c.req.valid("json");

    const updated = await auth.api.updateUser({
      body,
      headers: c.req.raw.headers,
    });

    return c.json(updated);
  }
);
