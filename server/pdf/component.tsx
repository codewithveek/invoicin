// ─────────────────────────────────────────────────────────────────────────────
// InvoicePDF — React PDF component
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Svg,
  Path,
  Rect,
  Circle,
  G,
} from "@react-pdf/renderer";
import { COLORS, styles } from "./styles";
import type { PDFInvoice, PDFFreelancer } from "./types";

// Register custom fonts here if needed, e.g.:
// Font.register({ family: "DM Sans", src: "https://..." });

const csym = (c: string): string =>
  ({
    USD: "$",
    GBP: "\u00a3",
    EUR: "\u20ac",
    CAD: "C$",
    AUD: "A$",
    NGN: "\u20a6",
  }[c] ?? "$");

const fmt = (n: number): string =>
  n.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MOCK_RATES: Record<string, number> = {
  USD: 1618.5,
  GBP: 2039.2,
  EUR: 1746.8,
  CAD: 1191.4,
  AUD: 1043.7,
  NGN: 1,
};

const TYPE_LABELS: Record<string, string> = {
  standard: "INVOICE",
  proforma: "PROFORMA INVOICE",
  deposit: "DEPOSIT INVOICE",
  credit: "CREDIT NOTE",
};

export function InvoicePDF({
  invoice,
  freelancer,
}: {
  invoice: PDFInvoice;
  freelancer: PDFFreelancer;
}) {
  const S = csym(invoice.currency);
  const typeLabel = TYPE_LABELS[invoice.type] ?? "INVOICE";
  const ngnEstimate =
    invoice.currency !== "NGN"
      ? invoice.total * (MOCK_RATES[invoice.currency] ?? 1618.5)
      : null;
  const isOverdue = invoice.status === "overdue";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeTxt}>{typeLabel}</Text>
          </View>
          <Text style={styles.headerName}>
            {freelancer.businessName ?? freelancer.name}
          </Text>
          <Text style={styles.headerSub}>Invoice for {invoice.clientName}</Text>
          <View style={styles.divider} />
          <Text style={styles.amtLabel}>Amount Due</Text>
          <Text style={styles.amtBig}>
            {S}
            {fmt(invoice.total)}
          </Text>
          {ngnEstimate !== null && (
            <Text style={styles.amtNgn}>
              {"\u20a6"}
              {ngnEstimate.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}{" "}
              NGN est.
            </Text>
          )}
        </View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          {isOverdue && (
            <View style={styles.overdueBox}>
              <Text style={styles.overdueText}>OVERDUE</Text>
              {invoice.dueDate && (
                <Text
                  style={{
                    ...styles.overdueText,
                    fontFamily: "Helvetica",
                    marginLeft: 4,
                  }}
                >
                  {" — was due "}
                  {new Date(invoice.dueDate).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              )}
            </View>
          )}

          {/* Meta rows */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Invoice #</Text>
            <Text style={{ ...styles.rowValue, fontFamily: "Courier-Bold" }}>
              {invoice.id}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValue}>
              {new Date(invoice.issueDate).toLocaleDateString("en", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Due date</Text>
              <Text
                style={{
                  ...styles.rowValue,
                  color: isOverdue ? COLORS.red : COLORS.text,
                }}
              >
                {new Date(invoice.dueDate).toLocaleDateString("en", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          {invoice.terms && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Terms</Text>
              <Text style={styles.rowValue}>{invoice.terms}</Text>
            </View>
          )}

          {/* Parties */}
          <View style={{ ...styles.twoCol, marginTop: 12 }}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>From</Text>
              <Text style={styles.colValue}>
                {freelancer.businessName ?? freelancer.name}
              </Text>
              <Text style={styles.colSub}>{freelancer.email}</Text>
              {freelancer.address && (
                <Text style={styles.colSub}>{freelancer.address}</Text>
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Bill To</Text>
              <Text style={styles.colValue}>{invoice.clientName}</Text>
              {invoice.clientEmail && (
                <Text style={styles.colSub}>{invoice.clientEmail}</Text>
              )}
              {invoice.clientAddress && (
                <Text style={styles.colSub}>{invoice.clientAddress}</Text>
              )}
            </View>
          </View>

          {/* Line items */}
          <View style={styles.itemsBox}>
            {invoice.items.map((item, i) => (
              <View
                key={i}
                style={{
                  ...styles.itemRow,
                  borderBottomWidth: i < invoice.items.length - 1 ? 0.5 : 0,
                }}
              >
                <Text style={styles.itemName}>
                  {item.desc}
                  {item.qty > 1 ? ` x${item.qty}` : ""}
                </Text>
                <Text style={styles.itemAmt}>
                  {S}
                  {fmt(item.price * item.qty)}
                </Text>
              </View>
            ))}

            {invoice.taxAmount != null && invoice.taxAmount > 0 && (
              <View style={{ ...styles.itemRow, borderBottomWidth: 0 }}>
                <Text style={{ ...styles.itemName, color: COLORS.text3 }}>
                  {invoice.taxType?.toUpperCase()} ({invoice.taxRate}%)
                </Text>
                <Text style={{ ...styles.itemAmt, color: COLORS.text3 }}>
                  {S}
                  {fmt(invoice.taxAmount)}
                </Text>
              </View>
            )}

            {invoice.deposit != null && invoice.deposit > 0 && (
              <View style={{ ...styles.itemRow, borderBottomWidth: 0 }}>
                <Text style={{ ...styles.itemName, color: "#7c3aed" }}>
                  Deposit ({invoice.deposit}%)
                </Text>
                <Text style={{ ...styles.itemAmt, color: "#7c3aed" }}>
                  {S}
                  {fmt(invoice.total)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {invoice.type === "deposit" ? "Deposit Due" : "Total"}
              </Text>
              <Text style={styles.totalAmt}>
                {invoice.type === "credit" ? "-" : ""}
                {S}
                {fmt(invoice.total)}
              </Text>
            </View>
          </View>

          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTxt}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        {/* ── Stamp ──────────────────────────────────────────────────────── */}
        <View style={styles.stamp}>
          <View style={styles.stampDot} />
          <Text style={styles.stampTxt}>Created with Invoicin</Text>
          <Text style={styles.stampId}>{invoice.id}</Text>
        </View>
      </Page>
    </Document>
  );
}
