// ─────────────────────────────────────────────────────────────────────────────
// Shared server-side helpers — pure utility functions only.
// DB access belongs in repositories/; business logic belongs in services/.
// ─────────────────────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";

/**
 * Generates a human-readable invoice ID, e.g. INV-2026-3F9A1B2E
 * Uses 4 cryptographically random bytes (32-bit entropy, ~4 billion values/year).
 */
export function generateInvoiceId(): string {
  const year = new Date().getFullYear();
  const hex = randomBytes(4).toString("hex").toUpperCase();
  return `INV-${year}-${hex}`;
}
export function generateLinkId(): string {
  const hex = randomBytes(16).toString("hex");
  return `${hex}`;
}
