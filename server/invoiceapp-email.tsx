// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — Email Templates (React Email + Resend)
//
// Install:
//   npm install resend @react-email/components
//
// Usage:
//   import { sendInvoiceEmail, sendReminderEmail } from "./invoiceapp-email";
//   await sendInvoiceEmail({ invoice, freelancer, appUrl });
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from "resend";
import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Heading, Hr, Button, Img, Link, Preview,
} from "@react-email/components";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = "InvoiceApp <invoices@yourdomain.com>";

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const styles = {
  body:       { backgroundColor: "#f4f6f4", fontFamily: "'DM Sans', -apple-system, sans-serif", margin: 0 },
  container:  { maxWidth: 560, margin: "0 auto", padding: "32px 16px" },
  card:       { backgroundColor: "#ffffff", borderRadius: 14, overflow: "hidden" as const, border: "1px solid #dde8de" },
  header:     { background: "linear-gradient(155deg, #14532d 0%, #16a34a 100%)", padding: "28px 28px 24px" },
  headerBadge:{ display: "inline-block", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.05em", marginBottom: 12 },
  headerName: { fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" },
  headerSub:  { fontSize: 12, color: "rgba(255,255,255,0.72)", margin: 0 },
  amtLabel:   { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.07em", margin: "16px 0 4px" },
  amtBig:     { fontSize: 36, fontWeight: 800, color: "#fff", fontFamily: "monospace", letterSpacing: "-0.04em", margin: 0 },
  amtSub:     { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "monospace", margin: "4px 0 0" },
  body_pad:   { padding: "22px 28px" },
  row:        { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #dde8de" },
  label:      { fontSize: 12, color: "#8aab90", fontWeight: 500 },
  value:      { fontSize: 12, color: "#111d13", fontWeight: 600, textAlign: "right" as const },
  itemsBox:   { backgroundColor: "#f0f4f1", borderRadius: 8, padding: "12px", margin: "12px 0" },
  itemRow:    { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: "#4a6350", borderBottom: "1px dashed #dde8de" },
  totalRow:   { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#111d13", paddingTop: 8, marginTop: 6, borderTop: "1.5px solid #dde8de" },
  cta:        { backgroundColor: "#16a34a", color: "#fff", borderRadius: 9, padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block", marginTop: 20 },
  footer:     { textAlign: "center" as const, marginTop: 24, fontSize: 11, color: "#8aab90" },
  stamp:      { display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", backgroundColor: "#f0f4f1", borderTop: "1.5px solid #bbf7d0" },
};

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface InvoiceItem { desc: string; qty: number; price: number; }
interface InvoiceData {
  id: string;
  linkId: string;
  type: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  items: InvoiceItem[];
  taxType?: string;
  taxRate?: number;
  taxAmount?: number;
  deposit?: number;
  total: number;
  dueDate?: string;
  terms?: string;
  notes?: string;
  issueDate: string;
}
interface FreelancerData {
  name: string;
  businessName?: string;
  email: string;
}

const currencySymbol = (c: string) => ({ USD:"$", GBP:"\u00a3", EUR:"\u20ac", CAD:"C$", AUD:"A$", NGN:"\u20a6" }[c] || "$");
const fmt  = (n: number, d = 2) => n.toLocaleString("en", { minimumFractionDigits: d, maximumFractionDigits: d });

// ── INVOICE EMAIL TEMPLATE ────────────────────────────────────────────────────
function InvoiceEmailTemplate({ invoice, freelancer, appUrl, previewText }: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  previewText?: string;
}) {
  const S = currencySymbol(invoice.currency);
  const typeLabel = { standard:"Invoice", proforma:"Proforma Invoice", deposit:"Deposit Invoice", credit:"Credit Note" }[invoice.type] || "Invoice";
  const invoiceUrl = `${appUrl}/i/${invoice.linkId}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText || `${typeLabel} ${invoice.id} from ${freelancer.businessName || freelancer.name} — ${S}${fmt(invoice.total)} due`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerBadge}>{typeLabel.toUpperCase()}</div>
              <div style={styles.headerName}>{freelancer.businessName || freelancer.name}</div>
              <div style={styles.headerSub}>Invoice for {invoice.clientName}</div>
              <div style={styles.amtLabel}>Amount due</div>
              <div style={styles.amtBig}>{S}{fmt(invoice.total)}</div>
              {invoice.dueDate && (
                <div style={styles.amtSub}>Due by {new Date(invoice.dueDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}</div>
              )}
            </div>

            {/* Body */}
            <div style={styles.body_pad}>
              <div style={styles.row}>
                <span style={styles.label}>Invoice #</span>
                <span style={{ ...styles.value, fontFamily: "monospace" }}>{invoice.id}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Date</span>
                <span style={styles.value}>{new Date(invoice.issueDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}</span>
              </div>
              {invoice.terms && (
                <div style={styles.row}>
                  <span style={styles.label}>Terms</span>
                  <span style={styles.value}>{invoice.terms}</span>
                </div>
              )}
              <div style={styles.row}>
                <span style={styles.label}>From</span>
                <span style={styles.value}>{freelancer.businessName || freelancer.name}<br/><span style={{ fontSize: 11, color: "#8aab90" }}>{freelancer.email}</span></span>
              </div>

              {/* Line items */}
              <div style={styles.itemsBox}>
                {invoice.items.map((item, i) => (
                  <div key={i} style={{ ...styles.itemRow, borderBottom: i < invoice.items.length - 1 ? "1px dashed #dde8de" : "none" }}>
                    <span>{item.desc}{item.qty > 1 ? ` x${item.qty}` : ""}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{S}{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                {invoice.taxAmount != null && invoice.taxAmount > 0 && (
                  <div style={{ ...styles.itemRow, borderBottom: "none", color: "#8aab90" }}>
                    <span>{invoice.taxType?.toUpperCase()} ({invoice.taxRate}%)</span>
                    <span style={{ fontFamily: "monospace" }}>{S}{fmt(invoice.taxAmount)}</span>
                  </div>
                )}
                <div style={styles.totalRow}>
                  <span>{invoice.type === "deposit" ? `Deposit (${invoice.deposit}%)` : "Total"}</span>
                  <span style={{ fontFamily: "monospace" }}>{S}{fmt(invoice.total)}</span>
                </div>
              </div>

              {invoice.notes && (
                <div style={{ padding: "10px 12px", backgroundColor: "#f0f4f1", borderRadius: 8, fontSize: 12, color: "#4a6350", lineHeight: 1.6, marginBottom: 12 }}>
                  {invoice.notes}
                </div>
              )}

              {/* CTA */}
              <div style={{ textAlign: "center", paddingBottom: 8 }}>
                <a href={invoiceUrl} style={styles.cta}>View Invoice</a>
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: "#8aab90", marginTop: 10 }}>
                Or copy this link: <a href={invoiceUrl} style={{ color: "#16a34a" }}>{invoiceUrl}</a>
              </div>
            </div>

            {/* Stamp */}
            <div style={styles.stamp}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 }}/>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d" }}>Created with InvoiceApp</div>
              <div style={{ fontSize: 10, color: "#8aab90", fontFamily: "monospace", marginLeft: "auto" }}>{invoice.id}</div>
            </div>
          </div>

          <div style={styles.footer}>
            <p>You received this because {freelancer.name} sent you an invoice via InvoiceApp.</p>
            <p>Questions? Reply directly to {freelancer.email}</p>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// ── REMINDER EMAIL TEMPLATE ───────────────────────────────────────────────────
function ReminderEmailTemplate({ invoice, freelancer, appUrl, daysOverdue }: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  daysOverdue: number;
}) {
  const S = currencySymbol(invoice.currency);
  const invoiceUrl = `${appUrl}/i/${invoice.linkId}`;
  const isFirstReminder = daysOverdue <= 1;

  return (
    <Html lang="en">
      <Head />
      <Preview>{isFirstReminder ? `Friendly reminder: Invoice ${invoice.id} was due today` : `Overdue: Invoice ${invoice.id} is ${daysOverdue} days past due`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <div style={styles.card}>
            <div style={{ ...styles.header, background: isFirstReminder ? "linear-gradient(155deg, #14532d 0%, #16a34a 100%)" : "linear-gradient(155deg, #7c2d12 0%, #dc2626 100%)" }}>
              <div style={styles.headerBadge}>{isFirstReminder ? "PAYMENT REMINDER" : `${daysOverdue} DAYS OVERDUE`}</div>
              <div style={styles.headerName}>{isFirstReminder ? "Just a friendly reminder" : "Payment is overdue"}</div>
              <div style={styles.headerSub}>Invoice {invoice.id} from {freelancer.businessName || freelancer.name}</div>
              <div style={styles.amtLabel}>Amount due</div>
              <div style={styles.amtBig}>{S}{fmt(invoice.total)}</div>
            </div>
            <div style={styles.body_pad}>
              <Text style={{ fontSize: 14, color: "#4a6350", lineHeight: 1.7 }}>
                Hi {invoice.clientName},{" "}
                {isFirstReminder
                  ? `This is a friendly reminder that invoice ${invoice.id} for ${S}${fmt(invoice.total)} is due today.`
                  : `Invoice ${invoice.id} for ${S}${fmt(invoice.total)} is now ${daysOverdue} days past its due date.`
                }{" "}
                If you have already made the payment, please disregard this message.
              </Text>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <a href={invoiceUrl} style={{ ...styles.cta, backgroundColor: isFirstReminder ? "#16a34a" : "#dc2626" }}>View & Pay Invoice</a>
              </div>
            </div>
            <div style={styles.stamp}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 }}/>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d" }}>Sent via InvoiceApp</div>
            </div>
          </div>
          <div style={styles.footer}>
            <p>Questions? Reply directly to {freelancer.email}</p>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// ── SEND FUNCTIONS ────────────────────────────────────────────────────────────
export async function sendInvoiceEmail({ invoice, freelancer, appUrl }: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
}) {
  const typeLabel = { standard:"Invoice", proforma:"Proforma Invoice", deposit:"Deposit Invoice", credit:"Credit Note" }[invoice.type] || "Invoice";
  const S = currencySymbol(invoice.currency);

  const { data, error } = await resend.emails.send({
    from: `${freelancer.businessName || freelancer.name} via InvoiceApp <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail!,
    subject: `${typeLabel} ${invoice.id} — ${S}${fmt(invoice.total)} due`,
    react: (
      <InvoiceEmailTemplate
        invoice={invoice}
        freelancer={freelancer}
        appUrl={appUrl}
      />
    ),
  });

  if (error) throw new Error(`Failed to send invoice email: ${error.message}`);
  return data;
}

export async function sendReminderEmail({ invoice, freelancer, appUrl, daysOverdue }: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  daysOverdue: number;
}) {
  const S = currencySymbol(invoice.currency);
  const subject = daysOverdue <= 1
    ? `Reminder: Invoice ${invoice.id} is due today`
    : `Overdue: Invoice ${invoice.id} — ${S}${fmt(invoice.total)} is ${daysOverdue} days past due`;

  const { data, error } = await resend.emails.send({
    from: `${freelancer.businessName || freelancer.name} via InvoiceApp <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail!,
    subject,
    react: (
      <ReminderEmailTemplate
        invoice={invoice}
        freelancer={freelancer}
        appUrl={appUrl}
        daysOverdue={daysOverdue}
      />
    ),
  });

  if (error) throw new Error(`Failed to send reminder email: ${error.message}`);
  return data;
}

export async function sendPaymentConfirmationEmail({ invoice, freelancer, appUrl }: {
  invoice: InvoiceData & { paidDate: string };
  freelancer: FreelancerData;
  appUrl: string;
}) {
  const S = currencySymbol(invoice.currency);

  const { data, error } = await resend.emails.send({
    from: `${freelancer.businessName || freelancer.name} via InvoiceApp <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail!,
    subject: `Payment confirmed — Invoice ${invoice.id}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#14532d">Payment Confirmed</h2>
        <p>Thank you for your payment of <strong>${S}${fmt(invoice.total)}</strong> for invoice ${invoice.id}.</p>
        <p style="color:#888">Paid: ${new Date(invoice.paidDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}</p>
        <p>View your receipt: <a href="${appUrl}/i/${invoice.linkId}" style="color:#16a34a">${appUrl}/i/${invoice.linkId}</a></p>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send confirmation email: ${error.message}`);
  return data;
}

// Export templates for react-email preview
export { InvoiceEmailTemplate, ReminderEmailTemplate };
