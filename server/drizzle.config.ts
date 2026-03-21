import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  out: "./drizzle",
  schema: "./schema",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
