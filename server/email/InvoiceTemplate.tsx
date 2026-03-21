import * as React from "react";
import { Html, Head, Body, Container, Text, Preview } from "@react-email/components";
import { styles } from "./styles";
import { currencySymbol, fmt, type InvoiceData, type FreelancerData } from "./types";

const TYPE_LABELS: Record<string, string> = {
  standard: "Invoice",
  proforma: "Proforma Invoice",
  deposit: "Deposit Invoice",
  credit: "Credit Note",
};

export function InvoiceEmailTemplate({ invoice, freelancer, appUrl, previewText }: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  previewText?: string;
}) {
  const S = currencySymbol(invoice.currency);
  const typeLabel = TYPE_LABELS[invoice.type] ?? "Invoice";
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
                <div style={styles.amtSub}>
                  Due by {new Date(invoice.dueDate).toLocaleDateString("en", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
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
                <span style={styles.value}>
                  {new Date(invoice.issueDate).toLocaleDateString("en", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
              {invoice.terms && (
                <div style={styles.row}>
                  <span style={styles.label}>Terms</span>
                  <span style={styles.value}>{invoice.terms}</span>
                </div>
              )}
              <div style={styles.row}>
                <span style={styles.label}>From</span>
                <span style={styles.value}>
                  {freelancer.businessName || freelancer.name}
                  <br />
                  <span style={{ fontSize: 11, color: "#8aab90" }}>{freelancer.email}</span>
                </span>
              </div>

              {/* Line items */}
              <div style={styles.itemsBox}>
                {invoice.items.map((item, i) => (
                  <div
                    key={i}
                    style={{ ...styles.itemRow, borderBottom: i < invoice.items.length - 1 ? "1px dashed #dde8de" : "none" }}
                  >
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
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 }} />
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
