// ─────────────────────────────────────────────────────────────────────────────
// InvoiceApp — main Hono router
//
// Mount in your entry point:
//   import invoiceRouter from "./index";
//   app.route("/api", invoiceRouter);
// ─────────────────────────────────────────────────────────────────────────────

import { Hono } from "hono";
import { invoicesRouter } from "./invoices";
import { invoicesPublicRouter } from "./invoicesPublic";
import { clientsRouter } from "./clients";
import { templatesRouter } from "./templates";
import { internalRouter } from "./internal";

const invoiceRouter = new Hono();

invoiceRouter.route("/invoices", invoicesRouter);
invoiceRouter.route("/i", invoicesPublicRouter);
invoiceRouter.route("/clients", clientsRouter);
invoiceRouter.route("/templates", templatesRouter);
invoiceRouter.route("/internal", internalRouter);

export { invoiceRouter };
export default invoiceRouter;
