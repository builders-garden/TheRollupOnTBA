import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/database";
import {
  tipsTable,
  type CreateTip,
  type Tip,
  type UpdateTip,
} from "@/lib/database/db.schema";

/**
 * Create a new tip configuration
 * @param tipData - The tip data to create
 * @returns The created tip
 */
export const createTip = async (tipData: CreateTip): Promise<Tip> => {
  const [newTip] = await db.insert(tipsTable).values(tipData).returning();

  return newTip;
};

/**
 * Get tip settings by ID
 * @param tipId - The tip settings ID
 * @returns The tip settings or null if not found
 */
export const getTipById = async (tipId: string): Promise<Tip | null> => {
  const tip = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.id, tipId))
    .limit(1);

  return tip[0] || null;
};

/**
 * Get the tip settings for a brand
 * @param brandId - The brand ID
 * @returns The tip settings for the brand or null if not found
 */
export const getTipByBrand = async (brandId: string): Promise<Tip | null> => {
  const tip = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.brandId, brandId))
    .limit(1);

  return tip[0] || null;
};

/**
 * Get tip settings by payout address
 * @param payoutAddress - The payout address to search for
 * @returns The tip settings with the specified payout address or null if not found
 */
export const getTipByPayoutAddress = async (
  payoutAddress: string,
): Promise<Tip | null> => {
  const tip = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutAddress, payoutAddress))
    .limit(1);

  return tip[0] || null;
};

/**
 * Get tip settings by ENS name
 * @param ensName - The ENS name to search for
 * @returns The tip settings with the specified ENS name or null if not found
 */
export const getTipByEnsName = async (ensName: string): Promise<Tip | null> => {
  const tip = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutEnsName, ensName))
    .limit(1);

  return tip[0] || null;
};

/**
 * Get tip settings by Base name
 * @param baseName - The Base name to search for
 * @returns The tip settings with the specified Base name or null if not found
 */
export const getTipByBaseName = async (
  baseName: string,
): Promise<Tip | null> => {
  const tip = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutBaseName, baseName))
    .limit(1);

  return tip[0] || null;
};

/**
 * Update a tip settings
 * @param tipId - The tip ID
 * @param updateData - The data to update
 * @returns The updated tip settings or null if not found
 */
export const updateTip = async (
  tipId: string,
  updateData: UpdateTip,
): Promise<Tip | null> => {
  const [updatedTip] = await db
    .update(tipsTable)
    .set(updateData)
    .where(eq(tipsTable.id, tipId))
    .returning();

  return updatedTip || null;
};

/**
 * Delete a tip settings
 * @param tipId - The tip ID
 * @returns Whether the tip settings was deleted
 */
export const deleteTip = async (tipId: string): Promise<boolean> => {
  const result = await db.delete(tipsTable).where(eq(tipsTable.id, tipId));

  return result.rowsAffected > 0;
};
