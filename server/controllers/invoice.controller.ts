import type { Context } from "hono";
import type { AppEnv } from "../middleware/auth";
import {
  invoiceService,
  type CreateInvoiceInput,
  type InvoiceStatus,
  type RecordPaymentInput,
  type UpdateInvoiceInput,
} from "../services/invoice.service";

export const invoiceController = {
  async list(c: Context<AppEnv>) {
    const userId = c.get("userId");
    const status = c.req.query("status") as InvoiceStatus | undefined;
    const rows = await invoiceService.list(userId, status);
    return c.json(rows);
  },

  async get(c: Context<AppEnv>) {
    const result = await invoiceService.get(
      c.req.param("id") as string,
      c.get("userId")
    );
    return c.json(result);
  },

  async create(c: Context<AppEnv>, input: CreateInvoiceInput) {
    const inv = await invoiceService.create(c.get("userId"), input);
    return c.json(inv, 201);
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
};
