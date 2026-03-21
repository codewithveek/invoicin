import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import invoiceRouter from "./routes";

const app = new Hono();

app.use("*", cors());
app.route("/api", invoiceRouter);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

export default app;
