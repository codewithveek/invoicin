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
  Font,
} from "@react-email/components";
import { styles } from "./styles";
import {
  currencySymbol,
  fmt,
  type InvoiceData,
  type FreelancerData,
} from "./types";

export function ReminderEmailTemplate({
  invoice,
  freelancer,
  appUrl,
  daysOverdue,
}: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
  daysOverdue: number;
}) {
  const symbol = currencySymbol(invoice.currency);
  const invoiceUrl = `${appUrl}/i/${invoice.linkId}`;
  const isFirstReminder = daysOverdue <= 1;

  const headerBg = isFirstReminder ? "#14532d" : "#7c2d12";
  const ctaBg = isFirstReminder ? "#16a34a" : "#dc2626";
  const dotBg = isFirstReminder ? "#16a34a" : "#dc2626";

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
        {/* DM Mono 400 — latin — verified from Google Fonts CSS API */}
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
        {isFirstReminder
          ? `Friendly reminder: Invoice ${invoice.id} was due today`
          : `Overdue: Invoice ${invoice.id} is ${daysOverdue} days past due`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            {/* ── Header ── */}
            <Section style={{ ...styles.header, backgroundColor: headerBg }}>
              <Row style={{ marginBottom: 12 }}>
                <Column>
                  <Text style={styles.headerBadge}>
                    {isFirstReminder
                      ? "PAYMENT REMINDER"
                      : `${daysOverdue} DAYS OVERDUE`}
                  </Text>
                </Column>
                <Column style={{ width: "60%" }} />
              </Row>

              <Heading as="h2" style={styles.headerName}>
                {isFirstReminder
                  ? "Just a friendly reminder"
                  : "Payment is overdue"}
              </Heading>
              <Text style={styles.headerSub}>
                Invoice {invoice.id} from{" "}
                {freelancer.businessName || freelancer.name}
              </Text>
              <Text style={styles.amtLabel}>Amount due</Text>
              <Heading as="h1" style={styles.amtBig}>
                {symbol}
                {fmt(invoice.total)}
              </Heading>
            </Section>

            {/* ── Body ── */}
            <Section style={styles.body_pad}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#4a6350",
                  lineHeight: "1.7",
                  marginTop: 0,
                }}
              >
                Hi {invoice.clientName},{" "}
                {isFirstReminder
                  ? `This is a friendly reminder that invoice ${
                      invoice.id
                    } for ${symbol}${fmt(invoice.total)} is due today.`
                  : `Invoice ${invoice.id} for ${symbol}${fmt(
                      invoice.total
                    )} is now ${daysOverdue} days past its due date.`}{" "}
                If you have already made the payment, please disregard this
                message.
              </Text>

              <Section
                style={{ textAlign: "center", paddingTop: 8, paddingBottom: 8 }}
              >
                <Button
                  href={invoiceUrl}
                  style={{ ...styles.cta, backgroundColor: ctaBg }}
                >
                  View &amp; Pay Invoice
                </Button>
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
                      backgroundColor: dotBg,
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
                    Sent via Invoicin
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={{ margin: "4px 0", fontSize: 11, color: "#8aab90" }}>
              Questions? Reply directly to {freelancer.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
