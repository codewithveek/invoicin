// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — PDF Generation (React PDF / @react-pdf/renderer)
//
// Install:
//   npm install @react-pdf/renderer
//
// Usage (server-side):
//   import { generateInvoicePDF } from "./invoiceapp-pdf";
//   const pdfBuffer = await generateInvoicePDF({ invoice, freelancer });
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", `attachment; filename="${invoice.id}.pdf"`);
//   res.send(pdfBuffer);
//
// Usage (API route with Hono):
//   invoiceRouter.get("/invoices/:id/pdf", requireAuth, async (c) => {
//     const inv = await getInvoice(id);
//     const pdf = await generateInvoicePDF({ invoice: inv, freelancer });
//     return new Response(pdf, { headers: { "Content-Type":"application/pdf",
//       "Content-Disposition":`attachment; filename="${inv.id}.pdf"` }});
//   });
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font, pdf,
  Svg, Path, Rect, Circle, G,
} from "@react-pdf/renderer";

// Register fonts (optional — falls back to Helvetica)
// Font.register({ family:"DM Sans", src:"https://fonts.gstatic.com/s/dmsans/v6/rP2Hp2ywxg089UriCZOIHQ.woff2" });

const COLORS = {
  green:   "#16a34a", greenDark: "#14532d", greenLight: "#dcfce7",
  text:    "#111d13", text2: "#4a6350",     text3: "#8aab90",
  border:  "#dde8de", surface2: "#f0f4f1",
  white:   "#ffffff", amber: "#d97706",     red: "#dc2626",
};

