"use client";
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
        <div className="bg-sf2 rounded-lg px-[14px] py-3 mb-4">
          {[
            ["To", inv.client.email],
            ["Subject", `Invoice ${inv.id} from DevCraft Studio`],
            ["Amount", `${currencySymbol(inv.currency)}${fmt(inv.total)}`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-[12px] mb-1">
              <span className="text-tx3">{l}</span>
              <span
                className={`font-semibold${l === "Amount" ? " font-mono" : ""}`}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[12px] text-tx3 mb-4 leading-relaxed">
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
