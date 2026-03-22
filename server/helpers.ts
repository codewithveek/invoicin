// ─────────────────────────────────────────────────────────────────────────────
// Shared server-side helpers — pure utility functions only.
// DB access belongs in repositories/; business logic belongs in services/.
// ─────────────────────────────────────────────────────────────────────────────

/** Generates a human-readable invoice ID, e.g. INV-2026-4321 */
export function generateInvoiceId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000 + 1000));
  return `INV-${year}-${num}`;
}
