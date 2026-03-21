// ─────────────────────────────────────────────────────────────────────────────
// PDF generation entry point
// Usage:
//   import { generateInvoicePDF } from "./pdf";
//   const buffer = await generateInvoicePDF({ invoice, freelancer });
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./component";
import type { PDFInvoice, PDFFreelancer } from "./types";

export type { PDFInvoice, PDFFreelancer } from "./types";
export { InvoicePDF } from "./component";

export async function generateInvoicePDF(params: {
  invoice: PDFInvoice;
  freelancer: PDFFreelancer;
}): Promise<Buffer> {
  const blob = await pdf(<InvoicePDF {...params} />).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
