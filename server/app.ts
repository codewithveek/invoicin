import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import invoiceRouter from "./routes";
import { HttpError } from "./lib/errors";

const app = new Hono();

app.use("*", cors());
app.get("/", (c) => c.json({ message: "Welcome to Invoicin API" }));
app.route("/api", invoiceRouter);

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { error: err.message },
      err.statusCode as 400 | 401 | 403 | 404 | 500
    );
  }
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

export default app;
