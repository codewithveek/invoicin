import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Icon from "../shared/Icon";
import InvoicePreviewCard from "../shared/InvoicePreviewCard";
import type { AppInvoice } from "../../types";

type PublicInvoice = AppInvoice & { freelancerName?: string };

export default function ClientInvoiceView() {
  const { linkId } = useParams<{ linkId: string }>();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!linkId) return;
    fetch(`/api/i/${encodeURIComponent(linkId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Invoice not found");
        return res.json() as Promise<AppInvoice>;
      })
      .then(setInvoice)
      .catch(() => setError("Invoice not found or no longer available."))
      .finally(() => setLoading(false));
  }, [linkId]);

  async function confirmPayment() {
    if (!linkId) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/i/${encodeURIComponent(linkId)}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      setConfirmed(true);
    } catch {
      // silently ignore — confirmation is best-effort
    } finally {
      setConfirming(false);
    }
  }

  async function downloadPdf() {
    if (!linkId) return;
    try {
      await fetch(`/api/i/${encodeURIComponent(linkId)}/download`, {
        method: "POST",
      });
    } catch {
      // tracking is best-effort
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <Icon n="spin" s={24} c="var(--tx3)" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--tx3)",
          fontSize: 14,
        }}
      >
        {error || "Invoice not found."}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="fade"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--tx3)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Icon n="zap" s={12} c="var(--g)" />
          <span style={{ color: "var(--gdk)", fontWeight: 600 }}>
            invoicin.pro
          </span>
          <span>· Secure invoice</span>
        </div>
      </div>

      {confirmed ? (
        <div
          style={{
            maxWidth: 460,
            width: "100%",
            background: "var(--sf)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            boxShadow: "var(--shl)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--glt)",
              border: "2px solid var(--gmid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              animation: "fi .3s ease",
            }}
          >
            <Icon n="check" s={28} c="var(--g)" />
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--tx)",
              marginBottom: 6,
            }}
          >
            Thank you!
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--tx3)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            You have confirmed payment for invoice {invoice.id}. The sender has
            been notified.
          </div>
          <button
            className="btn bp btn-full"
            onClick={() => setConfirmed(false)}
          >
            <Icon n="chevL" s={13} c="#fff" />
            Back to Invoice
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 460, width: "100%" }}>
          <InvoicePreviewCard
            inv={invoice}
            freelancer={{ name: invoice.freelancerName || "" }}
            homeCurrency={invoice.currency}
          />
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              className="btn bp btn-full btn-lg"
              onClick={confirmPayment}
              disabled={confirming}
              style={confirming ? { opacity: 0.6 } : undefined}
            >
              {confirming ? (
                <Icon n="spin" s={14} c="#fff" />
              ) : (
                <Icon n="check" s={14} c="#fff" />
              )}
              I have made this payment
            </button>
            <button className="btn bs btn-full" onClick={downloadPdf}>
              <Icon n="download" s={13} />
              Download PDF
            </button>
            <div
              style={{ textAlign: "center", fontSize: 11, color: "var(--tx3)" }}
            >
              Have questions? Contact {invoice.client?.email || "the sender"}{" "}
              directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
