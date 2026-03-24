import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Link,
  Hr,
  Font,
} from "@react-email/components";
import { styles } from "./styles";
import {
  currencySymbol,
  fmt,
  type InvoiceData,
  type FreelancerData,
} from "./types";

const TYPE_LABELS: Record<string, string> = {
  standard: "Invoice",
  proforma: "Proforma Invoice",
  deposit: "Deposit Invoice",
  credit: "Credit Note",
};

export function InvoiceEmailTemplate({
  invoice,
  freelancer,
  appUrl,
  previewText,
}: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  previewText?: string;
}) {
  const symbol = currencySymbol(invoice.currency);
  const typeLabel = TYPE_LABELS[invoice.type] ?? "Invoice";
  const invoiceUrl = `${appUrl}/i/${invoice.linkId}`;

  return (
    <Html lang="en">
      <Head>
       <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        {/* DM Sans 500 — latin — same file as 400 in DM Sans v17 variable axis */}
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        {/* DM Sans 700 — latin */}
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="DM Mono"
          fallbackFontFamily="monospace"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmmono/v14/aFTU7PB1QTsUX8KYthqQBA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        {/* DM Mono 500 — latin */}
        <Font
          fontFamily="DM Mono"
          fallbackFontFamily="monospace"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmmono/v14/aFTU7PB1QTsUX8KYthSQBLyM.woff2",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        {previewText ||
          `${typeLabel} ${invoice.id} from ${
            freelancer.businessName || freelancer.name
          } — ${symbol}${fmt(invoice.total)} due`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            {/* ── Header ── */}
            <Section style={styles.header}>
              {/* Badge: wrapped in a Row to allow inline-like width control */}
              <Row style={{ marginBottom: 12 }}>
                <Column>
                  <Text style={styles.headerBadge}>
                    {typeLabel.toUpperCase()}
                  </Text>
                </Column>
                {/* Empty column pushes badge left without stretching it */}
                <Column style={{ width: "70%" }} />
              </Row>

              <Heading as="h2" style={styles.headerName}>
                {freelancer.businessName || freelancer.name}
              </Heading>
              <Text style={styles.headerSub}>
                Invoice for {invoice.clientName}
              </Text>
              <Text style={styles.amtLabel}>Amount due</Text>
              <Heading as="h1" style={styles.amtBig}>
                {symbol}
                {fmt(invoice.total)}
              </Heading>
              {invoice.dueDate && (
                <Text style={styles.amtSub}>
                  Due by{" "}
                  {new Date(invoice.dueDate).toLocaleDateString("en", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              )}
            </Section>

            {/* ── Meta rows ── */}
            <Section style={styles.body_pad}>
              <Row style={styles.row}>
                <Column style={styles.labelCol}>
                  <Text style={styles.label}>Invoice #</Text>
                </Column>
                <Column>
                  <Text
                    style={{
                      ...styles.value,
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                    }}
                  >
                    {invoice.id}
                  </Text>
                </Column>
              </Row>

              <Row style={styles.row}>
                <Column style={styles.labelCol}>
                  <Text style={styles.label}>Date</Text>
                </Column>
                <Column>
                  <Text style={styles.value}>
                    {new Date(invoice.issueDate).toLocaleDateString("en", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </Column>
              </Row>

              {invoice.terms && (
                <Row style={styles.row}>
                  <Column style={styles.labelCol}>
                    <Text style={styles.label}>Terms</Text>
                  </Column>
                  <Column>
                    <Text style={styles.value}>{invoice.terms}</Text>
                  </Column>
                </Row>
              )}

              <Row style={{ ...styles.row, borderBottom: "none" }}>
                <Column style={styles.labelCol}>
                  <Text style={styles.label}>From</Text>
                </Column>
                <Column>
                  <Text style={{ ...styles.value, marginBottom: 0 }}>
                    {freelancer.businessName || freelancer.name}
                  </Text>
                  <Text
                    style={{
                      ...styles.value,
                      fontSize: 11,
                      color: "#8aab90",
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {freelancer.email}
                  </Text>
                </Column>
              </Row>

              {/* ── Line items ── */}
              <Section style={styles.itemsBox}>
                {invoice.items.map((item, i) => (
                  <React.Fragment key={i}>
                    <Row style={styles.itemRow}>
                      <Column>
                        <Text
                          style={{ margin: 0, fontSize: 12, color: "#4a6350" }}
                        >
                          {item.desc}
                          {item.qty > 1 ? ` x${item.qty}` : ""}
                        </Text>
                      </Column>
                      <Column style={{ width: 90 }}>
                        <Text
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontFamily: "'DM Mono', 'Courier New', monospace",
                            fontWeight: 600,
                            textAlign: "right",
                            color: "#111d13",
                          }}
                        >
                          {symbol}
                          {fmt(item.price * item.qty)}
                        </Text>
                      </Column>
                    </Row>
                    {i < invoice.items.length - 1 && (
                      <Hr
                        style={{
                          borderColor: "#dde8de",
                          borderStyle: "dashed",
                          margin: "0",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}

                {invoice.taxAmount != null && invoice.taxAmount > 0 && (
                  <Row style={styles.itemRow}>
                    <Column>
                      <Text
                        style={{ margin: 0, fontSize: 12, color: "#8aab90" }}
                      >
                        {invoice.taxType?.toUpperCase()} ({invoice.taxRate}%)
                      </Text>
                    </Column>
                    <Column style={{ width: 90 }}>
                      <Text
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontFamily: "'DM Mono', 'Courier New', monospace",
                          color: "#8aab90",
                          textAlign: "right",
                        }}
                      >
                        {symbol}
                        {fmt(invoice.taxAmount)}
                      </Text>
                    </Column>
                  </Row>
                )}

                <Row style={styles.totalRow}>
                  <Column>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#111d13",
                      }}
                    >
                      {invoice.type === "deposit"
                        ? `Deposit (${invoice.deposit}%)`
                        : "Total"}
                    </Text>
                  </Column>
                  <Column style={{ width: 90 }}>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontFamily: "'DM Mono', 'Courier New', monospace",
                        fontWeight: 700,
                        textAlign: "right",
                        color: "#111d13",
                      }}
                    >
                      {symbol}
                      {fmt(invoice.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {invoice.notes && (
                <Section style={styles.notesBox}>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </Section>
              )}

              {/* ── CTA ── */}
              <Section style={{ textAlign: "center", paddingBottom: 8 }}>
                <Button href={invoiceUrl} style={styles.cta}>
                  View Invoice
                </Button>
              </Section>

              <Section style={{ textAlign: "center" }}>
                <Text style={{ fontSize: 11, color: "#8aab90", margin: 0 }}>
                  Or copy this link:{" "}
                  <Link href={invoiceUrl} style={{ color: "#16a34a" }}>
                    {invoiceUrl}
                  </Link>
                </Text>
              </Section>
            </Section>

            {/* ── Stamp ── */}
            <Section style={styles.stamp}>
              <Row>
                <Column style={{ width: 18 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#16a34a",
                    }}
                  />
                </Column>
                <Column>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#14532d",
                      margin: 0,
                    }}
                  >
                    Created with Invoicin
                  </Text>
                </Column>
                <Column style={{ width: 120 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#8aab90",
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                      textAlign: "right",
                      margin: 0,
                    }}
                  >
                    {invoice.id}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={{ margin: "4px 0", fontSize: 11, color: "#8aab90" }}>
              You received this because {freelancer.name} sent you an invoice
              via Invoicin.
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 11, color: "#8aab90" }}>
              Questions? Reply directly to {freelancer.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
