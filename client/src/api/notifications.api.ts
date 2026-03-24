import { http } from "./client";

export interface NotificationPrefs {
  invoiceViewed: boolean;
  invoiceDownloaded: boolean;
  invoicePaid: boolean;
  overdueReminders: boolean;
  reminderDay1: boolean;
  reminderDay7: boolean;
  reminderDay14: boolean;
  weeklySummary: boolean;
}

export const notificationsApi = {
  getPrefs: () => http.get<NotificationPrefs>("/notifications/prefs"),
  updatePrefs: (prefs: Partial<NotificationPrefs>) =>
    http.patch<NotificationPrefs>("/notifications/prefs", prefs),
};
