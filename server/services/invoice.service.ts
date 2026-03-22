import { ulid } from "ulid";
import { APP_URL } from "../config";
import { sendInvoiceEmail, sendReminderEmail } from "../email";
import { toEmailData } from "../lib/invoice.utils";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { generateInvoiceId } from "../helpers";
import { eventRepository } from "../repositories/event.repository";
import {
  invoiceRepository,
  type InvoiceStatus,
} from "../repositories/invoice.repository";
import { userRepository } from "../repositories/user.repository";

export type { InvoiceStatus };

export interface CreateInvoiceInput {
  type: "standard" | "proforma" | "deposit" | "credit";
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  currency: string;
  items: { desc: string; qty: number; price: number }[];
  taxType?: "vat" | "wht" | "custom";
  taxRate?: number;
  taxAmount?: number;
  deposit?: number;
  total: number;
  dueDate?: Date;
  terms?: string;
  notes?: string;
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  paidDate?: Date;
  notes?: string;
  dueDate?: Date;
  /** Exchange rate used when marking as paid (invoice currency → home currency) */
  homeRate?: number;
  /** Freelancer home currency code at time of payment, e.g. "NGN" */
  homeCurrency?: string;
}

export interface RecordPaymentInput {
  amount: number;
  currency: string;
  note?: string;
  paidDate: string;
}

export const invoiceService = {
  async list(userId: string, status?: InvoiceStatus) {
    return invoiceRepository.findAllByUser(userId, status);
  },

  async get(id: string, userId: string) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();
    const events = await invoiceRepository.findEvents(id);
    return { ...inv, events };
  },

  async create(userId: string, input: CreateInvoiceInput) {
    const subtotal = input.items.reduce((s, i) => s + i.price * i.qty, 0);
    const inv = {
      id: generateInvoiceId(),
      linkId: ulid().toLowerCase().slice(0, 16),
      userId,
      clientId: input.clientId ?? null,
      type: input.type,
      status: "draft" as const,
      clientName: input.clientName,
      clientEmail: input.clientEmail ?? null,
      clientAddress: input.clientAddress ?? null,
      currency: input.currency,
      subtotal: String(subtotal),
      taxType: input.taxType ?? null,
      taxRate: input.taxRate != null ? String(input.taxRate) : null,
      taxAmount: input.taxAmount != null ? String(input.taxAmount) : "0",
      deposit: input.deposit != null ? String(input.deposit) : "0",
      total: String(input.total),
      homeRate: null,
      homeTotal: null,
      homeCurrency: null,
      items: input.items,
      dueDate: input.dueDate ?? null,
      terms: input.terms ?? null,
      notes: input.notes ?? null,
      issueDate: new Date(new Date().toISOString().split("T")[0]),
    };
    await invoiceRepository.create(inv);
    await eventRepository.create(inv.id, "created");
    return inv;
  },

  async update(id: string, userId: string, input: UpdateInvoiceInput) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();

    const { homeRate, homeCurrency, ...baseInput } = input;
    const repoData: Parameters<typeof invoiceRepository.update>[1] = {
      ...baseInput,
    };

    if (input.status === "paid" && homeRate != null && homeCurrency) {
      const total = parseFloat(String(inv.total));
      repoData.homeRate = String(homeRate);
      repoData.homeTotal = String(Math.round(total * homeRate));
      repoData.homeCurrency = homeCurrency;
    }

    await invoiceRepository.update(id, repoData);
    if (input.status && input.status !== inv.status) {
      await eventRepository.create(
        id,
        input.status === "paid" ? "paid" : "status_changed",
        { from: inv.status, to: input.status }
      );
    }
  },

  async send(id: string, userId: string) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv || !inv.clientEmail)
      throw new BadRequestError("Invoice not found or missing client email");

    const freelancer = await userRepository.findById(userId);
    if (!freelancer) throw new NotFoundError("User not found");

    await sendInvoiceEmail({
      invoice: toEmailData(inv),
      freelancer: {
        name: freelancer.name,
        businessName: freelancer.businessName ?? undefined,
        email: freelancer.email,
      },
      appUrl: APP_URL,
    });

    await invoiceRepository.update(id, { status: "sent" });
    await eventRepository.create(id, "sent", { to: inv.clientEmail });
  },

  async remind(id: string, userId: string) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv || !inv.clientEmail)
      throw new BadRequestError("Invoice not found or no client email");

    const freelancer = await userRepository.findById(userId);
    if (!freelancer) throw new NotFoundError("User not found");

    const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date();
    const daysOverdue = Math.max(
      0,
      Math.floor((Date.now() - dueDate.getTime()) / 86_400_000)
    );

    await sendReminderEmail({
      invoice: toEmailData(inv),
      freelancer: {
        name: freelancer.name,
        businessName: freelancer.businessName ?? undefined,
        email: freelancer.email,
      },
      appUrl: APP_URL,
      daysOverdue,
    });

    await invoiceRepository.update(id, {
      remindersSent: (inv.remindersSent ?? 0) + 1,
      lastReminderAt: new Date(),
    });
    await eventRepository.create(
      id,
      "reminder_sent",
      { daysOverdue, to: inv.clientEmail },
      "system"
    );
  },

  async recordPayment(id: string, userId: string, input: RecordPaymentInput) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();

    await invoiceRepository.insertPartialPayment({
      id: ulid(),
      invoiceId: id,
      amount: String(input.amount),
      currency: input.currency,
      note: input.note ?? null,
      paidDate: new Date(input.paidDate),
    });

    const newPaid = parseFloat(String(inv.amountPaid ?? 0)) + input.amount;
    const total = parseFloat(String(inv.total));
    const newStatus = newPaid >= total ? "paid" : "partial";

    await invoiceRepository.update(id, {
      amountPaid: String(newPaid),
      status: newStatus,
      paidDate: newPaid >= total ? new Date(input.paidDate) : null,
    });

    await eventRepository.create(
      id,
      newPaid >= total ? "paid" : "partial_payment",
      { amount: input.amount, note: input.note }
    );

    return { status: newStatus };
  },
};
