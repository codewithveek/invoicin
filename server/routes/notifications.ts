// ─────────────────────────────────────────────────────────────────────────────
// Notification preferences routes
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { type AppEnv, requireAuth } from "../middleware/auth";
import { notificationPrefsRepository } from "../repositories/notificationPrefs.repository";

export const notificationsRouter = new Hono<AppEnv>();

const prefsSchema = z.object({
  invoiceViewed: z.boolean().optional(),
  invoiceDownloaded: z.boolean().optional(),
  invoicePaid: z.boolean().optional(),
  overdueReminders: z.boolean().optional(),
  reminderDay1: z.boolean().optional(),
  reminderDay7: z.boolean().optional(),
  reminderDay14: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
});

// GET /api/notifications/prefs — return current prefs (or defaults)
notificationsRouter.get("/prefs", requireAuth, async (c) => {
  const userId = c.get("userId");
  const prefs = await notificationPrefsRepository.findByUserId(userId);
  if (!prefs) {
    // Return schema defaults without persisting
    return c.json({
      invoiceViewed: true,
      invoiceDownloaded: true,
      invoicePaid: true,
      overdueReminders: false,
      reminderDay1: true,
      reminderDay7: true,
      reminderDay14: true,
      weeklySummary: false,
    });
  }
  return c.json(prefs);
});

// PATCH /api/notifications/prefs — create or update prefs
notificationsRouter.patch(
  "/prefs",
  requireAuth,
  zValidator("json", prefsSchema),
  async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");

    const existing = await notificationPrefsRepository.findByUserId(userId);

    const updated = await notificationPrefsRepository.upsert({
      userId,
      invoiceViewed: body.invoiceViewed ?? existing?.invoiceViewed ?? true,
      invoiceDownloaded:
        body.invoiceDownloaded ?? existing?.invoiceDownloaded ?? true,
      invoicePaid: body.invoicePaid ?? existing?.invoicePaid ?? true,
      overdueReminders:
        body.overdueReminders ?? existing?.overdueReminders ?? false,
      reminderDay1: body.reminderDay1 ?? existing?.reminderDay1 ?? true,
      reminderDay7: body.reminderDay7 ?? existing?.reminderDay7 ?? true,
      reminderDay14: body.reminderDay14 ?? existing?.reminderDay14 ?? true,
      weeklySummary: body.weeklySummary ?? existing?.weeklySummary ?? false,
    });

    return c.json(updated);
  }
);
