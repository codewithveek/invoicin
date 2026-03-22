import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "./Icon";
import InvoicePreviewCard from "./InvoicePreviewCard";
import { isOverdue, currencySymbol, fmt, dateStr, ts, wait } from "../utils";
import { TAX_TYPES, STATUS_META, getRate, USER } from "../constants";
import { statusBadge, typeBadge } from "../utils/badges";
import { useApp } from "../context/AppContext";
import type { AppInvoice } from "../types";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { invoices, setInvoices, showToast: toast } = useApp();
  const navigate = useNavigate();
  const invoice = invoices.find((i) => i.id === id);
  const [inv, setInv] = useState<AppInvoice>(invoice!);
  const [sendModal, setSendModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reminderBusy, setReminderBusy] = useState(false);

  if (!invoice) return <div className="pg fade">Invoice not found.</div>;

  const syncInvoice = (updated: AppInvoice) => {
    setInv(updated);
    setInvoices((p) => p.map((i) => (i.id === updated.id ? updated : i)));
  };

  const effectiveStatus = isOverdue(inv) ? "overdue" : inv.status;
  const shareUrl = `app.invoiceapp.co/i/${inv.linkId}`;
  const canSend = ["draft", "sent", "viewed", "overdue"].includes(
    effectiveStatus
  );
  const canMarkPaid = !["paid", "cancelled", "draft"].includes(effectiveStatus);
  const viewCount = inv.events.filter((e) => e.type === "viewed").length;

  async function sendEmail() {
    setSending(true);
    await wait(1200);
    const updated: AppInvoice = {
      ...inv,
      status: "sent",
      events: [...inv.events, { type: "sent", ts: ts() }],
    };
    syncInvoice(updated);
    setSendModal(false);
    setSending(false);
    toast("Invoice sent to " + inv.client.email);
  }

  async function sendReminder() {
    setReminderBusy(true);
    await wait(900);
    const updated: AppInvoice = {
      ...inv,
      events: [...inv.events, { type: "sent", ts: ts() + " (reminder)" }],
    };
    syncInvoice(updated);
    setReminderBusy(false);
    toast("Reminder sent");
  }

  function markPaid() {
    const rate = getRate(inv.currency, USER.homeCurrency);
    const updated: AppInvoice = {
      ...inv,
      status: "paid",
      paid: new Date().toISOString().split("T")[0],
      homeTotal: Math.round(inv.total * rate),
      homeCurrency: USER.homeCurrency,
      events: [...inv.events, { type: "paid", ts: ts() }],
    };
    syncInvoice(updated);
    setMarkPaidModal(false);
    toast("Invoice marked as paid");
  }

  function cancel() {
    const updated: AppInvoice = {
      ...inv,
      status: "cancelled",
      events: [...inv.events, { type: "cancelled", ts: ts() }],
    };
    syncInvoice(updated);
    toast("Invoice cancelled");
  }

  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Link copied to clipboard");
  }

  return (
    <div className="pg fade">
      {/* Send modal */}
      {sendModal && (
        <div className="modal-bg" onClick={() => setSendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Send Invoice by Email</div>
            <div className="modal-sub">
              This will send the invoice to {inv.client.email} with a link to
              view it online.
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
              The email will include a "View Invoice" button that opens the
              invoice page. When the client opens it, you will be notified.
            </div>
            <div className="row">
              <button
                className="btn bp btn-full"
                onClick={sendEmail}
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
              <button className="btn bs" onClick={() => setSendModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareModal && (
        <div className="modal-bg" onClick={() => setShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Share Invoice Link</div>
            <div className="modal-sub">
              Anyone with this link can view the invoice. When they open it, you
              will be notified.
            </div>
            <div className="lbox mb4">
              <span className="lurl">https://{shareUrl}</span>
              <button className="btn bg btn-sm" onClick={copyLink}>
                {copied ? (
                  <>
                    <Icon n="check" s={12} c="var(--g)" /> Copied
                  </>
                ) : (
                  <>
                    <Icon n="copy" s={12} /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="row">
              <button
                className="btn bs btn-full"
                onClick={() => {
                  toast("Opening WhatsApp...");
                  setShareModal(false);
                }}
              >
                <Icon n="whatsapp" s={13} /> Share via WhatsApp
              </button>
              <button
                className="btn bs btn-full"
                onClick={() => {
                  toast("Opening email client...");
                  setShareModal(false);
                }}
              >
                <Icon n="mail" s={13} /> Open in Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark paid modal */}
      {markPaidModal && (
        <div className="modal-bg" onClick={() => setMarkPaidModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ttl">Mark as Paid</div>
            <div className="modal-sub">
              Confirm that you have received payment of{" "}
              {currencySymbol(inv.currency)}
              {fmt(inv.total)} for this invoice.
            </div>
            <div className="row">
              <button className="btn bp btn-full" onClick={markPaid}>
                <Icon n="check" s={13} c="#fff" /> Confirm Payment Received
              </button>
              <button
                className="btn bs"
                onClick={() => setMarkPaidModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
            {statusBadge(effectiveStatus)}
            {typeBadge(inv.type)}
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
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--tx)",
                    }}
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
                    <span
                      style={{ fontFamily: "var(--mo)", color: "var(--pu)" }}
                    >
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
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "var(--amdk)",
                    }}
                  >
                    {effectiveStatus === "overdue"
                      ? "This invoice is overdue"
                      : "Awaiting payment"}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--am)", marginTop: 2 }}
                  >
                    {effectiveStatus === "overdue"
                      ? "Send a reminder to your client"
                      : "You can send a reminder if needed"}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: "var(--am)", color: "#fff" }}
                  onClick={sendReminder}
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

          <div>
            <div className="card mb3">
              <div className="card-ttl">Share</div>
              <div className="lbox mb3">
                <span className="lurl">https://{shareUrl}</span>
                <button className="btn bg btn-sm" onClick={copyLink}>
                  {copied ? (
                    <Icon n="check" s={12} c="var(--g)" />
                  ) : (
                    <Icon n="copy" s={12} />
                  )}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <button
                  className="btn bs btn-full btn-sm"
                  onClick={() => setSendModal(true)}
                >
                  <Icon n="mail" s={13} /> Send by Email
                </button>
                <button
                  className="btn bs btn-full btn-sm"
                  onClick={() => setShareModal(true)}
                >
                  <Icon n="whatsapp" s={13} /> Share via WhatsApp
                </button>
              </div>
            </div>
            {inv.status !== "paid" && inv.status !== "cancelled" && (
              <div className="card">
                <div className="card-ttl">Actions</div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {canMarkPaid && (
                    <button
                      className="btn bp btn-full btn-sm"
                      onClick={() => setMarkPaidModal(true)}
                    >
                      <Icon n="check" s={13} c="#fff" /> Mark as Paid
                    </button>
                  )}
                  <button
                    className="btn bs btn-full btn-sm"
                    onClick={() => toast("Editing...")}
                  >
                    <Icon n="edit" s={13} /> Edit Invoice
                  </button>
                  <button className="btn bd btn-full btn-sm" onClick={cancel}>
                    <Icon n="close" s={13} /> Cancel Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div
          className="two-col"
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18 }}
        >
          <div>
            <div className="card mb4">
              <div className="card-ttl">Tracking</div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                {(
                  [
                    ["Views", viewCount, viewCount > 0 ? "b-purple" : "b-gray"],
                    [
                      "Status",
                      STATUS_META[effectiveStatus]?.label || "Draft",
                      (
                        {
                          green: "b-green",
                          blue: "b-blue",
                          red: "b-red",
                          amber: "b-amber",
                          purple: "b-purple",
                          gray: "b-gray",
                        } as Record<string, string>
                      )[STATUS_META[effectiveStatus]?.color || "gray"],
                    ],
                    [
                      "Sent",
                      inv.events.filter((e) => e.type === "sent").length + "x",
                      "b-blue",
                    ],
                  ] as [string, string | number, string][]
                ).map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{
                      background: "var(--sf2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      flex: 1,
                      minWidth: 80,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--tx3)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 4,
                      }}
                    >
                      {l}
                    </div>
                    <span className={`badge ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              {viewCount > 0 && (
                <div
                  style={{
                    background: "var(--pult)",
                    border: "1px solid #c4b5fd",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--pu)",
                      marginBottom: 2,
                    }}
                  >
                    Client opened this invoice
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--pu)", opacity: 0.8 }}
                  >
                    Last viewed:{" "}
                    {inv.events.filter((e) => e.type === "viewed").pop()?.ts}
                  </div>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-ttl">Activity Log</div>
              <div className="timeline">
                {[...inv.events].reverse().map((ev, i: number) => {
                  const iconMap: Record<string, string> = {
                    created: "tag",
                    sent: "send",
                    viewed: "eye",
                    downloaded: "download",
                    paid: "check",
                    cancelled: "close",
                    disputed: "alert",
                    reminder: "bell",
                  };
                  return (
                    <div key={i} className="tl-item">
                      <div
                        className={`tl-dot ${
                          ev.type === "paid" ? "done" : i === 0 ? "active" : ""
                        }`}
                      >
                        <Icon
                          n={iconMap[ev.type] || "activity"}
                          s={11}
                          c={
                            ev.type === "paid"
                              ? "var(--g)"
                              : i === 0
                              ? "var(--bl)"
                              : "var(--tx3)"
                          }
                        />
                      </div>
                      <div>
                        <div
                          className="tl-lbl"
                          style={{ textTransform: "capitalize" }}
                        >
                          {ev.type.replace("_", " ")}
                        </div>
                        <div className="tl-ts">{ev.ts}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card-ttl">Invoice Status</div>
            <div className="timeline">
              {[
                { label: "Draft", done: true, active: inv.status === "draft" },
                {
                  label: "Sent",
                  done: ["sent", "viewed", "overdue", "paid"].includes(
                    inv.status
                  ),
                  active: inv.status === "sent",
                },
                {
                  label: "Viewed",
                  done:
                    ["viewed", "paid"].includes(inv.status) || viewCount > 0,
                  active: inv.status === "viewed",
                },
                { label: "Paid", done: inv.status === "paid", active: false },
              ].map((st, i) => (
                <div key={i} className="tl-item">
                  <div
                    className={`tl-dot ${st.done ? "done" : ""} ${
                      st.active ? "active" : ""
                    }`}
                  >
                    {st.done ? (
                      <Icon n="check" s={10} c="var(--g)" />
                    ) : (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "var(--bd2)",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className="tl-lbl"
                      style={{
                        color: st.done
                          ? "var(--tx)"
                          : st.active
                          ? "var(--tx)"
                          : "var(--tx3)",
                        fontWeight: st.done || st.active ? 600 : 400,
                      }}
                    >
                      {st.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
