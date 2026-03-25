"use client";
import { useState, useEffect } from "react";
import {
  notificationsApi,
  type NotificationPrefs,
} from "../../api/notifications.api";

type PrefKey = keyof NotificationPrefs;

interface ToggleRowProps {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
  disabled,
}: ToggleRowProps) {
  return (
    <div
      className={`flex justify-between items-start py-3 border-b border-bd${
        disabled ? " opacity-60" : ""
      }`}
    >
      <div>
        <div className="text-[13px] font-medium text-tx">{label}</div>
        <div className="text-[11px] text-tx3 mt-[2px]">{sub}</div>
      </div>
      <div
        className={`relative w-9 h-5 rounded-[10px] transition-colors duration-150 shrink-0 ml-3 ${
          checked ? "bg-brand" : "bg-bd2"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-[left] duration-150 ${
            checked ? "left-4" : "left-[2px]"
          }`}
        />
      </div>
    </div>
  );
}

const ROWS: { label: string; sub: string; key: PrefKey }[] = [
  {
    key: "invoiceViewed",
    label: "Invoice viewed by client",
    sub: "Get notified when your client opens the invoice link",
  },
  {
    key: "invoiceDownloaded",
    label: "Invoice downloaded",
    sub: "Get notified when your client downloads the PDF",
  },
  {
    key: "invoicePaid",
    label: "Invoice paid",
    sub: "Get notified when you mark an invoice as paid",
  },
  {
    key: "overdueReminders",
    label: "Overdue reminders",
    sub: "Automatically send your client reminders on day 1, 7, and 14 after due date",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    sub: "Receive a weekly summary of your invoice activity",
  },
];

const DEFAULTS: NotificationPrefs = {
  invoiceViewed: true,
  invoiceDownloaded: true,
  invoicePaid: true,
  overdueReminders: false,
  reminderDay1: true,
  reminderDay7: true,
  reminderDay14: true,
  weeklySummary: false,
};

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    notificationsApi
      .getPrefs()
      .then(setPrefs)
      .catch(() => {
        /* use defaults */
      });
  }, []);

  async function toggle(key: PrefKey, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaving(true);
    try {
      const saved = await notificationsApi.updatePrefs({ [key]: value });
      setPrefs(saved);
    } catch {
      setPrefs(prefs); // revert on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card max-w-[520px]">
      <div className="card-ttl">
        Email Notifications
        {saving && <span className="text-[11px] text-tx3 ml-2">Saving…</span>}
      </div>
      {ROWS.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          sub={row.sub}
          checked={prefs[row.key] as boolean}
          onChange={(v) => toggle(row.key, v)}
          disabled={saving}
        />
      ))}
    </div>
  );
}
