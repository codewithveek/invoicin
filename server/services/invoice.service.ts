import { randomBytes } from "crypto";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";
import { APP_URL } from "../config";
import { db } from "../db";
import { sendInvoiceEmail, sendReminderEmail } from "../email";
import { toEmailData } from "../lib/invoice.utils";
import { BadRequestError, NotFoundError } from "../lib/errors";
import { generateInvoiceId, generateLinkId } from "../helpers";
import { eventRepository } from "../repositories/event.repository";
import {
  invoiceRepository,
  type InvoiceStatus,
} from "../repositories/invoice.repository";
import { userRepository } from "../repositories/user.repository";
import { invoices, invoiceEvents, partialPayments } from "../schema";

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
  // NOTE: total is no longer accepted from the client — computed server-side
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

export interface DisputeInvoiceInput {
  reason?: string;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
}

export const invoiceService = {
  async list(userId: string, status?: InvoiceStatus, options?: ListOptions) {
    return invoiceRepository.findAllByUser(
      userId,
      status,
      options?.limit,
      options?.offset
    );
  },

  async get(id: string, userId: string) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();
    const [events, payments] = await Promise.all([
      invoiceRepository.findEvents(id),
      invoiceRepository.findPartialPayments(id),
    ]);
    return { ...inv, events, payments };
  },

  async create(userId: string, input: CreateInvoiceInput) {
    // Compute totals server-side — never trust client-supplied total
    const subtotal = +input.items
      .reduce((s, i) => s + i.price * i.qty, 0)
      .toFixed(2);
    const taxAmt =
      input.taxRate != null
        ? +((subtotal * input.taxRate) / 100).toFixed(2)
        : +(input.taxAmount ?? 0).toFixed(2);
    const gross = +(subtotal + taxAmt).toFixed(2);
    const depositRate = input.deposit ?? 0;
    const computedTotal =
      depositRate > 0 ? +((gross * depositRate) / 100).toFixed(2) : gross;

    const inv = {
      id: generateInvoiceId(),
      // Use 16 random bytes (128-bit entropy) for the public share token
      linkId: generateLinkId(),
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
      taxAmount: String(taxAmt),
      deposit: String(depositRate),
      total: String(computedTotal),
      homeRate: null,
      homeTotal: null,
      homeCurrency: null,
      items: input.items,
      dueDate: input.dueDate ?? null,
      terms: input.terms ?? null,
      notes: input.notes ?? null,
      issueDate: new Date(new Date().toISOString().split("T")[0]),
    };
    // Atomically insert invoice + creation event
    await db.transaction(async (tx) => {
      await tx.insert(invoices).values(inv);
      await tx.insert(invoiceEvents).values({
        id: ulid(),
        invoiceId: inv.id,
        type: "created",
        meta: null,
        actor: "user",
      });
    });
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

    // Atomically update status + log event; send email only after DB succeeds
    await db.transaction(async (tx) => {
      await tx
        .update(invoices)
        .set({ status: "sent", updatedAt: new Date() })
        .where(eq(invoices.id, id));
      await tx.insert(invoiceEvents).values({
        id: ulid(),
        invoiceId: id,
        type: "sent",
        meta: { to: inv.clientEmail },
        actor: "user",
      });
    });

    await sendInvoiceEmail({
      invoice: toEmailData({ ...inv, status: "sent" }),
      freelancer: {
        name: freelancer.name,
        businessName: freelancer.businessName ?? undefined,
        email: freelancer.email,
      },
      appUrl: APP_URL,
    });
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

    // Update DB atomically first, then send the reminder email
    await db.transaction(async (tx) => {
      await tx
        .update(invoices)
        .set({
          remindersSent: (inv.remindersSent ?? 0) + 1,
          lastReminderAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id));
      await tx.insert(invoiceEvents).values({
        id: ulid(),
        invoiceId: id,
        type: "reminder_sent",
        meta: { daysOverdue, to: inv.clientEmail },
        actor: "system",
      });
    });

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
  },

  async recordPayment(id: string, userId: string, input: RecordPaymentInput) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();

    const newPaid = +(
      parseFloat(String(inv.amountPaid ?? 0)) + input.amount
    ).toFixed(2);
    const total = parseFloat(String(inv.total));
    const newStatus = newPaid >= total ? "paid" : "partial";

    // Atomically record the payment, update invoice balance, and log event
    await db.transaction(async (tx) => {
      await tx.insert(partialPayments).values({
        id: ulid(),
        invoiceId: id,
        amount: String(input.amount),
        currency: input.currency,
        note: input.note ?? null,
        paidDate: new Date(input.paidDate),
      });
      await tx
        .update(invoices)
        .set({
          amountPaid: String(newPaid),
          status: newStatus,
          paidDate: newPaid >= total ? new Date(input.paidDate) : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id));
      await tx.insert(invoiceEvents).values({
        id: ulid(),
        invoiceId: id,
        type: newPaid >= total ? "paid" : "partial_payment",
        meta: { amount: input.amount, note: input.note },
        actor: "user",
      });
    });

    return { status: newStatus };
  },

  async dispute(id: string, userId: string, input: DisputeInvoiceInput) {
    const inv = await invoiceRepository.findByIdAndUser(id, userId);
    if (!inv) throw new NotFoundError();

    await db.transaction(async (tx) => {
      await tx
        .update(invoices)
        .set({ status: "disputed", updatedAt: new Date() })
        .where(eq(invoices.id, id));
      await tx.insert(invoiceEvents).values({
        id: ulid(),
        invoiceId: id,
        type: "disputed",
        meta: input.reason ? { reason: input.reason } : null,
        actor: "user",
      });
    });
  },
};
