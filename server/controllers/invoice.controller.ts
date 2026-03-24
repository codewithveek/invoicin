import type { Context } from "hono";
import type { AppEnv } from "../middleware/auth";
import {
  invoiceService,
  type CreateInvoiceInput,
  type InvoiceStatus,
  type RecordPaymentInput,
  type UpdateInvoiceInput,
} from "../services/invoice.service";
import { generateInvoicePDF } from "../pdf";
import { userRepository } from "../repositories/user.repository";
import { formatInvoice } from "../lib/invoice.utils";

export const invoiceController = {
  async list(c: Context<AppEnv>) {
    const userId = c.get("userId");
    const status = c.req.query("status") as InvoiceStatus | undefined;
    const rows = await invoiceService.list(userId, status);
    return c.json(rows.map((r) => formatInvoice(r as Record<string, unknown>)));
  },

  async get(c: Context<AppEnv>) {
    const result = await invoiceService.get(
      c.req.param("id") as string,
      c.get("userId")
    );
    return c.json(formatInvoice(result as unknown as Record<string, unknown>));
  },

  async create(c: Context<AppEnv>, input: CreateInvoiceInput) {
    const inv = await invoiceService.create(c.get("userId"), input);
    return c.json(
      formatInvoice(inv as unknown as Record<string, unknown>),
      201
    );
  },

  async update(c: Context<AppEnv>, input: UpdateInvoiceInput) {
    await invoiceService.update(
      c.req.param("id") as string,
      c.get("userId"),
      input
    );
    return c.json({ success: true });
  },

  async send(c: Context<AppEnv>) {
    await invoiceService.send(c.req.param("id") as string, c.get("userId"));
    return c.json({ success: true });
  },

  async remind(c: Context<AppEnv>) {
    await invoiceService.remind(c.req.param("id") as string, c.get("userId"));
    return c.json({ success: true });
  },

  async recordPayment(c: Context<AppEnv>, input: RecordPaymentInput) {
    const result = await invoiceService.recordPayment(
      c.req.param("id") as string,
      c.get("userId"),
      input
    );
    return c.json({ success: true, ...result });
  },

  async downloadPdf(c: Context<AppEnv>) {
    const inv = await invoiceService.get(
      c.req.param("id") as string,
      c.get("userId")
    );
    const user = await userRepository.findById(c.get("userId"));
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
    return c.body(buffer);
  },
};
