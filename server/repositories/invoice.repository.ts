import { and, desc, eq, inArray, lte } from "drizzle-orm";
import { db } from "../db";
import { invoiceEvents, invoices, partialPayments } from "../schema";
import type { Invoice, InvoiceEvent, NewInvoice } from "../schema/types";

export type InvoiceStatus = NonNullable<Invoice["status"]>;
export type InvoiceUpdateData = Partial<typeof invoices.$inferInsert>;

export const invoiceRepository = {
  async findAllByUser(
    userId: string,
    status?: InvoiceStatus,
    limit = 50,
    offset = 0
  ): Promise<Invoice[]> {
    const conditions = status
      ? and(eq(invoices.userId, userId), eq(invoices.status, status))
      : eq(invoices.userId, userId);
    return db
      .select()
      .from(invoices)
      .where(conditions)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findByIdAndUser(id: string, userId: string): Promise<Invoice | null> {
    const [inv] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return inv ?? null;
  },

  async findByLinkId(linkId: string): Promise<Invoice | null> {
    const [inv] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.linkId, linkId));
    return inv ?? null;
  },

  async findOverdueCandidates(upToDate: Date): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(
        and(
          inArray(invoices.status, ["sent", "viewed"]),
          lte(invoices.dueDate, upToDate)
        )
      );
  },

  async create(data: NewInvoice): Promise<void> {
    await db.insert(invoices).values(data);
  },

  async update(id: string, data: InvoiceUpdateData): Promise<void> {
    await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id));
  },

  async findEvents(invoiceId: string): Promise<InvoiceEvent[]> {
    return db
      .select()
      .from(invoiceEvents)
      .where(eq(invoiceEvents.invoiceId, invoiceId))
      .orderBy(desc(invoiceEvents.createdAt));
  },

  async insertPartialPayment(
    data: typeof partialPayments.$inferInsert
  ): Promise<void> {
    await db.insert(partialPayments).values(data);
  },

  async findPartialPayments(invoiceId: string) {
    return db
      .select()
      .from(partialPayments)
      .where(eq(partialPayments.invoiceId, invoiceId))
      .orderBy(desc(partialPayments.createdAt));
  },
};
