// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — main Hono router
//
// Mount in your entry point:
//   import invoiceRouter from "./index";
//   app.route("/api", invoiceRouter);
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { invoicesRouter } from "./routes/invoices";
import { invoicesPublicRouter } from "./routes/invoicesPublic";
import { clientsRouter } from "./routes/clients";
import { templatesRouter } from "./routes/templates";
import { internalRouter } from "./routes/internal";

const invoiceRouter = new Hono();

invoiceRouter.route("/invoices", invoicesRouter);
invoiceRouter.route("/i", invoicesPublicRouter);
invoiceRouter.route("/clients", clientsRouter);
invoiceRouter.route("/templates", templatesRouter);
invoiceRouter.route("/internal", internalRouter);

export { invoiceRouter };
export default invoiceRouter;
