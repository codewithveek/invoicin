import { timingSafeEqual } from "crypto";
import type { Context } from "hono";
import { ForbiddenError } from "../lib/errors";
import { internalService } from "../services/internal.service";

/** Constant-time string comparison to resist timing attacks. */
function safeStringEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export const internalController = {
  async overdueCheck(c: Context) {
    const secret = c.req.header("x-cron-secret") ?? "";
    const expected = process.env.CRON_SECRET ?? "";
    if (!expected || !safeStringEqual(secret, expected))
      throw new ForbiddenError();
    const result = await internalService.runOverdueCheck();
    return c.json(result);
  },
};
