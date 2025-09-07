import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/database";
import {
  brandsTable,
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
 * Get a tip by ID
 * @param tipId - The tip ID
 * @returns The tip or null if not found
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
 * Get all tips for a brand
 * @param brandId - The brand ID
 * @returns Array of tips for the brand
 */
export const getTipsByBrand = async (brandId: string): Promise<Tip[]> => {
  return await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.brandId, brandId))
    .orderBy(desc(tipsTable.createdAt));
};

/**
 * Get all tips with brand information
 * @param limit - Optional limit for results
 * @returns Array of tips with brand data
 */
export const getAllTipsWithBrand = async (limit?: number) => {
  const query = db
    .select({
      tip: tipsTable,
      brand: brandsTable,
    })
    .from(tipsTable)
    .innerJoin(brandsTable, eq(tipsTable.brandId, brandsTable.id))
    .orderBy(desc(tipsTable.createdAt));

  return limit ? await query.limit(limit) : await query;
};

/**
 * Get tips by payout address
 * @param payoutAddress - The payout address to search for
 * @returns Array of tips with the specified payout address
 */
export const getTipsByPayoutAddress = async (
  payoutAddress: string,
): Promise<Tip[]> => {
  return await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutAddress, payoutAddress))
    .orderBy(desc(tipsTable.createdAt));
};

/**
 * Get tips by ENS name
 * @param ensName - The ENS name to search for
 * @returns Array of tips with the specified ENS name
 */
export const getTipsByEnsName = async (ensName: string): Promise<Tip[]> => {
  return await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutEnsName, ensName))
    .orderBy(desc(tipsTable.createdAt));
};

/**
 * Get tips by Base name
 * @param baseName - The Base name to search for
 * @returns Array of tips with the specified Base name
 */
export const getTipsByBaseName = async (baseName: string): Promise<Tip[]> => {
  return await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.payoutBaseName, baseName))
    .orderBy(desc(tipsTable.createdAt));
};

/**
 * Update a tip
 * @param tipId - The tip ID
 * @param updateData - The data to update
 * @returns The updated tip or null if not found
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
 * Delete a tip
 * @param tipId - The tip ID
 * @returns Whether the tip was deleted
 */
export const deleteTip = async (tipId: string): Promise<boolean> => {
  const result = await db.delete(tipsTable).where(eq(tipsTable.id, tipId));

  return result.rowsAffected > 0;
};

/**
 * Get recent tips
 * @param limit - Number of recent tips to get (default: 10)
 * @returns Array of recent tips
 */
export const getRecentTips = async (limit = 10): Promise<Tip[]> => {
  return await db
    .select()
    .from(tipsTable)
    .orderBy(desc(tipsTable.createdAt))
    .limit(limit);
};

/**
 * Count tips by brand
 * @param brandId - The brand ID
 * @returns Number of tips for the brand
 */
export const countTipsByBrand = async (brandId: string): Promise<number> => {
  const result = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.brandId, brandId));

  return result.length;
};
