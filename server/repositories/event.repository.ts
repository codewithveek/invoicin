import { ulid } from "ulid";
import { db } from "../db";
import { invoiceEvents } from "../schema";

export type EventType = NonNullable<
  (typeof invoiceEvents.$inferInsert)["type"]
>;
export type EventActor = "user" | "client" | "system";

export const eventRepository = {
  async create(
    invoiceId: string,
    type: EventType,
    meta: object | null = null,
    actor: EventActor = "user"
  ): Promise<void> {
    await db
      .insert(invoiceEvents)
      .values({ id: ulid(), invoiceId, type, meta, actor });
  },
};
