import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import invoiceRouter from "./routes";
import { HttpError } from "./lib/errors";
import { auth } from "./auth";

const app = new Hono();

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(
  "*",
  cors({
    origin: clientUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/", (c) => c.json({ message: "Welcome to Invoicin API" }));

// Mount better-auth handler — handles /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

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

const port = Number(process.env.PORT) || 3300;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

export default app;
