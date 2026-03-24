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
  cancelBusy: boolean;
  canMarkPaid: boolean;
  onCopyLink: () => void;
  onSendReminder: () => void;
  onOpenSend: () => void;
  onOpenShare: () => void;
  onOpenMarkPaid: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onToast: (msg: string) => void;
}

export default function OverviewTab({
  inv,
  effectiveStatus,
  shareUrl,
  copied,
  reminderBusy,
  cancelBusy,
  canMarkPaid,
  onCopyLink,
  onSendReminder,
  onOpenSend,
  onOpenShare,
  onOpenMarkPaid,
  onCancel,
  onEdit,
}: // onToast,
OverviewTabProps) {
  return (
    <div className="two-col flex flex-row flex-wrap gap-[18px]">
      <div className="flex flex-col gap-4 flex-1 min-w-[280px]">
        {/* Amount card */}
        <div className="card">
          <div className="flex justify-between flex-wrap gap-[10px] mb-[18px]">
            <div>
              <div className="text-[11px] font-bold text-tx3 uppercase tracking-[.06em] mb-1">
                Amount
              </div>
              <div className="font-mono text-[28px] font-bold text-tx tracking-[-0.03em]">
                {currencySymbol(inv.currency)}
                {fmt(inv.total)}
              </div>
            </div>
            {inv.homeTotal && inv.homeCurrency && (
              <div className="text-right">
                <div className="text-[11px] font-bold text-tx3 uppercase tracking-[.06em] mb-1">
                  Received ({inv.homeCurrency})
                </div>
                <div className="font-mono text-[22px] font-bold text-brand-dark">
                  {currencySymbol(inv.homeCurrency)}
                  {fmt(inv.homeTotal, 0)}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-[10px] flex-wrap">
            <div className="flex-1 min-w-[140px] bg-sf2 rounded-lg px-[13px] py-[10px]">
              <div className="text-[10px] font-bold text-tx3 uppercase tracking-[.06em] mb-[3px]">
                Client
              </div>
              <div className="text-[13px] font-semibold text-tx">
                {inv.client.name}
              </div>
              <div className="text-[11px] text-tx3">{inv.client.email}</div>
            </div>
            {inv.dueDate && (
              <div
                className={`flex-1 min-w-[140px] rounded-lg px-[13px] py-[10px] ${
                  isOverdue(inv) ? "bg-red-light" : "bg-sf2"
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-[.06em] mb-[3px] ${
                    isOverdue(inv) ? "text-red" : "text-tx3"
                  }`}
                >
                  Due Date
                </div>
                <div
                  className={`text-[13px] font-semibold ${
                    isOverdue(inv) ? "text-red" : "text-tx"
                  }`}
                >
                  {dateStr(inv.dueDate)}
                </div>
                <div
                  className={`text-[11px] ${
                    isOverdue(inv) ? "text-red" : "text-tx3"
                  }`}
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
          <div className="inv-items !m-0">
            {inv.items.map((it, i: number) => (
              <div key={i} className="ii-row">
                <div>
                  <div>{it.desc}</div>
                  {it.qty > 1 && <div className="ii-sub">x{it.qty}</div>}
                </div>
                <span className="font-mono font-semibold">
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
                <span className="text-tx3">
                  {TAX_TYPES.find((t) => t.id === inv.tax?.type)?.label} (
                  {inv.tax?.rate}%)
                </span>
                <span className="font-mono">
                  {currencySymbol(inv.currency)}
                  {fmt(inv.taxAmt)}
                </span>
              </div>
            )}
            {inv.deposit > 0 && (
              <div className="ii-row">
                <span className="text-purple">Deposit ({inv.deposit}%)</span>
                <span className="font-mono text-purple">
                  {currencySymbol(inv.currency)}
                  {fmt(inv.total)}
                </span>
              </div>
            )}
            <div className="ii-tot">
              <span>Total</span>
              <span className="font-mono">
                {currencySymbol(inv.currency)}
                {fmt(inv.total)}
              </span>
            </div>
          </div>
          {inv.notes && (
            <div className="mt-3 px-3 py-[10px] bg-sf2 rounded-lg text-[12px] text-tx2 leading-relaxed">
              {inv.notes}
            </div>
          )}
        </div>

        {/* Reminder banner */}
        {(effectiveStatus === "overdue" || effectiveStatus === "sent") && (
          <div className="bg-amber-light border-[1.5px] border-[#fcd34d] rounded-[var(--radius-md)] px-[18px] py-3 flex justify-between items-center flex-wrap gap-[10px]">
            <div>
              <div className="font-semibold text-[13px] text-[#92400e]">
                {effectiveStatus === "overdue"
                  ? "This invoice is overdue"
                  : "Awaiting payment"}
              </div>
              <div className="text-[12px] text-amber mt-[2px]">
                {effectiveStatus === "overdue"
                  ? "Send a reminder to your client"
                  : "You can send a reminder if needed"}
              </div>
            </div>
            <button
              className="btn btn-sm bg-amber text-white"
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
          <div className="flex flex-col gap-[7px]">
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
            <div className="flex flex-col gap-2">
              {canMarkPaid && (
                <button
                  className="btn bp btn-full btn-sm"
                  onClick={onOpenMarkPaid}
                >
                  <Icon n="check" s={13} c="#fff" /> Mark as Paid
                </button>
              )}
              <button className="btn bs btn-full btn-sm" onClick={onEdit}>
                <Icon n="edit" s={13} /> Edit Invoice
              </button>
              <button
                className="btn bd btn-full btn-sm"
                onClick={onCancel}
                disabled={cancelBusy}
              >
                {cancelBusy ? (
                  <Icon n="spin" s={13} />
                ) : (
                  <Icon n="close" s={13} />
                )}
                {cancelBusy ? " Cancelling…" : " Cancel Invoice"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
