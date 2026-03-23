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
import { isOverdue, dateStr } from "../../../utils";
import { useInvoice, useInvoiceMutations } from "../../../hooks/useInvoices";
import { useApp } from "../../../context/AppContext";
import type { AppInvoice } from "../../../types";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const invoice = useInvoice(id!);
  const {
    syncInvoice,
    sendInvoice,
    remindInvoice,
    updateInvoice,
    recordPayment,
    downloadPdf,
    showToast: toast,
  } = useInvoiceMutations();
  const { user } = useApp();
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
    try {
      await sendInvoice(inv.id);
      update({ ...inv, status: "sent" });
      setSendModal(false);
      toast("Invoice sent to " + inv.client.email);
    } catch {
      toast("Failed to send invoice");
    } finally {
      setSending(false);
    }
  }

  async function sendReminder() {
    setReminderBusy(true);
    try {
      await remindInvoice(inv.id);
      toast("Reminder sent");
    } catch {
      toast("Failed to send reminder");
    } finally {
      setReminderBusy(false);
    }
  }

  async function markPaid() {
    try {
      await recordPayment(inv.id, {
        amount: inv.total,
        currency: inv.currency,
        paidDate: new Date().toISOString().split("T")[0],
      });
      setMarkPaidModal(false);
      toast("Invoice marked as paid");
    } catch {
      toast("Failed to mark as paid");
    }
  }

  async function cancel() {
    try {
      await updateInvoice(inv.id, { status: "cancelled" });
      update({ ...inv, status: "cancelled" });
      toast("Invoice cancelled");
    } catch {
      toast("Failed to cancel invoice");
    }
  }

  async function handleDownloadPdf() {
    try {
      await downloadPdf(inv.id);
      toast("PDF downloaded");
    } catch {
      toast("Failed to download PDF");
    }
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
          <button className="btn bg btn-sm" onClick={handleDownloadPdf}>
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
            freelancer={{
              name: user?.name ?? "User",
              business: user?.businessName ?? "",
            }}
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
            <button className="btn bp btn-full" onClick={handleDownloadPdf}>
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
