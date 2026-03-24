// ─────────────────────────────────────────────────────────────────────────────
// User / profile routes — onboarding + profile management
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { auth } from "../auth";
import { userRepository } from "../repositories/user.repository";

export const userRouter = new Hono<AppEnv>();

const onboardingSchema = z.object({
  name: z.string().min(1).max(255),
  homeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
});

const profileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  businessName: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  defaultCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  homeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  defaultTerms: z.string().max(100).optional(),
  defaultNotes: z.string().max(500).optional(),
});

// GET /api/user/me — returns the current user profile from DB (no double session fetch)
userRouter.get("/me", requireAuth, async (c) => {
  const userId = c.get("userId");
  const user = await userRepository.findById(userId);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user);
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
