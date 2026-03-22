import type { Context } from "hono";
import { invoicePublicService } from "../services/invoicePublic.service";

export const invoicePublicController = {
  async view(c: Context) {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    const ua = (c.req.header("user-agent") ?? "unknown").slice(0, 100);
    const inv = await invoicePublicService.getByLinkId(
      c.req.param("linkId") as string,
      ip,
      ua
    );
    return c.json(inv);
  },

  async confirmPayment(c: Context) {
    const body = await c.req
      .json<{ note?: string }>()
      .catch(() => ({}) as { note?: string });
    await invoicePublicService.confirmPayment(
      c.req.param("linkId") as string,
      c.req.header("x-forwarded-for"),
      body.note
    );
    return c.json({ success: true });
  },

  async trackDownload(c: Context) {
    await invoicePublicService.trackDownload(
      c.req.param("linkId") as string,
      c.req.header("x-forwarded-for")
    );
    return c.json({ success: true });
  },
};
