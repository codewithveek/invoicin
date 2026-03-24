import { eq } from "drizzle-orm";
import { db } from "../db";
import { notificationPrefs } from "../schema";
import type { NotificationPrefs, NewNotificationPrefs } from "../schema/types";

export const notificationPrefsRepository = {
  async findByUserId(userId: string): Promise<NotificationPrefs | null> {
    const [row] = await db
      .select()
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, userId));
    return row ?? null;
  },

  async upsert(data: NewNotificationPrefs): Promise<NotificationPrefs> {
    await db
      .insert(notificationPrefs)
      .values(data)
      .onDuplicateKeyUpdate({
        set: {
          invoiceViewed: data.invoiceViewed,
          invoiceDownloaded: data.invoiceDownloaded,
          invoicePaid: data.invoicePaid,
          overdueReminders: data.overdueReminders,
          reminderDay1: data.reminderDay1,
          reminderDay7: data.reminderDay7,
          reminderDay14: data.reminderDay14,
          weeklySummary: data.weeklySummary,
        },
      });
    const updated = await this.findByUserId(data.userId);
    return updated!;
  },
};
