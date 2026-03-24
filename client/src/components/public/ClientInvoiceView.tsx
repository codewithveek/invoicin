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
      // silently ignore â€” confirmation is best-effort
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Icon n="spin" s={24} c="var(--color-tx3)" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-tx3 text-[14px]">
        {error || "Invoice not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-6 flex flex-col items-center fade">
      <div className="w-full max-w-[560px] flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="text-[11px] text-tx3 flex items-center gap-[5px]">
          <Icon n="zap" s={12} c="var(--color-brand)" />
          <span className="text-brand-dark font-semibold">invoicin.pro</span>
          <span>Â· Secure invoice</span>
        </div>
      </div>

      {confirmed ? (
        <div className="max-w-[460px] w-full bg-sf rounded-[16px] p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-brand-light border-2 border-brand-mid flex items-center justify-center mx-auto mb-4 animate-[fi_.3s_ease]">
            <Icon n="check" s={28} c="var(--color-brand)" />
          </div>
          <div className="text-[20px] font-bold text-tx mb-1.5">Thank you!</div>
          <div className="text-[13px] text-tx3 leading-relaxed mb-5">
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
        <div className="max-w-[460px] w-full">
          <InvoicePreviewCard
            inv={invoice}
            freelancer={{ name: invoice.freelancerName || "" }}
            homeCurrency={invoice.currency}
          />
          <div className="mt-4 flex flex-col gap-[10px]">
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
            <div className="text-center text-[11px] text-tx3">
              Have questions? Contact {invoice.client?.email || "the sender"}{" "}
              directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
