import { eq } from "drizzle-orm";
import { db } from "..";
import { CreateTip, Tip, tipsTable } from "../db.schema";

/**
 * Create a new tip
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
 * Get tips by brand ID
 * @param brandId - The brand ID
 * @returns The tips
 */
export const getTipsByBrandId = async (brandId: string): Promise<Tip[]> => {
  const tips = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.receiverBrandId, brandId));
  return tips;
};

/**
 * Get tips by sender ID
 * @param senderId - The sender ID
 * @returns The tips
 */
export const getTipsBySenderId = async (senderId: string): Promise<Tip[]> => {
  const tips = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.senderId, senderId));
  return tips;
};

/**
 * Get tips by receiver address
 * @param receiverAddress - The receiver address
 * @returns The tips
 */
export const getTipsByReceiverAddress = async (
  receiverAddress: string,
): Promise<Tip[]> => {
  const tips = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.receiverAddress, receiverAddress));
  return tips;
};

/**
 * Get tips by receiver Base name
 * @param receiverBaseName - The receiver Base name
 * @returns The tips
 */
export const getTipsByReceiverBaseName = async (
  receiverBaseName: string,
): Promise<Tip[]> => {
  const tips = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.receiverBaseName, receiverBaseName));
  return tips;
};

/**
 * Get tips by receiver ENS name
 * @param receiverEnsName - The receiver ENS name
 * @returns The tips
 */
export const getTipsByReceiverEnsName = async (
  receiverEnsName: string,
): Promise<Tip[]> => {
  const tips = await db
    .select()
    .from(tipsTable)
    .where(eq(tipsTable.receiverEnsName, receiverEnsName));
  return tips;
};
