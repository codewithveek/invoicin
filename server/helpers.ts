// ─────────────────────────────────────────────────────────────────────────────
// Shared server-side helpers
// ─────────────────────────────────────────────────────────────────────────────

import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "./db";
import { users, invoiceEvents } from "./schema";

export type EventActor = "user" | "client" | "system";

/** Generates a human-readable invoice ID, e.g. INV-2026-4321 */
export function generateInvoiceId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000 + 1000));
  return `INV-${year}-${num}`;
}

/** Appends an event to the invoice event log */
export async function logEvent(
  invoiceId: string,
  type: (typeof invoiceEvents.$inferInsert)["type"],
  meta?: object,
  actor: EventActor = "user"
): Promise<void> {
  await db.insert(invoiceEvents).values({
    id: ulid(),
    invoiceId,
    type,
    meta: meta ?? null,
    actor,
  });
}

/** Fetches the freelancer (user) row — returns undefined if not found */
export async function getFreelancer(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}
