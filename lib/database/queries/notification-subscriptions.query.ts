import { and, count, eq } from "drizzle-orm";
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

/**
 * Get a subscription by user ID
 * @param userId - The user ID
 * @returns The subscription or null if the subscription is not found
 */
export const getSubscriptionByUserIdAndBrandId = async (
  userId: string,
  brandId: string,
) => {
  const result = await db.query.notificationSubscriptionsTable.findFirst({
    where: and(
      eq(notificationSubscriptionsTable.userId, userId),
      eq(notificationSubscriptionsTable.brandId, brandId),
    ),
  });
  if (!result) return null;
  return result;
};

/**
 * Create a notification subscription
 * @param brandId - The brand ID
 * @param userId - The user ID
 * @returns The created notification subscription
 */
export const createNotificationSubscription = async (
  brandId: string,
  userId: string,
) => {
  const result = await db.insert(notificationSubscriptionsTable).values({
    brandId,
    userId,
  });
  return result;
};

/**
 * Delete a notification subscription
 * @param brandId - The brand ID
 * @param userId - The user ID
 * @returns The deleted notification subscription
 */
export const deleteNotificationSubscription = async (
  brandId: string,
  userId: string,
) => {
  const result = await db
    .delete(notificationSubscriptionsTable)
    .where(
      and(
        eq(notificationSubscriptionsTable.brandId, brandId),
        eq(notificationSubscriptionsTable.userId, userId),
      ),
    );
  return result;
};
