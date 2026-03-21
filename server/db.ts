// ─────────────────────────────────────────────────────────────────────────────
// Database connection — Drizzle ORM + MySQL
// Install: npm install drizzle-orm mysql2
// Set DATABASE_URL in your environment, e.g.:
//   DATABASE_URL=mysql://user:pass@localhost:3306/invoicedb
// ─────────────────────────────────────────────────────────────────────────────

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle(pool, { schema, mode: "planetscale" });
