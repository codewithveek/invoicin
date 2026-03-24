import * as React from "react";
import { Resend } from "resend";
import {
  currencySymbol,
  fmt,
  type InvoiceData,
  type FreelancerData,
} from "./types";
import { InvoiceEmailTemplate } from "./InvoiceTemplate";
import { ReminderEmailTemplate } from "./ReminderTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "invoices@invoicin.pro";

const TYPE_LABELS: Record<string, string> = {
  standard: "Invoice",
  proforma: "Proforma Invoice",
  deposit: "Deposit Invoice",
  credit: "Credit Note",
};

export async function sendInvoiceEmail({
  invoice,
  freelancer,
  appUrl,
}: {
  invoice: InvoiceData;
  freelancer: FreelancerData;
  appUrl: string;
}) {
  const typeLabel = TYPE_LABELS[invoice.type] ?? "Invoice";
  const S = currencySymbol(invoice.currency);

  const { data, error } = await resend.emails.send({
    from: `${
      freelancer.businessName || freelancer.name
    } via Invoicin <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail,
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

export async function sendReminderEmail({
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
  const subject =
    daysOverdue <= 1
      ? `Reminder: Invoice ${invoice.id} is due today`
      : `Overdue: Invoice ${invoice.id} — ${S}${fmt(
          invoice.total
        )} is ${daysOverdue} days past due`;

  const { data, error } = await resend.emails.send({
    from: `${
      freelancer.businessName || freelancer.name
    } via Invoicin <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail,
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

export async function sendPaymentConfirmationEmail({
  invoice,
  freelancer,
  appUrl,
}: {
  invoice: InvoiceData & { paidDate: string };
  freelancer: FreelancerData;
  appUrl: string;
}) {
  const S = currencySymbol(invoice.currency);

  const { data, error } = await resend.emails.send({
    from: `${
      freelancer.businessName || freelancer.name
    } via Invoicin <${FROM}>`,
    replyTo: freelancer.email,
    to: invoice.clientEmail,
    subject: `Payment confirmed — Invoice ${invoice.id}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#14532d">Payment Confirmed</h2>
        <p>Thank you for your payment of <strong>${S}${fmt(
      invoice.total
    )}</strong> for invoice ${invoice.id}.</p>
        <p style="color:#888">Paid: ${new Date(
          invoice.paidDate
        ).toLocaleDateString("en", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}</p>
        <p>View your receipt: <a href="${appUrl}/i/${
      invoice.linkId
    }" style="color:#16a34a">${appUrl}/i/${invoice.linkId}</a></p>
      </div>
    `,
  });

  if (error)
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  return data;
}

// Re-exports for react-email preview and external use
export { InvoiceEmailTemplate } from "./InvoiceTemplate";
export { ReminderEmailTemplate } from "./ReminderTemplate";
export type { InvoiceData, FreelancerData, InvoiceItem } from "./types";
