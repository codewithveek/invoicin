import type { Context } from "hono";
import { ForbiddenError } from "../lib/errors";
import { internalService } from "../services/internal.service";

export const internalController = {
  async overdueCheck(c: Context) {
    const secret = c.req.header("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) throw new ForbiddenError();
    const result = await internalService.runOverdueCheck();
    return c.json(result);
  },
};
