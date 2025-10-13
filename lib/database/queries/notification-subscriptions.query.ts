import { count, eq } from "drizzle-orm";
import { db } from "..";
import { notificationSubscriptionsTable } from "../db.schema";

/**
 * Count notification subscriptions by brand
 * @param brandId - The brand ID
 * @returns Number of notification subscriptions for the brand
 */
export const countNotificationSubscriptionsByBrand = async (
  brandId: string,
): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(notificationSubscriptionsTable)
    .where(eq(notificationSubscriptionsTable.brandId, brandId));

  return result[0]?.count || 0;
};