const styles = StyleSheet.create({
  page:       { fontFamily: "Helvetica", fontSize: 10, backgroundColor: COLORS.white, padding: 0 },
  header:     { backgroundColor: COLORS.greenDark, padding: "28 32 24 32", position: "relative" },
  headerBadge:{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10, alignSelf: "flex-start" },
  badgeTxt:   { color: COLORS.white, fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  headerName: { color: COLORS.white, fontSize: 17, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  headerSub:  { color: "rgba(255,255,255,0.72)", fontSize: 10 },
  divider:    { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 14 },
  amtLabel:   { color: "rgba(255,255,255,0.6)", fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  amtBig:     { color: COLORS.white, fontSize: 30, fontFamily: "Helvetica-Bold" },
  amtNgn:     { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Courier", marginTop: 3 },
  body:       { padding: "20 32 28 32" },
  row:        { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomColor: COLORS.border, borderBottomWidth: 0.5 },
  rowLabel:   { color: COLORS.text3, fontSize: 9 },
  rowValue:   { color: COLORS.text, fontSize: 9, fontFamily: "Helvetica-Bold", maxWidth: "55%", textAlign: "right" },
  itemsBox:   { backgroundColor: COLORS.surface2, borderRadius: 6, padding: 10, marginVertical: 10 },
  itemRow:    { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomColor: COLORS.border, borderBottomWidth: 0.5 },
  itemName:   { color: COLORS.text2, fontSize: 9, flex: 1 },
  itemAmt:    { color: COLORS.text, fontSize: 9, fontFamily: "Courier-Bold", textAlign: "right" },
  totalRow:   { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 6, borderTopColor: COLORS.border, borderTopWidth: 1.5 },
  totalLabel: { color: COLORS.text, fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalAmt:   { color: COLORS.text, fontSize: 11, fontFamily: "Courier-Bold" },
  notes:      { backgroundColor: COLORS.surface2, borderRadius: 6, padding: 10, marginTop: 8 },
  notesTxt:   { color: COLORS.text2, fontSize: 9, lineHeight: 1.5 },
  stamp:      { flexDirection: "row", alignItems: "center", padding: "10 20", backgroundColor: COLORS.surface2, borderTopColor: COLORS.greenLight, borderTopWidth: 1.5, marginTop: "auto" },
  stampDot:   { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.green, marginRight: 8 },
  stampTxt:   { color: COLORS.greenDark, fontSize: 9, fontFamily: "Helvetica-Bold" },
  stampId:    { color: COLORS.text3, fontSize: 8, fontFamily: "Courier", marginLeft: "auto" },
  twoCol:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  col:        { flex: 1 },
  colLabel:   { color: COLORS.text3, fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  colValue:   { color: COLORS.text, fontSize: 10, fontFamily: "Helvetica-Bold" },
  colSub:     { color: COLORS.text3, fontSize: 8, marginTop: 1 },
  overdueBox: { backgroundColor: "#fee2e2", borderRadius: 6, padding: "6 10", marginBottom: 8, flexDirection: "row", alignItems: "center" },
  overdueText:{ color: COLORS.red, fontSize: 9, fontFamily: "Helvetica-Bold" },
});

interface InvoiceItem { desc: string; qty: number; price: number; }
interface PDFInvoice {
  id: string; type: string; currency: string;
  clientName: string; clientEmail?: string; clientAddress?: string;
  items: InvoiceItem[]; taxType?: string; taxRate?: number; taxAmount?: number;
  deposit?: number; total: number; dueDate?: string; terms?: string; notes?: string;
  issueDate: string; status?: string;
}
interface PDFFreelancer { name: string; businessName?: string; email: string; address?: string; }

const csym = (c: string) => ({ USD:"$", GBP:"\u00a3", EUR:"\u20ac", CAD:"C$", AUD:"A$", NGN:"\u20a6" }[c] || "$");
const fmt  = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MOCK_RATES: Record<string, number> = { USD:1618.5, GBP:2039.2, EUR:1746.8, CAD:1191.4, AUD:1043.7, NGN:1 };

function InvoicePDF({ invoice, freelancer }: { invoice: PDFInvoice; freelancer: PDFFreelancer }) {
  const S = csym(invoice.currency);
  const typeLabel = { standard:"INVOICE", proforma:"PROFORMA INVOICE", deposit:"DEPOSIT INVOICE", credit:"CREDIT NOTE" }[invoice.type] || "INVOICE";
  const ngnEstimate = invoice.currency !== "NGN" ? invoice.total * (MOCK_RATES[invoice.currency] || 1618.5) : null;
  const isOverdue = invoice.status === "overdue";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBadge}><Text style={styles.badgeTxt}>{typeLabel}</Text></View>
          <Text style={styles.headerName}>{freelancer.businessName || freelancer.name}</Text>
          <Text style={styles.headerSub}>Invoice for {invoice.clientName}</Text>
          <View style={styles.divider}/>
          <Text style={styles.amtLabel}>Amount Due</Text>
          <Text style={styles.amtBig}>{S}{fmt(invoice.total)}</Text>
          {ngnEstimate && <Text style={styles.amtNgn}>{"\u20a6"}{ngnEstimate.toLocaleString("en-NG", { minimumFractionDigits: 2 })} NGN est.</Text>}
        </View>

        <View style={styles.body}>
          {isOverdue && (
            <View style={styles.overdueBox}>
              <Text style={styles.overdueText}>OVERDUE</Text>
              {invoice.dueDate && <Text style={{ ...styles.overdueText, fontFamily:"Helvetica", marginLeft: 4 }}>
                — was due {new Date(invoice.dueDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}
              </Text>}
            </View>
          )}

          {/* Meta rows */}
          <View style={styles.row}><Text style={styles.rowLabel}>Invoice #</Text><Text style={{ ...styles.rowValue, fontFamily: "Courier-Bold" }}>{invoice.id}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Date</Text><Text style={styles.rowValue}>{new Date(invoice.issueDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}</Text></View>
          {invoice.dueDate && <View style={styles.row}><Text style={styles.rowLabel}>Due date</Text><Text style={{ ...styles.rowValue, color: isOverdue ? COLORS.red : COLORS.text }}>{new Date(invoice.dueDate).toLocaleDateString("en", { day:"2-digit", month:"long", year:"numeric" })}</Text></View>}
          {invoice.terms && <View style={styles.row}><Text style={styles.rowLabel}>Terms</Text><Text style={styles.rowValue}>{invoice.terms}</Text></View>}

          {/* Parties */}
          <View style={{ ...styles.twoCol, marginTop: 12 }}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>From</Text>
              <Text style={styles.colValue}>{freelancer.businessName || freelancer.name}</Text>
              <Text style={styles.colSub}>{freelancer.email}</Text>
              {freelancer.address && <Text style={styles.colSub}>{freelancer.address}</Text>}
            </View>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Bill To</Text>
              <Text style={styles.colValue}>{invoice.clientName}</Text>
              {invoice.clientEmail && <Text style={styles.colSub}>{invoice.clientEmail}</Text>}
              {invoice.clientAddress && <Text style={styles.colSub}>{invoice.clientAddress}</Text>}
            </View>
          </View>

          {/* Line items */}
          <View style={styles.itemsBox}>
            {invoice.items.map((item, i) => (
              <View key={i} style={{ ...styles.itemRow, borderBottomWidth: i < invoice.items.length - 1 ? 0.5 : 0 }}>
                <Text style={styles.itemName}>{item.desc}{item.qty > 1 ? ` x${item.qty}` : ""}</Text>
                <Text style={styles.itemAmt}>{S}{fmt(item.price * item.qty)}</Text>
              </View>
            ))}
            {invoice.taxAmount != null && invoice.taxAmount > 0 && (
              <View style={{ ...styles.itemRow, borderBottomWidth: 0 }}>
                <Text style={{ ...styles.itemName, color: COLORS.text3 }}>{invoice.taxType?.toUpperCase()} ({invoice.taxRate}%)</Text>
                <Text style={{ ...styles.itemAmt, color: COLORS.text3 }}>{S}{fmt(invoice.taxAmount)}</Text>
              </View>
            )}
            {invoice.deposit && invoice.deposit > 0 && (
              <View style={{ ...styles.itemRow, borderBottomWidth: 0 }}>
                <Text style={{ ...styles.itemName, color: "#7c3aed" }}>Deposit ({invoice.deposit}%)</Text>
                <Text style={{ ...styles.itemAmt, color: "#7c3aed" }}>{S}{fmt(invoice.total)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{invoice.type === "deposit" ? `Deposit Due` : "Total"}</Text>
              <Text style={styles.totalAmt}>{invoice.type === "credit" ? "-" : ""}{S}{fmt(invoice.total)}</Text>
            </View>
          </View>

          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTxt}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        {/* Stamp */}
        <View style={styles.stamp}>
          <View style={styles.stampDot}/>
          <Text style={styles.stampTxt}>Created with InvoiceApp</Text>
          <Text style={styles.stampId}>{invoice.id}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(params: { invoice: PDFInvoice; freelancer: PDFFreelancer }): Promise<Buffer> {
  const blob = await pdf(<InvoicePDF {...params}/>).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export { InvoicePDF };
