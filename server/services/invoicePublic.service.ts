import { toEmailData } from "../lib/invoice.utils";
import { NotFoundError } from "../lib/errors";
import { eventRepository } from "../repositories/event.repository";
import { invoiceRepository } from "../repositories/invoice.repository";

export const invoicePublicService = {
  async getByLinkId(linkId: string, ip: string, ua: string) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv || inv.status === "cancelled")
      throw new NotFoundError("Invoice not found");

    await eventRepository.create(inv.id, "viewed", { ip, ua }, "client");

    if (inv.status === "sent") {
      await invoiceRepository.update(inv.id, { status: "viewed" });
    }

    // Strip the internal userId before returning to the client
    const { userId: _userId, ...publicInv } = inv;
    return publicInv;
  },

  async confirmPayment(
    linkId: string,
    ip: string | undefined,
    note: string | undefined
  ) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv) throw new NotFoundError();
    await eventRepository.create(
      inv.id,
      "client_confirmed_payment",
      { ip, note },
      "client"
    );
  },

  async trackDownload(linkId: string, ip: string | undefined) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv) throw new NotFoundError();
    await eventRepository.create(inv.id, "downloaded", { ip }, "client");
  },
};
