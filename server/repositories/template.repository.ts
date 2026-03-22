import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { invoiceTemplates } from "../schema";
import type { InvoiceTemplate } from "../schema/types";

export type NewTemplate = typeof invoiceTemplates.$inferInsert;

export const templateRepository = {
  async findAllByUser(userId: string): Promise<InvoiceTemplate[]> {
    return db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.userId, userId));
  },

  async create(data: NewTemplate): Promise<void> {
    await db.insert(invoiceTemplates).values(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(invoiceTemplates)
      .where(
        and(eq(invoiceTemplates.id, id), eq(invoiceTemplates.userId, userId))
      );
  },
};
