import Icon from "../../shared/Icon";
import { isOverdue, currencySymbol, fmt, dateStr } from "../../../utils";
import { TAX_TYPES } from "../../../constants";
import type { AppInvoice } from "../../../types";

interface OverviewTabProps {
  inv: AppInvoice;
  effectiveStatus: string;
  shareUrl: string;
  copied: boolean;
  reminderBusy: boolean;
  canMarkPaid: boolean;
  onCopyLink: () => void;
  onSendReminder: () => void;
  onOpenSend: () => void;
  onOpenShare: () => void;
  onOpenMarkPaid: () => void;
  onCancel: () => void;
  onToast: (msg: string) => void;
}

export default function OverviewTab({
  inv,
  effectiveStatus,
  shareUrl,
  copied,
  reminderBusy,
  canMarkPaid,
  onCopyLink,
  onSendReminder,
  onOpenSend,
  onOpenShare,
  onOpenMarkPaid,
  onCancel,
  onToast,
}: OverviewTabProps) {
  return (
    <div
      className="two-col"
      style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Amount card */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--tx3)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 4,
                }}
              >
                Amount
              </div>
              <div
                style={{
                  fontFamily: "var(--mo)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--tx)",
                  letterSpacing: "-.03em",
                }}
              >
                {currencySymbol(inv.currency)}
                {fmt(inv.total)}
              </div>
            </div>
            {inv.homeTotal && inv.homeCurrency && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--tx3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 4,
                  }}
                >
                  Received ({inv.homeCurrency})
                </div>
                <div
                  style={{
                    fontFamily: "var(--mo)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--gdk)",
                  }}
                >
                  {currencySymbol(inv.homeCurrency)}
                  {fmt(inv.homeTotal, 0)}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 140,
                background: "var(--sf2)",
                borderRadius: 8,
                padding: "10px 13px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--tx3)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 3,
                }}
              >
                Client
              </div>
              <div
                style={{ fontSize: 13, fontWeight: 600, color: "var(--tx)" }}
              >
                {inv.client.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--tx3)" }}>
                {inv.client.email}
              </div>
            </div>
            {inv.dueDate && (
              <div
                style={{
                  flex: 1,
                  minWidth: 140,
                  background: isOverdue(inv) ? "var(--rdlt)" : "var(--sf2)",
                  borderRadius: 8,
                  padding: "10px 13px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: 3,
                  }}
                >
                  Due Date
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isOverdue(inv) ? "var(--rd)" : "var(--tx)",
                  }}
                >
                  {dateStr(inv.dueDate)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: isOverdue(inv) ? "var(--rd)" : "var(--tx3)",
                  }}
                >
                  {inv.terms}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line items card */}
        <div className="card">
          <div className="card-ttl">Line Items</div>
          <div className="inv-items" style={{ margin: 0 }}>
            {inv.items.map((it, i: number) => (
              <div key={i} className="ii-row">
                <div>
                  <div>{it.desc}</div>
                  {it.qty > 1 && <div className="ii-sub">x{it.qty}</div>}
                </div>
                <span style={{ fontFamily: "var(--mo)", fontWeight: 600 }}>
                  {currencySymbol(inv.currency)}
                  {fmt(
                    (parseFloat(String(it.price)) || 0) *
                      (parseInt(String(it.qty)) || 1)
                  )}
                </span>
              </div>
            ))}
            {inv.tax && (
              <div className="ii-row">
                <span style={{ color: "var(--tx3)" }}>
                  {TAX_TYPES.find((t) => t.id === inv.tax?.type)?.label} (
                  {inv.tax?.rate}%)
                </span>
                <span style={{ fontFamily: "var(--mo)" }}>
                  {currencySymbol(inv.currency)}
                  {fmt(inv.taxAmt)}
                </span>
              </div>
            )}
            {inv.deposit > 0 && (
              <div className="ii-row">
                <span style={{ color: "var(--pu)" }}>
                  Deposit ({inv.deposit}%)
                </span>
                <span style={{ fontFamily: "var(--mo)", color: "var(--pu)" }}>
                  {currencySymbol(inv.currency)}
                  {fmt(inv.total)}
                </span>
              </div>
            )}
            <div className="ii-tot">
              <span>Total</span>
              <span style={{ fontFamily: "var(--mo)" }}>
                {currencySymbol(inv.currency)}
                {fmt(inv.total)}
              </span>
            </div>
          </div>
          {inv.notes && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                background: "var(--sf2)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--tx2)",
                lineHeight: 1.6,
              }}
            >
              {inv.notes}
            </div>
          )}
        </div>

        {/* Reminder banner */}
        {(effectiveStatus === "overdue" || effectiveStatus === "sent") && (
          <div
            style={{
              background: "var(--amlt)",
              border: "1.5px solid #fcd34d",
              borderRadius: "var(--r)",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{ fontWeight: 600, fontSize: 13, color: "var(--amdk)" }}
              >
                {effectiveStatus === "overdue"
                  ? "This invoice is overdue"
                  : "Awaiting payment"}
              </div>
              <div style={{ fontSize: 12, color: "var(--am)", marginTop: 2 }}>
                {effectiveStatus === "overdue"
                  ? "Send a reminder to your client"
                  : "You can send a reminder if needed"}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: "var(--am)", color: "#fff" }}
              onClick={onSendReminder}
              disabled={reminderBusy}
            >
              {reminderBusy ? (
                <>
                  <Icon n="spin" s={12} c="#fff" /> Sending...
                </>
              ) : (
                <>
                  <Icon n="bell" s={12} c="#fff" /> Send Reminder
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div>
        <div className="card mb3">
          <div className="card-ttl">Share</div>
          <div className="lbox mb3">
            <span className="lurl">https://{shareUrl}</span>
            <button className="btn bg btn-sm" onClick={onCopyLink}>
              {copied ? (
                <Icon n="check" s={12} c="var(--g)" />
              ) : (
                <Icon n="copy" s={12} />
              )}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <button className="btn bs btn-full btn-sm" onClick={onOpenSend}>
              <Icon n="mail" s={13} /> Send by Email
            </button>
            <button className="btn bs btn-full btn-sm" onClick={onOpenShare}>
              <Icon n="whatsapp" s={13} /> Share via WhatsApp
            </button>
          </div>
        </div>
        {inv.status !== "paid" && inv.status !== "cancelled" && (
          <div className="card">
            <div className="card-ttl">Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {canMarkPaid && (
                <button
                  className="btn bp btn-full btn-sm"
                  onClick={onOpenMarkPaid}
                >
                  <Icon n="check" s={13} c="#fff" /> Mark as Paid
                </button>
              )}
              <button
                className="btn bs btn-full btn-sm"
                onClick={() => onToast("Editing...")}
              >
                <Icon n="edit" s={13} /> Edit Invoice
              </button>
              <button className="btn bd btn-full btn-sm" onClick={onCancel}>
                <Icon n="close" s={13} /> Cancel Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
