import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { clients } from "../schema";
import type { Client, NewClient } from "../schema/types";

export const clientRepository = {
  async findAllByUser(userId: string): Promise<Client[]> {
    return db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(asc(clients.name));
  },

  async create(data: NewClient): Promise<void> {
    await db.insert(clients).values(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
  },

  async update(
    id: string,
    userId: string,
    data: Partial<
      Pick<Client, "name" | "email" | "address" | "phone" | "company" | "notes">
    >
  ): Promise<void> {
    await db
      .update(clients)
      .set(data)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
  },

  async findById(id: string, userId: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return row ?? null;
  },
};
