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

// Fallback rates (all vs USD) in case FX_API_KEY is absent
const USD_BASE: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.55,
  NGN: 1618.5,
  GHS: 15.7,
  KES: 129.5,
  ZAR: 18.4,
  EGP: 50.5,
  UGX: 3750,
  TZS: 2640,
  XOF: 603,
};

function fallbackRate(from: string, to: string) {
  if (from === to) return 1;
  const f = USD_BASE[from] ?? 1;
  const t = USD_BASE[to] ?? 1;
  return t / f;
}

const invoiceRouter = new Hono();

// GET /api/rates?from=USD&to=NGN — returns the current exchange rate
invoiceRouter.get("/rates", async (c) => {
  const from = (c.req.query("from") || "USD").toUpperCase();
  const to = (c.req.query("to") || "NGN").toUpperCase();

  const apiKey = process.env.FX_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
      );
      const data = (await res.json()) as {
        result?: string;
        conversion_rate?: number;
      };
      if (data.result === "success" && data.conversion_rate != null) {
        return c.json({ from, to, rate: data.conversion_rate });
      }
    } catch {
      // fall through to static fallback
    }
  }

  return c.json({ from, to, rate: fallbackRate(from, to) });
});

invoiceRouter.route("/invoices", invoicesRouter);
invoiceRouter.route("/i", invoicesPublicRouter);
invoiceRouter.route("/clients", clientsRouter);
invoiceRouter.route("/templates", templatesRouter);
invoiceRouter.route("/internal", internalRouter);

export { invoiceRouter };
export default invoiceRouter;
