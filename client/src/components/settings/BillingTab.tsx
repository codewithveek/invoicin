import Icon from "../shared/Icon";

interface BillingTabProps {
  onToast: (msg: string) => void;
}

export default function BillingTab({ onToast }: BillingTabProps) {
  return (
    <div className="card" style={{ maxWidth: 460 }}>
      <div className="card-ttl">Current Plan</div>
      <div
        style={{
          background: "linear-gradient(135deg,var(--glt),#f0fdf4)",
          border: "1.5px solid var(--gmid)",
          borderRadius: "var(--r)",
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gdk)" }}>
          Free Plan
        </div>
        <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 3 }}>
          10 invoices/month · Basic features
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--tx2)",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        Upgrade to Pro for unlimited invoices, recurring invoices, automatic
        reminders, and team access.
      </div>
      <button className="btn bp" onClick={() => onToast("Coming soon!")}>
        <Icon n="star" s={13} c="#fff" /> Upgrade to Pro
      </button>
    </div>
  );
}
