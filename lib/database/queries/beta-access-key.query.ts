import { eq } from "drizzle-orm";
import { db } from "..";
import { BetaAccessKey, betaAccessKeysTable } from "../db.schema";

/**
 * Get a beta access key
 * @param key - The beta access key
 * @returns The beta access key
 */
export const getBetaAccessKey = async (
  key: string,
): Promise<BetaAccessKey | null> => {
  const [betaAccessKey] = await db
    .select()
    .from(betaAccessKeysTable)
    .where(eq(betaAccessKeysTable.key, key))
    .limit(1);
  return betaAccessKey || null;
};

/**
 * Set a beta access key as used
 * @param key - The beta access key
 * @returns The beta access key
 */
export const setBetaAccessKeyUsed = async (
  key: string,
): Promise<BetaAccessKey | null> => {
  const [betaAccessKey] = await db
    .update(betaAccessKeysTable)
    .set({ used: true })
    .where(eq(betaAccessKeysTable.key, key))
    .returning();
  return betaAccessKey || null;
};
