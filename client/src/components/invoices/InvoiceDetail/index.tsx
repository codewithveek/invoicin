import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../shared/Icon";
import InvoicePreviewCard from "../../shared/InvoicePreviewCard";
import { StatusBadge, TypeBadge } from "../../shared/Badges";
import SendModal from "./SendModal";
import ShareModal from "./ShareModal";
import MarkPaidModal from "./MarkPaidModal";
import OverviewTab from "./OverviewTab";
import ActivityTab from "./ActivityTab";
import { isOverdue, dateStr, ts, wait } from "../../../utils";
import { getRate, USER } from "../../../constants";
import { useInvoice, useInvoiceMutations } from "../../../hooks/useInvoices";
import type { AppInvoice } from "../../../types";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const invoice = useInvoice(id!);
  const { syncInvoice, showToast: toast } = useInvoiceMutations();
  const navigate = useNavigate();

  const [inv, setInv] = useState<AppInvoice>(invoice!);
  const [sendModal, setSendModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reminderBusy, setReminderBusy] = useState(false);

  if (!invoice) return <div className="pg fade">Invoice not found.</div>;

  const update = (updated: AppInvoice) => {
    setInv(updated);
    syncInvoice(updated);
  };

  const effectiveStatus = isOverdue(inv) ? "overdue" : inv.status;
  const shareUrl = `app.invoiceapp.co/i/${inv.linkId}`;
  const canSend = ["draft", "sent", "viewed", "overdue"].includes(
    effectiveStatus
  );
  const canMarkPaid = !["paid", "cancelled", "draft"].includes(effectiveStatus);

  async function sendEmail() {
    setSending(true);
    await wait(1200);
    update({
      ...inv,
      status: "sent",
      events: [...inv.events, { type: "sent", ts: ts() }],
    });
    setSendModal(false);
    setSending(false);
    toast("Invoice sent to " + inv.client.email);
  }

  async function sendReminder() {
    setReminderBusy(true);
    await wait(900);
    update({
      ...inv,
      events: [...inv.events, { type: "sent", ts: ts() + " (reminder)" }],
    });
    setReminderBusy(false);
    toast("Reminder sent");
  }

  function markPaid() {
    const rate = getRate(inv.currency, USER.homeCurrency);
    update({
      ...inv,
      status: "paid",
      paid: new Date().toISOString().split("T")[0],
      homeTotal: Math.round(inv.total * rate),
      homeCurrency: USER.homeCurrency,
      events: [...inv.events, { type: "paid", ts: ts() }],
    });
    setMarkPaidModal(false);
    toast("Invoice marked as paid");
  }

  function cancel() {
    update({
      ...inv,
      status: "cancelled",
      events: [...inv.events, { type: "cancelled", ts: ts() }],
    });
    toast("Invoice cancelled");
  }

  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Link copied to clipboard");
  }

  return (
    <div className="pg fade">
      {sendModal && (
        <SendModal
          inv={inv}
          sending={sending}
          onSend={sendEmail}
          onClose={() => setSendModal(false)}
        />
      )}
      {shareModal && (
        <ShareModal
          shareUrl={shareUrl}
          copied={copied}
          onCopy={copyLink}
          onClose={() => setShareModal(false)}
          onToast={toast}
        />
      )}
      {markPaidModal && (
        <MarkPaidModal
          inv={inv}
          onConfirm={markPaid}
          onClose={() => setMarkPaidModal(false)}
        />
      )}

      <button
        className="btn bg btn-sm mb4"
        onClick={() => navigate("/invoices")}
      >
        <Icon n="chevL" s={13} /> Back
      </button>

      <div className="pg-hd">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div className="pg-ttl">{inv.id}</div>
            <StatusBadge status={effectiveStatus} />
            <TypeBadge type={inv.type} />
          </div>
          <div className="pg-sub">
            {inv.client.name} {"\u00b7"} Created {dateStr(inv.created)}
          </div>
        </div>
        <div className="row">
          {canMarkPaid && (
            <button
              className="btn bp btn-sm"
              onClick={() => setMarkPaidModal(true)}
            >
              <Icon n="check" s={13} c="#fff" /> Mark Paid
            </button>
          )}
          {canSend && (
            <button
              className="btn bs btn-sm"
              onClick={() => setSendModal(true)}
            >
              <Icon n="mail" s={13} /> Send Email
            </button>
          )}
          <button className="btn bs btn-sm" onClick={() => setShareModal(true)}>
            <Icon n="link" s={13} /> Share Link
          </button>
          <button
            className="btn bg btn-sm"
            onClick={() => toast("Downloading PDF...")}
          >
            <Icon n="download" s={13} /> PDF
          </button>
        </div>
      </div>

      <div className="tabs">
        {[
          ["overview", "Overview"],
          ["activity", "Tracking & Activity"],
          ["preview", "Invoice Preview"],
        ].map(([k, l]) => (
          <button
            key={k}
            className={`tab ${activeTab === k ? "on" : ""}`}
            onClick={() => setActiveTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          inv={inv}
          effectiveStatus={effectiveStatus}
          shareUrl={shareUrl}
          copied={copied}
          reminderBusy={reminderBusy}
          canMarkPaid={canMarkPaid}
          onCopyLink={copyLink}
          onSendReminder={sendReminder}
          onOpenSend={() => setSendModal(true)}
          onOpenShare={() => setShareModal(true)}
          onOpenMarkPaid={() => setMarkPaidModal(true)}
          onCancel={cancel}
          onToast={toast}
        />
      )}

      {activeTab === "activity" && (
        <ActivityTab inv={inv} effectiveStatus={effectiveStatus} />
      )}

      {activeTab === "preview" && (
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "start",
          }}
        >
          <InvoicePreviewCard
            inv={inv}
            freelancer={{ name: "Lucky Eze", business: "DevCraft Studio" }}
            homeCurrency={inv.currency}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 260,
            }}
          >
            <button
              className="btn bp btn-full"
              onClick={() => toast("Downloading PDF...")}
            >
              <Icon n="download" s={14} c="#fff" /> Download PDF
            </button>
            <button
              className="btn bs btn-full"
              onClick={() => setSendModal(true)}
            >
              <Icon n="mail" s={14} /> Send by Email
            </button>
            <button
              className="btn bs btn-full"
              onClick={() => setShareModal(true)}
            >
              <Icon n="link" s={14} /> Copy Shareable Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
