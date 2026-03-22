// ─────────────────────────────────────────────────────────────────────────────
// Public invoice routes — no auth, client-facing share links
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { invoicePublicController } from "../controllers/invoicePublic.controller";

export const invoicesPublicRouter = new Hono();

invoicesPublicRouter.get("/:linkId", (c) => invoicePublicController.view(c));
invoicesPublicRouter.post("/:linkId/confirm", (c) =>
  invoicePublicController.confirmPayment(c)
);
invoicesPublicRouter.post("/:linkId/download", (c) =>
  invoicePublicController.trackDownload(c)
);
