import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as dbSchema from "@/lib/database/db.schema";
import * as relations from "@/lib/database/relations";
import { env } from "@/lib/zod";

export const tursoClient = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_DATABASE_TOKEN,
});

export const db = drizzle(tursoClient, {
  schema: { ...dbSchema, ...relations },
});
