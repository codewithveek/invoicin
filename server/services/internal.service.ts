import { APP_URL } from "../config";
import { sendReminderEmail } from "../email";
import { toEmailData } from "../lib/invoice.utils";
import { eventRepository } from "../repositories/event.repository";
import { invoiceRepository } from "../repositories/invoice.repository";
import { userRepository } from "../repositories/user.repository";

export const internalService = {
  async runOverdueCheck(): Promise<{
    updated: number;
    reminded: number;
    checked: number;
  }> {
    const today = new Date(new Date().toISOString().split("T")[0]);
    const candidates = await invoiceRepository.findOverdueCandidates(today);

    let updated = 0;
    let reminded = 0;

    for (const inv of candidates) {
      if (inv.status !== "overdue") {
        await invoiceRepository.update(inv.id, { status: "overdue" });
        await eventRepository.create(
          inv.id,
          "status_changed",
          { status: "overdue" },
          "system"
        );
        updated++;
      }

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
        const freelancer = await userRepository.findById(inv.userId);
        if (freelancer) {
          try {
            await sendReminderEmail({
              invoice: toEmailData(inv),
              freelancer: {
                name: freelancer.name,
                businessName: freelancer.businessName ?? undefined,
                email: freelancer.email,
              },
              appUrl: APP_URL,
              daysOverdue,
            });
            await invoiceRepository.update(inv.id, {
              remindersSent: (inv.remindersSent ?? 0) + 1,
              lastReminderAt: new Date(),
            });
            await eventRepository.create(
              inv.id,
              "reminder_sent",
              { daysOverdue },
              "system"
            );
            reminded++;
          } catch (err) {
            console.error("Reminder failed for", inv.id, err);
          }
        }
      }
    }

    return { updated, reminded, checked: candidates.length };
  },
};
