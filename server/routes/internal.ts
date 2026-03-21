// ─────────────────────────────────────────────────────────────────────────────
// Internal / cron routes — secured by a shared CRON_SECRET header
// Mount at: app.route("/internal", internalRouter)
// Call POST /internal/overdue-check from a daily cron job (e.g. 8am UTC)
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { eq, and, inArray, lte } from "drizzle-orm";
import { db } from "../db";
import { invoices, users } from "../schema";
import { logEvent } from "../helpers";
import type { InvoiceItem } from "../schema/types";
import { sendReminderEmail } from "../email";
import { APP_URL } from "../config";

export const internalRouter = new Hono();

// ── POST /internal/overdue-check ─────────────────────────────────────────────
internalRouter.post("/overdue-check", async (c) => {
  const secret = c.req.header("x-cron-secret");
  if (secret !== process.env.CRON_SECRET)
    return c.json({ error: "Forbidden" }, 403);

  const today = new Date().toISOString().split("T")[0];

  const overdueCandidates = await db
    .select()
    .from(invoices)
    .where(
      and(
        inArray(invoices.status, ["sent", "viewed"]),
        lte(invoices.dueDate, today)
      )
    );

  let updated = 0;
  let reminded = 0;

  for (const inv of overdueCandidates) {
    if (inv.status !== "overdue") {
      await db
        .update(invoices)
        .set({ status: "overdue", updatedAt: new Date() })
        .where(eq(invoices.id, inv.id));
      await logEvent(inv.id, "overdue", {}, "system");
      updated++;
    }

    // Send a reminder on day 1, 7, or 14 of being overdue
    const dueDate = new Date(inv.dueDate!);
    const daysOverdue = Math.floor(
      (Date.now() - dueDate.getTime()) / 86_400_000
    );
    const lastReminder = inv.lastReminderAt
      ? new Date(inv.lastReminderAt)
      : null;
    const daysSinceReminder = lastReminder
      ? Math.floor((Date.now() - lastReminder.getTime()) / 86_400_000)
      : 999;

    const shouldRemind =
      inv.clientEmail &&
      (daysOverdue === 1 || daysOverdue === 7 || daysOverdue === 14) &&
      daysSinceReminder >= 1;

    if (shouldRemind) {
      const [freelancer] = await db
        .select()
        .from(users)
        .where(eq(users.id, inv.userId));
      if (freelancer) {
        try {
          await sendReminderEmail({
            invoice: {
              ...inv,
              items: inv.items as InvoiceItem[],
              total: parseFloat(inv.total),
            },
            freelancer: {
              name: freelancer.name,
              businessName: freelancer.businessName ?? undefined,
              email: freelancer.email,
            },
            appUrl: APP_URL,
            daysOverdue,
          });
          await db
            .update(invoices)
            .set({
              remindersSent: (inv.remindersSent ?? 0) + 1,
              lastReminderAt: new Date(),
            })
            .where(eq(invoices.id, inv.id));
          await logEvent(inv.id, "reminder_sent", { daysOverdue }, "system");
          reminded++;
        } catch (err) {
          console.error("Reminder failed for", inv.id, err);
        }
      }
    }
  }

  return c.json({ updated, reminded, checked: overdueCandidates.length });
});
