import { toEmailData } from "../lib/invoice.utils";
import { NotFoundError } from "../lib/errors";
import { eventRepository } from "../repositories/event.repository";
import { invoiceRepository } from "../repositories/invoice.repository";
import { userRepository } from "../repositories/user.repository";

export const invoicePublicService = {
  async getByLinkId(linkId: string, ip: string, ua: string) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv || inv.status === "cancelled")
      throw new NotFoundError("Invoice not found");

    await eventRepository.create(inv.id, "viewed", { ip, ua }, "client");

    if (inv.status === "sent") {
      await invoiceRepository.update(inv.id, { status: "viewed" });
    }

    // Return only fields safe for public view — strip all internal/financial data
    const {
      userId: _userId,
      homeRate: _homeRate,
      homeTotal: _homeTotal,
      homeCurrency: _homeCurrency,
      clientId: _clientId,
      remindersSent: _remindersSent,
      lastReminderAt: _lastReminderAt,
      amountPaid: _amountPaid,
      ...publicInv
    } = inv;

    // Include freelancer display name so client can see who sent the invoice
    const user = await userRepository.findById(inv.userId);
    const freelancerName = user?.businessName || user?.name || "";

    // Also omit events — they contain internal IP/UA audit trails
    return { ...publicInv, events: [], freelancerName };
  },

  async confirmPayment(linkId: string, ip: string, note: string | undefined) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv) throw new NotFoundError();
    // Only record confirmation for invoices in a confirmable state
    if (!["sent", "viewed", "overdue"].includes(inv.status ?? "")) return;
    await eventRepository.create(
      inv.id,
      "client_confirmed_payment",
      { ip, note: note?.slice(0, 500) },
      "client"
    );
  },

  async trackDownload(linkId: string, ip: string) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv) throw new NotFoundError();
    await eventRepository.create(inv.id, "downloaded", { ip }, "client");
  },

  async downloadPdf(linkId: string, ip: string) {
    const inv = await invoiceRepository.findByLinkId(linkId);
    if (!inv || inv.status === "cancelled") throw new NotFoundError("Invoice not found");
    await eventRepository.create(inv.id, "downloaded", { ip }, "client");
    return inv;
  },
};
