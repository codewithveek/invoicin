import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { timeout } from "hono/timeout";
import invoiceRouter from "./routes";
import { HttpError } from "./lib/errors";
import { auth } from "./auth";
import { db } from "./db";

// ── Startup: fail fast on missing required env vars ───────────────────────────
const REQUIRED_ENV = ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = new Hono();

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_REQUESTS = 30; // requests per window per IP

app.use("*", async (c, next) => {
  const ip =
    (c.req.header("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }
  return next();
});

// Evict stale rate-limit entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000).unref();

app.use(
  "*",
  cors({
    origin: clientUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// 30-second request timeout
app.use("*", timeout(30_000));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", async (c) => {
  try {
    await db.execute("SELECT 1");
    return c.json({ status: "ok" });
  } catch {
    return c.json({ status: "degraded", reason: "db" }, 503);
  }
});

app.get("/", (c) => c.json({ message: "Welcome to Invoicin API" }));

// Mount better-auth handler — handles /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const response = await auth.handler(c.req.raw);
  return new Response(response.body, response);
});

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

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal: string) {
  console.log(`[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  // Force-exit after 10 s if connections won't close
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
