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
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid var(--bd)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--tx)" }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--tx3)", marginTop: 2 }}>
          {sub}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: 36,
          height: 20,
          background: checked ? "var(--g)" : "var(--bd2)",
          borderRadius: 10,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "background .15s",
          flexShrink: 0,
          marginLeft: 12,
        }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .15s",
          }}
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
    <div className="card" style={{ maxWidth: 520 }}>
      <div className="card-ttl">
        Email Notifications
        {saving && (
          <span style={{ fontSize: 11, color: "var(--tx3)", marginLeft: 8 }}>
            Saving…
          </span>
        )}
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
