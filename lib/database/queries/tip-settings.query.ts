import { eq } from "drizzle-orm";
import { db } from "@/lib/database";
import {
  tipSettingsTable,
  type CreateTipSettings,
  type TipSettings,
  type UpdateTipSettings,
} from "@/lib/database/db.schema";

/**
 * Create a new tip settings
 * @param tipData - The tip settings data to create
 * @returns The created tip
 */
export const createTipSettings = async (
  tipData: CreateTipSettings,
): Promise<TipSettings> => {
  const [newTipSettings] = await db
    .insert(tipSettingsTable)
    .values(tipData)
    .returning();

  return newTipSettings;
};

/**
 * Get tip settings by ID
 * @param tipId - The tip settings ID
 * @returns The tip settings or null if not found
 */
export const getTipSettingsById = async (
  tipId: string,
): Promise<TipSettings | null> => {
  const tipSettings = await db
    .select()
    .from(tipSettingsTable)
    .where(eq(tipSettingsTable.id, tipId))
    .limit(1);

  return tipSettings[0] || null;
};

/**
 * Get the tip settings for a brand
 * @param brandId - The brand ID
 * @returns The tip settings for the brand or null if not found
 */
export const getTipSettingsByBrand = async (
  brandId: string,
): Promise<TipSettings | null> => {
  const tipSettings = await db
    .select()
    .from(tipSettingsTable)
    .where(eq(tipSettingsTable.brandId, brandId))
    .limit(1);

  return tipSettings[0] || null;
};

/**
 * Get tip settings by payout address
 * @param payoutAddress - The payout address to search for
 * @returns The tip settings with the specified payout address or null if not found
 */
export const getTipSettingsByPayoutAddress = async (
  payoutAddress: string,
): Promise<TipSettings | null> => {
  const tipSettings = await db
    .select()
    .from(tipSettingsTable)
    .where(eq(tipSettingsTable.payoutAddress, payoutAddress))
    .limit(1);

  return tipSettings[0] || null;
};

/**
 * Get tip settings by ENS name
 * @param ensName - The ENS name to search for
 * @returns The tip settings with the specified ENS name or null if not found
 */
export const getTipSettingsByEnsName = async (
  ensName: string,
): Promise<TipSettings | null> => {
  const tipSettings = await db
    .select()
    .from(tipSettingsTable)
    .where(eq(tipSettingsTable.payoutEnsName, ensName))
    .limit(1);

  return tipSettings[0] || null;
};

/**
 * Get tip settings by Base name
 * @param baseName - The Base name to search for
 * @returns The tip settings with the specified Base name or null if not found
 */
export const getTipSettingsByBaseName = async (
  baseName: string,
): Promise<TipSettings | null> => {
  const tipSettings = await db
    .select()
    .from(tipSettingsTable)
    .where(eq(tipSettingsTable.payoutBaseName, baseName))
    .limit(1);

  return tipSettings[0] || null;
};

/**
 * Update a tip settings
 * @param tipId - The tip settings ID
 * @param updateData - The data to update
 * @returns The updated tip settings or null if not found
 */
export const updateTipSettings = async (
  tipId: string,
  updateData: UpdateTipSettings,
): Promise<TipSettings | null> => {
  const [updatedTipSettings] = await db
    .update(tipSettingsTable)
    .set(updateData)
    .where(eq(tipSettingsTable.id, tipId))
    .returning();

  return updatedTipSettings || null;
};

/**
 * Delete a tip settings
 * @param tipId - The tip settings ID
 * @returns Whether the tip settings was deleted successfully
 */
export const deleteTipSettings = async (tipId: string): Promise<boolean> => {
  const result = await db
    .delete(tipSettingsTable)
    .where(eq(tipSettingsTable.id, tipId));

  return result.rowsAffected > 0;
};
