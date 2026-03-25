import type { Context } from "hono";
import { invoicePublicService } from "../services/invoicePublic.service";
import { formatInvoice } from "../lib/invoice.utils";
import { generateInvoicePDF } from "../pdf";
import { userRepository } from "../repositories/user.repository";

/**
 * Extract client IP from x-forwarded-for.
 * Takes the first entry (the original client address).
 * Truncates to 45 chars (max IPv6 length) to prevent oversized storage.
 */
function extractIp(header: string | undefined): string {
  if (!header) return "unknown";
  return header.split(",")[0]?.trim().slice(0, 45) ?? "unknown";
}

export const invoicePublicController = {
  async view(c: Context) {
    const ip = extractIp(c.req.header("x-forwarded-for"));
    const ua = (c.req.header("user-agent") ?? "unknown").slice(0, 100);
    const inv = await invoicePublicService.getByLinkId(
      c.req.param("linkId") as string,
      ip,
      ua
    );
    return c.json(formatInvoice(inv as unknown as Record<string, unknown>));
  },

  async confirmPayment(c: Context) {
    const body = await c.req
      .json<{ note?: string }>()
      .catch(() => ({} as { note?: string }));
    await invoicePublicService.confirmPayment(
      c.req.param("linkId") as string,
      extractIp(c.req.header("x-forwarded-for")),
      body.note
    );
    return c.json({ success: true });
  },

  async trackDownload(c: Context) {
    await invoicePublicService.trackDownload(
      c.req.param("linkId") as string,
      extractIp(c.req.header("x-forwarded-for"))
    );
    return c.json({ success: true });
  },

  async downloadPdf(c: Context) {
    const ip = extractIp(c.req.header("x-forwarded-for"));
    const inv = await invoicePublicService.downloadPdf(
      c.req.param("linkId") as string,
      ip
    );
    const user = await userRepository.findById(inv.userId);
    const buffer = await generateInvoicePDF({
      invoice: {
        id: inv.id,
        type: inv.type as string,
        currency: inv.currency,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail ?? undefined,
        clientAddress: inv.clientAddress ?? undefined,
        items: inv.items as { desc: string; qty: number; price: number }[],
        taxType: inv.taxType ?? undefined,
        taxRate: inv.taxRate != null ? Number(inv.taxRate) : undefined,
        taxAmount: inv.taxAmount != null ? Number(inv.taxAmount) : undefined,
        deposit: inv.deposit != null ? Number(inv.deposit) : undefined,
        total: Number(inv.total),
        dueDate: inv.dueDate
          ? new Date(inv.dueDate).toISOString().split("T")[0]
          : undefined,
        terms: inv.terms ?? undefined,
        notes: inv.notes ?? undefined,
        issueDate: new Date(inv.issueDate).toISOString().split("T")[0],
        status: inv.status as string,
      },
      freelancer: {
        name: user?.name ?? "",
        businessName: user?.businessName ?? undefined,
        email: user?.email ?? "",
        address: user?.address ?? undefined,
      },
    });
    c.header("Content-Type", "application/pdf");
    c.header(
      "Content-Disposition",
      `attachment; filename="invoice-${inv.id}.pdf"`
    );
    return c.body(new Uint8Array(buffer));
  },
};
