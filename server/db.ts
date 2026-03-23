// ─────────────────────────────────────────────────────────────────────────────
// Database connection — Drizzle ORM + MySQL────────────────────────────────────────────────────────────────────────────
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: true },
});

export const db = drizzle(pool, { schema, mode: "planetscale" });
