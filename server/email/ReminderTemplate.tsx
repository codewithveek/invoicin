import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
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
  const S = currencySymbol(invoice.currency);
  const invoiceUrl = `${appUrl}/i/${invoice.linkId}`;
  const isFirstReminder = daysOverdue <= 1;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isFirstReminder
          ? `Friendly reminder: Invoice ${invoice.id} was due today`
          : `Overdue: Invoice ${invoice.id} is ${daysOverdue} days past due`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <div style={styles.card}>
            <div
              style={{
                ...styles.header,
                background: isFirstReminder
                  ? "linear-gradient(155deg, #14532d 0%, #16a34a 100%)"
                  : "linear-gradient(155deg, #7c2d12 0%, #dc2626 100%)",
              }}
            >
              <div style={styles.headerBadge}>
                {isFirstReminder
                  ? "PAYMENT REMINDER"
                  : `${daysOverdue} DAYS OVERDUE`}
              </div>
              <div style={styles.headerName}>
                {isFirstReminder
                  ? "Just a friendly reminder"
                  : "Payment is overdue"}
              </div>
              <div style={styles.headerSub}>
                Invoice {invoice.id} from{" "}
                {freelancer.businessName || freelancer.name}
              </div>
              <div style={styles.amtLabel}>Amount due</div>
              <div style={styles.amtBig}>
                {S}
                {fmt(invoice.total)}
              </div>
            </div>

            <div style={styles.body_pad}>
              <Text style={{ fontSize: 14, color: "#4a6350", lineHeight: 1.7 }}>
                Hi {invoice.clientName},{" "}
                {isFirstReminder
                  ? `This is a friendly reminder that invoice ${invoice.id} for ${S}${fmt(invoice.total)} is due today.`
                  : `Invoice ${invoice.id} for ${S}${fmt(invoice.total)} is now ${daysOverdue} days past its due date.`}{" "}
                If you have already made the payment, please disregard this
                message.
              </Text>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <a
                  href={invoiceUrl}
                  style={{
                    ...styles.cta,
                    backgroundColor: isFirstReminder ? "#16a34a" : "#dc2626",
                  }}
                >
                  View &amp; Pay Invoice
                </a>
              </div>
            </div>

            <div style={styles.stamp}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#16a34a",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d" }}>
                Sent via InvoiceApp
              </div>
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
