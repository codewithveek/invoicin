import Icon from "../../shared/Icon";
import { currencySymbol, fmt } from "../../../utils";
import type { AppInvoice } from "../../../types";

interface SendModalProps {
  inv: AppInvoice;
  sending: boolean;
  onSend: () => void;
  onClose: () => void;
}

export default function SendModal({
  inv,
  sending,
  onSend,
  onClose,
}: SendModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ttl">Send Invoice by Email</div>
        <div className="modal-sub">
          This will send the invoice to {inv.client.email} with a link to view
          it online.
        </div>
        <div
          style={{
            background: "var(--sf2)",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          {[
            ["To", inv.client.email],
            ["Subject", `Invoice ${inv.id} from DevCraft Studio`],
            ["Amount", `${currencySymbol(inv.currency)}${fmt(inv.total)}`],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "var(--tx3)" }}>{l}</span>
              <span
                style={{
                  fontWeight: 600,
                  fontFamily: l === "Amount" ? "var(--mo)" : undefined,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--tx3)",
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          The email will include a "View Invoice" button that opens the invoice
          page. When the client opens it, you will be notified.
        </div>
        <div className="row">
          <button
            className="btn bp btn-full"
            onClick={onSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <Icon n="spin" s={13} c="#fff" /> Sending...
              </>
            ) : (
              <>
                <Icon n="mail" s={13} c="#fff" /> Send Invoice
              </>
            )}
          </button>
          <button className="btn bs" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
