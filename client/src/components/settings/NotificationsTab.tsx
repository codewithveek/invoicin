import { useState } from "react";

interface ToggleRowProps {
  label: string;
  sub: string;
  defaultOn: boolean;
}

function ToggleRow({ label, sub, defaultOn }: ToggleRowProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid var(--bd)",
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
          background: on ? "var(--g)" : "var(--bd2)",
          borderRadius: 10,
          cursor: "pointer",
          transition: "background .15s",
          flexShrink: 0,
          marginLeft: 12,
        }}
        onClick={() => setOn((p) => !p)}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: on ? 16 : 2,
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

const NOTIFICATION_ROWS = [
  {
    label: "Invoice viewed by client",
    sub: "Get notified when your client opens the invoice link",
    def: true,
  },
  {
    label: "Invoice downloaded",
    sub: "Get notified when your client downloads the PDF",
    def: true,
  },
  {
    label: "Invoice paid",
    sub: "Get notified when you mark an invoice as paid",
    def: true,
  },
  {
    label: "Overdue reminders",
    sub: "Automatically send your client reminders on day 1, 7, and 14 after due date",
    def: false,
  },
  {
    label: "Weekly summary",
    sub: "Receive a weekly summary of your invoice activity",
    def: false,
  },
];

export default function NotificationsTab() {
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <div className="card-ttl">Email Notifications</div>
      {NOTIFICATION_ROWS.map((row) => (
        <ToggleRow
          key={row.label}
          label={row.label}
          sub={row.sub}
          defaultOn={row.def}
        />
      ))}
    </div>
  );
}
