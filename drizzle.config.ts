import dotenv from "dotenv";
import type { Config } from "drizzle-kit";
import { env } from "@/lib/env";

dotenv.config({
  path: ".env",
});

export default {
  schema: "./src/lib/database/db.schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_DATABASE_TOKEN,
  },
} satisfies Config;
