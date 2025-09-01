import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

export default {
  schema: "./lib/database/db.schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_DATABASE_TOKEN!,
  },
} satisfies Config;
