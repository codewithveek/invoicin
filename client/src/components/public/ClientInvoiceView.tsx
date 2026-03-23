import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../shared/Icon";
import InvoicePreviewCard from "../shared/InvoicePreviewCard";
import { useInvoices } from "../../hooks/useInvoices";

export default function ClientInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useInvoices();
  const navigate = useNavigate();
  const invoice = invoices.find((i) => i.id === id);
  const [paid, setPaid] = useState(false);

  if (!invoice) return <div className="pg fade">Invoice not found.</div>;

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
            invoiceapp.co
          </span>
          <span>· Secure invoice</span>
        </div>
        <button className="btn bg btn-sm" onClick={() => navigate(-1)}>
          <Icon n="chevL" s={12} />
          Back to Dashboard
        </button>
      </div>

      {paid ? (
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
            You have confirmed payment for invoice {invoice.id}. The freelancer
            has been notified.
          </div>
          <button className="btn bp btn-full" onClick={() => setPaid(false)}>
            <Icon n="chevL" s={13} c="#fff" />
            Back to Invoice
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 460, width: "100%" }}>
          <InvoicePreviewCard
            inv={invoice}
            freelancer={{ name: "Lucky Eze", business: "DevCraft Studio" }}
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
              onClick={() => setPaid(true)}
            >
              <Icon n="check" s={14} c="#fff" />I have made this payment
            </button>
            <button className="btn bs btn-full" onClick={() => {}}>
              <Icon n="download" s={13} />
              Download PDF
            </button>
            <div
              style={{ textAlign: "center", fontSize: 11, color: "var(--tx3)" }}
            >
              Have questions? Contact{" "}
              {invoice.client?.email || "the freelancer"} directly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
