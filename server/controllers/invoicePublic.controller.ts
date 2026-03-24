import type { Context } from "hono";
import { invoicePublicService } from "../services/invoicePublic.service";
import { formatInvoice } from "../lib/invoice.utils";

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
};
