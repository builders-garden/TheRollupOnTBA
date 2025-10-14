import { desc, eq, sql } from "drizzle-orm";
import { db } from "..";
import { brandNotificationsTable, CreateBrandNotification } from "../db.schema";

/**
 * Get brand notifications by brand ID
 * @param brandId - The brand ID
 * @param limit - The limit number
 * @param offset - The offset number
 * @returns The brand notifications
 */
export const getBrandNotificationsByBrandId = async (
  brandId: string,
  limit: number,
  offset: number,
) => {
  const result = await db
    .select()
    .from(brandNotificationsTable)
    .where(eq(brandNotificationsTable.brandId, brandId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(brandNotificationsTable.createdAt));
  return result;
};

/**
 * Get brand notifications count by brand ID
 * @param brandId - The brand ID
 * @returns The brand notifications count
 */
export const getBrandNotificationsCountByBrandId = async (brandId: string) => {
  const [{ count }] = await db
    .select({
      count: sql<number>`count(distinct ${brandNotificationsTable.id})`,
    })
    .from(brandNotificationsTable)
    .where(eq(brandNotificationsTable.brandId, brandId));
  return count || 0;
};

/**
 * Create a brand notification
 * @param data - The data to create the brand notification
 * @returns The created brand notification
 */
export const createBrandNotification = async (
  data: CreateBrandNotification,
) => {
  const result = await db.insert(brandNotificationsTable).values(data);
  return result;
};
